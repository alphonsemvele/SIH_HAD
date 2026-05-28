import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExamenImagerie {
    id: number; numero: string;
    patient: { id: number; nom: string; prenom: string; sexe: string };
    type: string; modalite: string; modalite_id: number;
    region_anatomique: string|null; prescripteur: string; service: string;
    date_prescription: string; date_examen: string|null; salle: string|null;
    priorite: string; priorite_raw: string; statut: string; statut_raw: string;
    technicien: string|null; radiologue: string|null; nb_images: number;
    conclusion: string|null; contre_indications: string[];
    renseignements_cliniques: string|null;
}
interface Modalite   { id: number; nom: string; disponible: boolean }
interface TypeExamen { id: number; nom: string; modalite_imagerie_id: number }
interface Patient    { id: number; nom: string; prenom: string; sexe: string }
interface Medecin    { id: number; name: string }
interface Paginated<T> { data: T[]; total: number; last_page: number; links: any[] }
interface Props {
    examens: Paginated<ExamenImagerie>;
    stats: { total: number; en_attente: number; planifies: number; realises: number; interpretes: number; urgents: number };
    modalites: Modalite[]; typesExamens: TypeExamen[]; patients: Patient[]; medecins: Medecin[];
    filters: { search?: string; statut?: string; priorite?: string; modalite_id?: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MOD_CFG: Record<string, { color: string; bg: string; border: string; icon: string; grad: string }> = {
    'Radiographie': { color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd', icon:'🩻', grad:'linear-gradient(135deg,#0c4a6e,#0284c7)' },
    'Scanner':      { color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe', icon:'🔬', grad:'linear-gradient(135deg,#312e81,#4f46e5)' },
    'IRM':          { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', icon:'🧲', grad:'linear-gradient(135deg,#4c1d95,#7c3aed)' },
    'Échographie':  { color:'#0d9488', bg:'#f0fdfa', border:'#99f6e4', icon:'📡', grad:'linear-gradient(135deg,#134e4a,#0d9488)' },
    'Mammographie': { color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8', icon:'🎗️', grad:'linear-gradient(135deg,#831843,#db2777)' },
    'Panoramique':  { color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:'🦷', grad:'linear-gradient(135deg,#78350f,#d97706)' },
    'TEP-Scan':     { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:'⚛️', grad:'linear-gradient(135deg,#7f1d1d,#dc2626)' },
};
const DEF_CFG = { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', icon:'📷', grad:'linear-gradient(135deg,#374151,#6b7280)' };
const getM = (nom: string) => MOD_CFG[nom] ?? DEF_CFG;

const STATUT_CFG: Record<string, { color: string; bg: string; border: string }> = {
    'En attente': { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
    'Planifié':   { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
    'En cours':   { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    'Réalisé':    { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    'Interprété': { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
};
const PRIO_CFG: Record<string, { color: string; bg: string; border: string }> = {
    'Normal':      { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
    'Urgent':      { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    'Très urgent': { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};
const CI_LABELS: Record<string, string> = { allergie_iode:'Allergie iode', grossesse:'Grossesse', pacemaker:'Pacemaker', claustrophobie:'Claustrophobie' };
const STATUTS_WF = ['en_attente','planifie','en_cours','realise','interprete'] as const;
const STATUTS_WF_LABELS: Record<string, string> = { en_attente:'En attente', planifie:'Planifié', en_cours:'En cours', realise:'Réalisé', interprete:'Interprété' };

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function Badge({ label, cfg }: { label: string; cfg: { color: string; bg: string; border: string } }) {
    return <span style={{ fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{label}</span>;
}
function MBadge({ modalite }: { modalite: string }) {
    const c = getM(modalite);
    return <span style={{ fontSize:11, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif', display:'inline-flex', alignItems:'center', gap:5 }}>{c.icon} {modalite}</span>;
}
function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}><div style={{ width:3, height:13, borderRadius:100, background:color }}/><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span></div>;
}
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
                <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
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

// ─── Modal Nouvelle Demande ───────────────────────────────────────────────────

function NouvelleDemandeModal({ modalites, typesExamens, patients, medecins, onClose }: { modalites:Modalite[]; typesExamens:TypeExamen[]; patients:Patient[]; medecins:Medecin[]; onClose:()=>void }) {
    const [form, setForm] = useState({ patient_id:'', medecin_prescripteur_id:'', type_examen_id:'', modalite_imagerie_id:'', region_anatomique:'', priorite:'normal', renseignements_cliniques:'', contre_indications:[] as string[] });
    const [saving, setSaving] = useState(false);
    const filteredTypes = form.modalite_imagerie_id ? typesExamens.filter(t=>t.modalite_imagerie_id===parseInt(form.modalite_imagerie_id)) : typesExamens;
    const toggleCI = (ci: string) => setForm(f=>({ ...f, contre_indications: f.contre_indications.includes(ci)?f.contre_indications.filter(c=>c!==ci):[...f.contre_indications,ci] }));
    const submit = (e: React.FormEvent) => { e.preventDefault(); setSaving(true); router.post('/imagerie', form as any, { onSuccess:onClose, onFinish:()=>setSaving(false) }); };

    return (
        <MModal onClose={onClose} maxW={620}>
            <MHead title="🩻 Nouvelle demande d'imagerie" sub="Prescription d'examen radiologique" onClose={onClose}/>
            <form onSubmit={submit} style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                <div>
                    <SLabel label="Patient" color="#3b82f6"/>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Patient *</label>
                    <select value={form.patient_id} onChange={e=>setForm(f=>({...f,patient_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                        <option value="">Sélectionner…</option>
                        {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                    </select>
                </div>

                <div>
                    <SLabel label="Prescription" color="#7c3aed"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Prescripteur *</label>
                            <select value={form.medecin_prescripteur_id} onChange={e=>setForm(f=>({...f,medecin_prescripteur_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">Sélectionner…</option>
                                {medecins.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Priorité</label>
                            <select value={form.priorite} onChange={e=>setForm(f=>({...f,priorite:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="tres_urgent">Très urgent</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modalité en cards visuelles */}
                <div>
                    <SLabel label="Modalité *" color="#0284c7"/>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                        {modalites.map(m=>{
                            const mc = getM(m.nom);
                            const active = form.modalite_imagerie_id===String(m.id);
                            return (
                                <button key={m.id} type="button" disabled={!m.disponible}
                                    onClick={()=>setForm(f=>({...f,modalite_imagerie_id:String(m.id),type_examen_id:''}))}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, border:`1.5px solid ${active?mc.color:m.disponible?'#f0f0ee':'#fecaca'}`, background:active?mc.bg:m.disponible?'#fafaf9':'#fef2f2', cursor:m.disponible?'pointer':'not-allowed', transition:'all 0.15s', opacity:m.disponible?1:0.6 }}>
                                    <span style={{ fontSize:18 }}>{mc.icon}</span>
                                    <div style={{ textAlign:'left', minWidth:0 }}>
                                        <p style={{ fontSize:12, fontWeight:700, color:active?mc.color:'#374151', fontFamily:'system-ui,sans-serif' }}>{m.nom}</p>
                                        {!m.disponible && <p style={{ fontSize:10, color:'#dc2626', fontFamily:'system-ui,sans-serif' }}>Indisponible</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <SLabel label="Examen" color="#059669"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Type d'examen *</label>
                            <select value={form.type_examen_id} onChange={e=>setForm(f=>({...f,type_examen_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">{form.modalite_imagerie_id?'Sélectionner…':'Choisir une modalité d\'abord…'}</option>
                                {filteredTypes.map(t=><option key={t.id} value={t.id}>{t.nom}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Région anatomique</label>
                            <select value={form.region_anatomique} onChange={e=>setForm(f=>({...f,region_anatomique:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">Sélectionner…</option>
                                {['Crâne / Encéphale','Thorax','Abdomen / Pelvis','Rachis','Membre supérieur','Membre inférieur','Cœur','Seins','Autres'].map(r=><option key={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <SLabel label="Renseignements cliniques" color="#6b7280"/>
                    <textarea rows={3} value={form.renseignements_cliniques} onChange={e=>setForm(f=>({...f,renseignements_cliniques:e.target.value}))} placeholder="Contexte, antécédents, hypothèse diagnostique…"
                        style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                </div>

                <div>
                    <SLabel label="Contre-indications / Allergies" color="#dc2626"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        {Object.entries(CI_LABELS).map(([ci,label])=>{
                            const active = form.contre_indications.includes(ci);
                            return (
                                <label key={ci} onClick={()=>toggleCI(ci)}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${active?'#dc2626':'#f0f0ee'}`, background:active?'#fef2f2':'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                    <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${active?'#dc2626':'#d1d5db'}`, background:active?'#dc2626':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        {active && <svg style={{width:10,height:10,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                    </div>
                                    <span style={{ fontSize:12, fontWeight:600, color:active?'#dc2626':'#374151', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                    <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                    <button type="submit" disabled={saving}
                        style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:saving?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                        ✓ {saving ? 'Envoi…' : 'Envoyer la demande'}
                    </button>
                </div>
            </form>
        </MModal>
    );
}

// ─── Modal Détail / Compte-rendu ──────────────────────────────────────────────

function DetailModal({ examen, medecins, onClose }: { examen: ExamenImagerie; medecins: Medecin[]; onClose:()=>void }) {
    const [conclusion,  setConclusion]  = useState(examen.conclusion ?? '');
    const [radioId,     setRadioId]     = useState('');
    const [saving,      setSaving]      = useState(false);
    const mc = getM(examen.modalite);
    const statCfg  = STATUT_CFG[examen.statut] ?? STATUT_CFG['En attente'];
    const prioCfg  = PRIO_CFG[examen.priorite] ?? PRIO_CFG['Normal'];
    const currIdx  = STATUTS_WF.indexOf(examen.statut_raw as any);

    const saveConclusion = () => { setSaving(true); router.patch(`/imagerie/${examen.id}/conclusion`,{conclusion,radiologue_id:radioId||null},{onSuccess:onClose,onFinish:()=>setSaving(false)}); };
    const changeStatut   = (s: string) => router.patch(`/imagerie/${examen.id}/statut`,{statut:s},{onSuccess:onClose});

    return (
        <MModal onClose={onClose} maxW={820}>
            {/* Header teinté modalité */}
            <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,${mc.bg},#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
                <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ fontSize:22 }}>{mc.icon}</span>
                        <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>{examen.type}</h2>
                        <Badge label={examen.statut} cfg={statCfg}/>
                        <Badge label={examen.priorite} cfg={prioCfg}/>
                    </div>
                    <p style={{ fontFamily:'monospace', fontSize:12, color:'#f53003', fontWeight:700 }}>{examen.numero}</p>
                </div>
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                {/* Patient */}
                <div style={{ borderRadius:14, background:'#fafaf9', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:examen.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0 }}>
                            {examen.patient.prenom[0]}{examen.patient.nom[0]}
                        </div>
                        <div>
                            <p style={{ fontSize:15, fontWeight:700, color:'#1a1a18' }}>{examen.patient.prenom} {examen.patient.nom}</p>
                            <div style={{ marginTop:4 }}><MBadge modalite={examen.modalite}/></div>
                        </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <p style={{ fontSize:13, color:'#374151' }}>Dr. {examen.prescripteur}</p>
                        <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{examen.service}</p>
                    </div>
                </div>

                {/* Infos grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                    {[['Modalité',examen.modalite],['Région',examen.region_anatomique??'—'],['Demande',examen.date_prescription],['Examen',examen.date_examen??'—']].map(([l,v])=>(
                        <div key={l} style={{ borderRadius:10, background:'#fafaf9', border:'1px solid #f0f0ee', padding:'10px 12px' }}>
                            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>{l}</p>
                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{v}</p>
                        </div>
                    ))}
                </div>

                {/* Contre-indications */}
                {examen.contre_indications?.length > 0 && (
                    <div style={{ borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', padding:'12px 16px' }}>
                        <p style={{ fontSize:12, fontWeight:700, color:'#dc2626', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>⚠️ Contre-indications signalées</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                            {examen.contre_indications.map(ci=>(
                                <span key={ci} style={{ fontSize:11, fontWeight:700, color:'#dc2626', background:'#fff', border:'1px solid #fca5a5', borderRadius:100, padding:'2px 10px' }}>
                                    {CI_LABELS[ci]??ci}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Renseignements */}
                {examen.renseignements_cliniques && (
                    <div style={{ borderRadius:12, background:'#fafaf9', border:'1px solid #f0f0ee', padding:'12px 16px' }}>
                        <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Renseignements cliniques</p>
                        <p style={{ fontSize:13, color:'#1a1a18', lineHeight:1.6 }}>{examen.renseignements_cliniques}</p>
                    </div>
                )}

                {/* Avancement */}
                {examen.statut_raw !== 'interprete' && (
                    <div>
                        <SLabel label="Avancement"/>
                        <div style={{ display:'flex', gap:5 }}>
                            {STATUTS_WF.map((s,i)=>(
                                <button key={s} onClick={()=>changeStatut(s)}
                                    style={{ flex:1, height:34, borderRadius:9, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, fontFamily:'system-ui,sans-serif', background:i===currIdx?'#f53003':i<currIdx?'#10b981':'#f5f5f3', color:i===currIdx||i<currIdx?'#fff':'#9ca3af', transition:'all 0.15s' }}>
                                    {STATUTS_WF_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Compte-rendu existant */}
                {examen.conclusion && (
                    <div>
                        <SLabel label="Compte-rendu" color="#16a34a"/>
                        <div style={{ borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'14px 16px' }}>
                            <p style={{ fontSize:13, color:'#1a1a18', lineHeight:1.7 }}>{examen.conclusion}</p>
                            {examen.radiologue && (
                                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:8, paddingTop:8, borderTop:'1px solid #bbf7d0' }}>
                                    Validé par {examen.radiologue} · {examen.date_examen}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Saisie compte-rendu */}
                {examen.statut_raw==='realise' && !examen.conclusion && (
                    <div>
                        <SLabel label="Saisir le compte-rendu" color="#f53003"/>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            <select value={radioId} onChange={e=>setRadioId(e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">Radiologue signataire (optionnel)…</option>
                                {medecins.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <textarea rows={5} value={conclusion} onChange={e=>setConclusion(e.target.value)} placeholder="Rédigez votre compte-rendu radiologique…"
                                style={{ ...iSx, height:'auto', padding:'10px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding:'12px 22px', borderTop:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <button onClick={()=>window.print()} style={{ height:34, padding:'0 14px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:6 }}>
                    <svg style={{width:13,height:13}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm1-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3"/></svg>
                    Imprimer
                </button>
                <div style={{ display:'flex', gap:10 }}>
                    <button onClick={onClose} style={{ height:34, padding:'0 14px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Fermer</button>
                    {examen.statut_raw==='realise' && !examen.conclusion && (
                        <button onClick={saveConclusion} disabled={saving||!conclusion.trim()}
                            style={{ height:34, padding:'0 16px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:(saving||!conclusion.trim())?0.5:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                            ✓ {saving ? 'Validation…' : 'Valider le compte-rendu'}
                        </button>
                    )}
                </div>
            </div>
        </MModal>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Imagerie({ examens, stats, modalites, typesExamens, patients, medecins, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showNew,  setShowNew]  = useState(false);
    const [selected, setSelected] = useState<ExamenImagerie|null>(null);
    const [search,   setSearch]   = useState(filters.search      ?? '');
    const [statut,   setStatut]   = useState(filters.statut      ?? '');
    const [priorite, setPriorite] = useState(filters.priorite    ?? '');
    const [modalite, setModalite] = useState(filters.modalite_id ?? '');

    const apply = (ov: object = {}) => router.get('/imagerie', { search, statut, priorite, modalite_id:modalite, ...ov }, { preserveState:true, replace:true });
    const del   = (e: ExamenImagerie) => { if (confirm(`Supprimer "${e.numero}" ?`)) router.delete(`/imagerie/${e.id}`); };

    return (
        <DashboardLayout title="Imagerie médicale" subtitle="Radiologie et examens d'imagerie">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:24 }}>
                {[
                    { label:'Total',       value:stats.total,       icon:'📷', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'En attente',  value:stats.en_attente,  icon:'⏳', grad:'linear-gradient(135deg,#374151,#6b7280)', shadow:'rgba(107,114,128,0.2)' },
                    { label:'Planifiés',   value:stats.planifies,   icon:'📅', grad:'linear-gradient(135deg,#1e3a8a,#2563eb)', shadow:'rgba(37,99,235,0.35)' },
                    { label:'Réalisés',    value:stats.realises,    icon:'✔️', grad:'linear-gradient(135deg,#4c1d95,#7c3aed)', shadow:'rgba(124,58,237,0.35)' },
                    { label:'Interprétés', value:stats.interpretes, icon:'📋', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'Urgents',     value:stats.urgents,     icon:'⚡', grad:'linear-gradient(135deg,#991b1b,#ef4444)', shadow:'rgba(239,68,68,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:16, padding:'16px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 6px 20px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-10, right:-10, width:55, height:55, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:20, marginBottom:6 }}>{k.icon}</div>
                        <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:10, fontWeight:500, opacity:0.8, marginTop:3, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ CARTES MODALITÉS */}
            <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10, fontFamily:'system-ui,sans-serif' }}>Modalités disponibles</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10 }}>
                    {(modalites??[]).map(m=>{
                        const mc = getM(m.nom);
                        return (
                            <div key={m.id} style={{ borderRadius:14, overflow:'hidden', border:`1px solid ${m.disponible?mc.border:'#fecaca'}`, background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                                <div style={{ height:3, background:m.disponible?mc.grad:'linear-gradient(135deg,#dc2626,#ef4444)' }}/>
                                <div style={{ padding:'12px 12px 10px', textAlign:'center' }}>
                                    <div style={{ fontSize:22, marginBottom:6 }}>{mc.icon}</div>
                                    <p style={{ fontSize:12, fontWeight:700, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{m.nom}</p>
                                    <p style={{ fontSize:10, color:m.disponible?mc.color:'#dc2626', fontFamily:'system-ui,sans-serif', marginTop:3, fontWeight:600 }}>
                                        {m.disponible ? '● Dispo' : '● Maintenance'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:18, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="N° examen, patient…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:220 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>
                    {[
                        { val:modalite, set:setModalite, key:'modalite_id', opts:[['','Toutes modalités'],...(modalites??[]).map(m=>[String(m.id),m.nom])] },
                        { val:statut,   set:setStatut,   key:'statut',      opts:[['','Tous statuts'],['en_attente','En attente'],['planifie','Planifié'],['en_cours','En cours'],['realise','Réalisé'],['interprete','Interprété']] },
                        { val:priorite, set:setPriorite, key:'priorite',    opts:[['','Toutes priorités'],['normal','Normal'],['urgent','Urgent'],['tres_urgent','Très urgent']] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>{ f.set(e.target.value); apply({[f.key]:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
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
                <div style={{ height:3, background:'linear-gradient(90deg,#0284c7,#7c3aed,#db2777)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', minWidth:900, borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['N° Examen','Patient','Examen','Modalité','Prescripteur','Date','Priorité','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===8?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {examens.data.length===0 ? (
                                <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:40, marginBottom:10 }}>🩻</div>
                                    <p style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>Aucun examen trouvé</p>
                                    <p>Modifiez vos filtres ou créez une nouvelle demande.</p>
                                </td></tr>
                            ) : examens.data.map((e,i)=>{
                                const sc = STATUT_CFG[e.statut] ?? STATUT_CFG['En attente'];
                                const pc = PRIO_CFG[e.priorite] ?? PRIO_CFG['Normal'];
                                return (
                                    <tr key={e.id} style={{ borderBottom:i<examens.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                        onMouseEnter={x=>(x.currentTarget as HTMLElement).style.background='#fafaf9'}
                                        onMouseLeave={x=>(x.currentTarget as HTMLElement).style.background='transparent'}>
                                        <td style={{ padding:'11px 14px', whiteSpace:'nowrap' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                                <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#f53003' }}>{e.numero}</span>
                                                {e.contre_indications?.length>0 && <span title="Contre-indications">⚠️</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding:'11px 14px' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                <div style={{ width:30, height:30, borderRadius:9, background:e.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                    {e.patient.prenom[0]}{e.patient.nom[0]}
                                                </div>
                                                <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{e.patient.prenom} {e.patient.nom}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding:'11px 14px', maxWidth:160 }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.type}</p>
                                            {e.region_anatomique && <p style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{e.region_anatomique}</p>}
                                        </td>
                                        <td style={{ padding:'11px 14px' }}><MBadge modalite={e.modalite}/></td>
                                        <td style={{ padding:'11px 14px' }}>
                                            <p style={{ fontSize:13, color:'#374151' }}>{e.prescripteur}</p>
                                            <p style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{e.service}</p>
                                        </td>
                                        <td style={{ padding:'11px 14px', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>{e.date_examen??e.date_prescription}</td>
                                        <td style={{ padding:'11px 14px' }}><Badge label={e.priorite} cfg={pc}/></td>
                                        <td style={{ padding:'11px 14px' }}><Badge label={e.statut} cfg={sc}/></td>
                                        <td style={{ padding:'11px 14px' }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                                <button onClick={()=>setSelected(e)} title="Voir"
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={x=>(x.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={x=>(x.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                                </button>
                                                <button onClick={()=>del(e)} title="Supprimer"
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={x=>(x.currentTarget as HTMLElement).style.background='#fef2f2'}
                                                    onMouseLeave={x=>(x.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:'1px solid #f5f5f3' }}>
                    <span style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{examens.total}</span> examens
                    </span>
                    {examens.last_page>1 && (
                        <div style={{ display:'flex', gap:4 }}>
                            {examens.links.map((link,i)=>(
                                <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                    style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                    dangerouslySetInnerHTML={{ __html:link.label }}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNew && <NouvelleDemandeModal modalites={modalites??[]} typesExamens={typesExamens??[]} patients={patients??[]} medecins={medecins??[]} onClose={()=>setShowNew(false)}/>}
            {selected && <DetailModal examen={selected} medecins={medecins??[]} onClose={()=>setSelected(null)}/>}
        </DashboardLayout>
    );
}