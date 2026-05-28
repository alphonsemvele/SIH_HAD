import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LigneResultat { parametre: string; valeur: string; unite: string|null; valeur_reference: string|null; interpretation: 'normal'|'bas'|'eleve'; }
interface Analyse {
    id: number; numero: string;
    patient: { id: number; nom: string; prenom: string; sexe: string };
    type: string|null; categorie: string|null; prescripteur: string|null;
    technicien: string|null; biologiste: string|null;
    statut: 'prescrit'|'preleve'|'en_cours'|'resultat_disponible'|'valide'|'annule';
    urgent: boolean;
    date_prescription: string|null; date_prelevement: string|null; date_resultat: string|null;
    resultat: LigneResultat[]; interpretation: string|null; conclusion: string|null;
    commentaire_medecin: string|null;
}
interface TypeAnalyse { id: number; nom: string; categorie: string|null }
interface Patient     { id: number; nom: string; prenom: string; sexe: string; date_naissance: string }
interface Medecin     { id: number; name: string }
interface Props {
    analyses: { data: Analyse[]; total: number; last_page: number; links: any[] };
    stats: { total: number; en_attente: number; en_cours: number; termines: number; urgents: number };
    typesAnalyses: TypeAnalyse[]; categories: string[]; patients: Patient[]; medecins: Medecin[];
    filters: { search?: string; categorie?: string; statut?: string; urgent?: string };
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const STATUTS = ['prescrit','preleve','en_cours','resultat_disponible','valide','annule'] as const;
const STATUT_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    prescrit:            { label:'Prescrit',        color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
    preleve:             { label:'Prélevé',         color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
    en_cours:            { label:'En cours',        color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    resultat_disponible: { label:'Résultat dispo',  color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    valide:              { label:'Validé',          color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    annule:              { label:'Annulé',          color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};

const INTERP_CFG = {
    normal: { color:'#16a34a', bg:'#f0fdf4', label:'✓ Normal' },
    bas:    { color:'#2563eb', bg:'#eff6ff', label:'↓ Bas' },
    eleve:  { color:'#dc2626', bg:'#fef2f2', label:'↑ Élevé' },
};

const iSx: React.CSSProperties = { width:'100%', height:36, padding:'0 10px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function MModal({ children, onClose, maxW=680 }: { children: React.ReactNode; onClose:()=>void; maxW?: number }) {
    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:maxW, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {children}
            </div>
        </div>
    );
}
function MHead({ title, sub, onClose, extra }: { title: React.ReactNode; sub?: React.ReactNode; onClose:()=>void; extra?: React.ReactNode }) {
    return (
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
            <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px', display:'flex', alignItems:'center', gap:8 }}>{title}</h2>
                {sub && <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{sub}</p>}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {extra}
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
    );
}
function Badge({ statut }: { statut: string }) {
    const s = STATUT_CFG[statut] ?? STATUT_CFG.annule;
    return <span style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{s.label}</span>;
}
function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}><div style={{ width:3, height:13, borderRadius:100, background:color }}/><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span></div>;
}

// ─── Modal Nouvelle Demande ───────────────────────────────────────────────────

function NouvelleDemande({ typesAnalyses, patients, medecins, onClose }: { typesAnalyses: TypeAnalyse[]; patients: Patient[]; medecins: Medecin[]; onClose:()=>void }) {
    const [form, setForm] = useState({ patient_id:'', type_examen_id:'', medecin_prescripteur_id:'', urgent:false, commentaire_medecin:'' });
    const [processing, setProcessing] = useState(false);
    const submit = (e: React.FormEvent) => { e.preventDefault(); setProcessing(true); router.post('/laboratoire', form as any, { onFinish:()=>setProcessing(false), onSuccess:onClose }); };
    const iSxLg: React.CSSProperties = { ...iSx, height:40, fontSize:13 };
    return (
        <MModal onClose={onClose} maxW={580}>
            <MHead title={<>🧪 Nouvelle demande d'analyse</>} sub="Prescription d'examens biologiques" onClose={onClose}/>
            <form onSubmit={submit} style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                    <SLabel label="Patient" color="#3b82f6"/>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Patient *</label>
                    <select value={form.patient_id} onChange={e=>setForm(f=>({...f,patient_id:e.target.value}))} required style={iSxLg} onFocus={fIn} onBlur={fOut}>
                        <option value="">Sélectionner un patient…</option>
                        {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom} — {p.date_naissance} ({p.sexe})</option>)}
                    </select>
                </div>
                <div>
                    <SLabel label="Examen" color="#059669"/>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Type d'analyse *</label>
                    <select value={form.type_examen_id} onChange={e=>setForm(f=>({...f,type_examen_id:e.target.value}))} required style={iSxLg} onFocus={fIn} onBlur={fOut}>
                        <option value="">Sélectionner…</option>
                        {typesAnalyses.map(t=><option key={t.id} value={t.id}>{t.categorie?`[${t.categorie}] `:''}{t.nom}</option>)}
                    </select>
                </div>
                <div>
                    <SLabel label="Médecin" color="#7c3aed"/>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Médecin prescripteur *</label>
                    <select value={form.medecin_prescripteur_id} onChange={e=>setForm(f=>({...f,medecin_prescripteur_id:e.target.value}))} required style={iSxLg} onFocus={fIn} onBlur={fOut}>
                        <option value="">Sélectionner…</option>
                        {medecins.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                {/* Urgence */}
                <label onClick={()=>setForm(f=>({...f,urgent:!f.urgent}))}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${form.urgent?'#f97316':'#f0f0ee'}`, background:form.urgent?'#fff7ed':'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                    <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${form.urgent?'#f97316':'#d1d5db'}`, background:form.urgent?'#f97316':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        {form.urgent && <svg style={{width:11,height:11,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <div>
                        <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>⚡ Analyse urgente</p>
                        <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>Traitement prioritaire</p>
                    </div>
                </label>
                <div>
                    <SLabel label="Commentaire" color="#6b7280"/>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Commentaire médecin</label>
                    <textarea rows={3} value={form.commentaire_medecin} onChange={e=>setForm(f=>({...f,commentaire_medecin:e.target.value}))} placeholder="Contexte clinique, traitement en cours…"
                        style={{ ...iSxLg, height:'auto', padding:'8px 10px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                    <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                    <button type="submit" disabled={processing}
                        style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                        ✓ {processing ? 'Envoi…' : 'Envoyer la demande'}
                    </button>
                </div>
            </form>
        </MModal>
    );
}

// ─── Modal Résultats ──────────────────────────────────────────────────────────

function ResultatsModal({ analyse, onClose }: { analyse: Analyse; onClose:()=>void }) {
    const isRO = analyse.statut==='valide' || analyse.statut==='annule';
    const [rows, setRows] = useState<LigneResultat[]>(
        analyse.resultat?.length>0 ? analyse.resultat : [{ parametre:'', valeur:'', unite:'', valeur_reference:'', interpretation:'normal' }]
    );
    const [interp,    setInterp]    = useState(analyse.interpretation ?? '');
    const [conclu,    setConclu]    = useState(analyse.conclusion ?? '');
    const [processing, setProcessing] = useState(false);

    const addRow    = () => setRows(r=>[...r,{ parametre:'', valeur:'', unite:'', valeur_reference:'', interpretation:'normal' }]);
    const removeRow = (i: number) => setRows(r=>r.filter((_,x)=>x!==i));
    const updRow    = (i: number, k: keyof LigneResultat, v: string) => setRows(r=>r.map((row,x)=>x===i?{...row,[k]:v}:row));

    const updStatut  = (s: string) => { setProcessing(true); router.put(`/laboratoire/${analyse.id}/statut`,{statut:s},{onFinish:()=>setProcessing(false),onSuccess:onClose}); };
    const saveRes    = () => { setProcessing(true); router.post(`/laboratoire/${analyse.id}/resultats`,{resultat:rows,interpretation:interp,conclusion:conclu} as any,{onFinish:()=>setProcessing(false),onSuccess:onClose}); };
    const valider    = () => { setProcessing(true); router.put(`/laboratoire/${analyse.id}/valider`,{},{onFinish:()=>setProcessing(false),onSuccess:onClose}); };

    const currIdx = STATUTS.indexOf(analyse.statut as typeof STATUTS[number]);

    return (
        <MModal onClose={onClose} maxW={880}>
            <MHead
                title={<>Résultats d'analyse {analyse.urgent && <span style={{ fontSize:11, fontWeight:700, color:'#d97706', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:100, padding:'2px 8px', marginLeft:6 }}>⚡ Urgent</span>}</>}
                sub={<><span style={{ fontFamily:'monospace', color:'#f53003', fontWeight:700 }}>{analyse.numero}</span> · {analyse.patient.prenom} {analyse.patient.nom}</>}
                onClose={onClose}
                extra={<Badge statut={analyse.statut}/>}
            />
            <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                {/* Info patient */}
                <div style={{ borderRadius:14, background:'#fafaf9', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:analyse.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                            {analyse.patient.prenom[0]}{analyse.patient.nom[0]}
                        </div>
                        <div>
                            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a18' }}>{analyse.patient.prenom} {analyse.patient.nom}</p>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{analyse.type}{analyse.categorie?` · ${analyse.categorie}`:''}</p>
                        </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 24px' }}>
                        {[['Prescrit par',analyse.prescripteur??'—'],['Prescription',analyse.date_prescription??'—'],['Prélèvement',analyse.date_prelevement??'—'],['Résultat',analyse.date_resultat??'—']].map(([l,v])=>(
                            <div key={l}><span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{l}: </span><span style={{ fontSize:12, fontWeight:600, color:'#1a1a18' }}>{v}</span></div>
                        ))}
                    </div>
                </div>
                {analyse.commentaire_medecin && (
                    <div style={{ borderRadius:12, background:'#fffbeb', border:'1px solid #fde68a', padding:'10px 14px' }}>
                        <p style={{ fontSize:11, color:'#d97706', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Commentaire médecin</p>
                        <p style={{ fontSize:13, color:'#1a1a18' }}>{analyse.commentaire_medecin}</p>
                    </div>
                )}

                {/* Avancement */}
                {!isRO && (
                    <div>
                        <SLabel label="Avancement"/>
                        <div style={{ display:'flex', gap:5 }}>
                            {STATUTS.map((s,i)=>{
                                const sc = STATUT_CFG[s];
                                const active = i===currIdx;
                                const done   = i<currIdx;
                                return (
                                    <button key={s} onClick={()=>updStatut(s)} disabled={processing}
                                        style={{ flex:1, height:34, borderRadius:9, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'system-ui,sans-serif', background:active?sc.color:done?'#10b981':'#f5f5f3', color:active||done?'#fff':'#9ca3af', transition:'all 0.15s', opacity:processing?0.7:1 }}>
                                        {sc.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tableau paramètres */}
                <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <SLabel label="Paramètres biologiques" color="#059669"/>
                        {!isRO && (
                            <button onClick={addRow} style={{ fontSize:12, fontWeight:700, color:'#f53003', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                                + Ajouter ligne
                            </button>
                        )}
                    </div>
                    <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid #f0f0ee' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                            <thead>
                                <tr style={{ background:'#fafaf9', borderBottom:'1px solid #f0f0ee' }}>
                                    {['Paramètre','Résultat','Unité','Référence','Interprétation',''].map((h,i)=>(
                                        <th key={i} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r,i)=>{
                                    const ic = INTERP_CFG[r.interpretation] ?? INTERP_CFG.normal;
                                    return (
                                        <tr key={i} style={{ borderBottom:i<rows.length-1?'1px solid #f5f5f3':'none' }}>
                                            <td style={{ padding:'8px 12px' }}>
                                                {isRO ? <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{r.parametre}</span>
                                                       : <input type="text" value={r.parametre} onChange={e=>updRow(i,'parametre',e.target.value)} placeholder="Hémoglobine" style={{ ...iSx, width:130 }} onFocus={fIn} onBlur={fOut}/>}
                                            </td>
                                            <td style={{ padding:'8px 12px' }}>
                                                {isRO ? <span style={{ fontSize:13, fontWeight:700, color:ic.color }}>{r.valeur}</span>
                                                       : <input type="text" value={r.valeur} onChange={e=>updRow(i,'valeur',e.target.value)} placeholder="12.5" style={{ ...iSx, width:70 }} onFocus={fIn} onBlur={fOut}/>}
                                            </td>
                                            <td style={{ padding:'8px 12px' }}>
                                                {isRO ? <span style={{ fontSize:12, color:'#9ca3af' }}>{r.unite}</span>
                                                       : <input type="text" value={r.unite??''} onChange={e=>updRow(i,'unite',e.target.value)} placeholder="g/dL" style={{ ...iSx, width:60 }} onFocus={fIn} onBlur={fOut}/>}
                                            </td>
                                            <td style={{ padding:'8px 12px' }}>
                                                {isRO ? <span style={{ fontSize:12, color:'#9ca3af' }}>{r.valeur_reference}</span>
                                                       : <input type="text" value={r.valeur_reference??''} onChange={e=>updRow(i,'valeur_reference',e.target.value)} placeholder="12-16" style={{ ...iSx, width:80 }} onFocus={fIn} onBlur={fOut}/>}
                                            </td>
                                            <td style={{ padding:'8px 12px' }}>
                                                {isRO
                                                    ? <span style={{ fontSize:11, fontWeight:700, color:ic.color, background:ic.bg, borderRadius:100, padding:'2px 9px' }}>{ic.label}</span>
                                                    : <select value={r.interpretation} onChange={e=>updRow(i,'interpretation',e.target.value)} style={{ ...iSx, width:100 }} onFocus={fIn} onBlur={fOut}>
                                                        <option value="normal">Normal</option>
                                                        <option value="bas">Bas</option>
                                                        <option value="eleve">Élevé</option>
                                                      </select>
                                                }
                                            </td>
                                            <td style={{ padding:'8px 12px' }}>
                                                {!isRO && rows.length>1 && (
                                                    <button onClick={()=>removeRow(i)} style={{ width:22, height:22, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#c0c0bc' }}
                                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#ef4444'}
                                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#c0c0bc'}>
                                                        <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Interprétation + Conclusion */}
                {!isRO && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        {[{l:'Interprétation globale',v:interp,set:setInterp,ph:'Interprétation générale des résultats…'},
                          {l:'Conclusion du biologiste',v:conclu,set:setConclu,ph:'Conclusion et recommandations…'}].map(f=>(
                            <div key={f.l}>
                                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{f.l}</label>
                                <textarea rows={3} value={f.v} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                                    style={{ ...iSx, height:'auto', padding:'8px 10px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                            </div>
                        ))}
                    </div>
                )}
                {isRO && (analyse.interpretation || analyse.conclusion) && (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        {analyse.interpretation && (
                            <div style={{ borderRadius:12, background:'#fafaf9', border:'1px solid #f0f0ee', padding:'12px 14px' }}>
                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Interprétation</p>
                                <p style={{ fontSize:13, color:'#1a1a18' }}>{analyse.interpretation}</p>
                            </div>
                        )}
                        {analyse.conclusion && (
                            <div style={{ borderRadius:12, background:'#fafaf9', border:'1px solid #f0f0ee', padding:'12px 14px' }}>
                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Conclusion</p>
                                <p style={{ fontSize:13, color:'#1a1a18' }}>{analyse.conclusion}</p>
                                {analyse.biologiste && <p style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>— {analyse.biologiste}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ padding:'12px 22px', borderTop:'1px solid #f0f0ee', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
                <button onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Fermer</button>
                {analyse.statut==='en_cours' && (
                    <button onClick={saveRes} disabled={processing}
                        style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                        ✓ {processing ? 'Enregistrement…' : 'Enregistrer les résultats'}
                    </button>
                )}
                {analyse.statut==='resultat_disponible' && (
                    <button onClick={valider} disabled={processing}
                        style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#059669,#16a34a)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:'0 4px 14px rgba(22,163,74,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                        ✓ {processing ? 'Validation…' : 'Valider l\'analyse'}
                    </button>
                )}
            </div>
        </MModal>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Laboratoire({ analyses, stats, typesAnalyses, categories, patients, medecins, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showNew,    setShowNew]    = useState(false);
    const [selected,   setSelected]   = useState<Analyse|null>(null);
    const [search,     setSearch]     = useState(filters.search    ?? '');
    const [categorie,  setCategorie]  = useState(filters.categorie ?? '');
    const [statut,     setStatut]     = useState(filters.statut    ?? '');
    const [urgent,     setUrgent]     = useState(filters.urgent    ?? '');

    const apply = (ov: object = {}) => router.get('/laboratoire', { search, categorie, statut, urgent, ...ov }, { preserveState:true, replace:true });
    const del = (a: Analyse) => { if (confirm(`Supprimer l'analyse ${a.numero} ?`)) router.delete(`/laboratoire/${a.id}`); };

    return (
        <DashboardLayout title="Laboratoire" subtitle="Gestion des analyses et examens biologiques">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total demandes',  value:stats.total,      icon:'🧪', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Prescrits',       value:stats.en_attente, icon:'📋', grad:'linear-gradient(135deg,#374151,#6b7280)', shadow:'rgba(107,114,128,0.2)' },
                    { label:'En cours',        value:stats.en_cours,   icon:'🔄', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
                    { label:'Résultats dispo', value:stats.termines,   icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'Urgents',         value:stats.urgents,    icon:'⚡', grad:'linear-gradient(135deg,#991b1b,#ef4444)', shadow:'rgba(239,68,68,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.85, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:18, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="N°, patient, prescripteur…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:220 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>
                    {[
                        { val:categorie, set:setCategorie, key:'categorie', opts:[['','Toutes catégories'],...categories.map(c=>[c,c])] },
                        { val:statut,    set:setStatut,    key:'statut',    opts:[['','Tous statuts'],...Object.entries(STATUT_CFG).map(([v,s])=>[v,s.label])] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>{ f.set(e.target.value); apply({[f.key]:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                    <button onClick={()=>{ const v=urgent==='1'?'':'1'; setUrgent(v); apply({urgent:v}); }}
                        style={{ height:38, padding:'0 14px', borderRadius:10, border:`1.5px solid ${urgent==='1'?'#f97316':'#f0f0ee'}`, background:urgent==='1'?'#fff7ed':'#fafaf9', fontSize:13, fontWeight:600, color:urgent==='1'?'#ea580c':'#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}>
                        ⚡ Urgents
                    </button>
                </div>
                <button onClick={()=>setShowNew(true)}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouvelle demande
                </button>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#059669,#0284c7,#7c3aed)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['N° Analyse','Patient','Type / Catégorie','Prescripteur','Date','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===6?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {analyses.data.length===0 ? (
                                <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:36, marginBottom:8 }}>🧪</div>
                                    <p style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>Aucune analyse trouvée</p>
                                    <p>Modifiez vos filtres ou créez une nouvelle demande.</p>
                                </td></tr>
                            ) : analyses.data.map((a,i)=>(
                                <tr key={a.id}
                                    style={{ borderBottom:i<analyses.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s', borderLeft:a.urgent?'3px solid #f97316':'3px solid transparent' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                    <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                            {a.urgent && <span title="Urgent" style={{ fontSize:13 }}>⚡</span>}
                                            <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#f53003' }}>{a.numero}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                                            <div style={{ width:32, height:32, borderRadius:9, background:a.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                {a.patient.prenom[0]}{a.patient.nom[0]}
                                            </div>
                                            <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{a.patient.prenom} {a.patient.nom}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding:'12px 14px', maxWidth:180 }}>
                                        <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.type ?? '—'}</p>
                                        {a.categorie && <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{a.categorie}</p>}
                                    </td>
                                    <td style={{ padding:'12px 14px', fontSize:13, color:'#374151', whiteSpace:'nowrap' }}>{a.prescripteur ?? '—'}</td>
                                    <td style={{ padding:'12px 14px', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>{a.date_prescription ?? '—'}</td>
                                    <td style={{ padding:'12px 14px' }}><Badge statut={a.statut}/></td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                            <button onClick={()=>setSelected(a)} title="Voir / Résultats"
                                                style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <button onClick={()=>del(a)} title="Supprimer"
                                                style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:'1px solid #f5f5f3' }}>
                    <span style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{analyses.total}</span> analyses
                    </span>
                    {analyses.last_page>1 && (
                        <div style={{ display:'flex', gap:4 }}>
                            {analyses.links.map((link,i)=>(
                                <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                    style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                    dangerouslySetInnerHTML={{ __html:link.label }}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNew && <NouvelleDemande typesAnalyses={typesAnalyses} patients={patients} medecins={medecins} onClose={()=>setShowNew(false)}/>}
            {selected && <ResultatsModal analyse={selected} onClose={()=>setSelected(null)}/>}
        </DashboardLayout>
    );
}