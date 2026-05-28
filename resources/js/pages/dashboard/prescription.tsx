import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Patient { id: number; nom: string; prenom: string; date_naissance: string; sexe: string; }
interface Anomalie { id: number; titre: string; description: string | null; severite: 'critique'|'elevee'|'moderee'|'faible'; statut: string; created_at: string; }
interface Medicament { id: number; nom: string; dosage: string; forme: string; }
interface LignePrescription {
    id?: number; medicament_id: number; posologie: string; duree_jours: number|null;
    quantite_prescrite: number; instructions: string;
    medicament?: { id: number; nom: string; dosage: string; forme: string };
}
interface Prescription {
    id: number; numero: string; patient: Patient;
    medecin: { name: string; lastname: string };
    anomalie: Anomalie | null; lignePrescriptions: LignePrescription[];
    statut: 'en_attente'|'partiellement_delivree'|'delivree'|'annulee';
    instructions_generales: string | null; date_prescription: string; date_validite: string | null;
}
interface Paginated { data: Prescription[]; current_page: number; last_page: number; per_page: number; total: number; links: { url: string|null; label: string; active: boolean }[]; }
interface Props {
    prescriptions?: Paginated; patients?: Patient[]; medicaments?: Medicament[];
    stats?: { total: number; en_attente: number; delivrees: number; annulees: number };
    filters?: { search?: string; statut?: string };
}

const defaultPaginated: Paginated = { data:[], current_page:1, last_page:1, per_page:15, total:0, links:[] };

// ─── Config statuts ───────────────────────────────────────────────────────────
const STATUTS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    en_attente:             { label:'En attente', color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    partiellement_delivree: { label:'Partielle',  color:'#ca8a04', bg:'#fefce8', border:'#fef08a' },
    delivree:               { label:'Délivrée',   color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    annulee:                { label:'Annulée',    color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
};
const SEVERITES: Record<string, { color: string; bg: string; border: string }> = {
    critique: { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
    elevee:   { color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' },
    moderee:  { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    faible:   { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; } };
const ligneVide = (): LignePrescription => ({ medicament_id:0, posologie:'', duree_jours:null, quantite_prescrite:1, instructions:'', medicament:undefined });
const nomMed  = (l: LignePrescription) => l.medicament?.nom ?? '—';
const detMed  = (l: LignePrescription) => [l.medicament?.dosage, l.medicament?.forme].filter(Boolean).join(' · ');

const iSx: React.CSSProperties = { width:'100%', height:36, padding:'0 10px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function Badge({ statut }: { statut: string }) {
    const s = STATUTS[statut] ?? STATUTS.annulee;
    return <span style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{s.label}</span>;
}
function SevBadge({ sev }: { sev: string }) {
    const s = SEVERITES[sev] ?? SEVERITES.faible;
    return <span style={{ fontSize:10, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:6, padding:'2px 7px', textTransform:'capitalize', fontFamily:'system-ui,sans-serif' }}>{sev}</span>;
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
function MHead({ title, sub, onClose, extra }: { title: React.ReactNode; sub?: string; onClose:()=>void; extra?: React.ReactNode }) {
    return (
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
            <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
                {sub && <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{sub}</p>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {extra}
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
    );
}
function MFooter({ children }: { children: React.ReactNode }) {
    return <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f0ee', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>{children}</div>;
}
function CancelBtn({ onClick }: { onClick:()=>void }) {
    return <button type="button" onClick={onClick} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>;
}
function SubmitBtn({ label, disabled }: { label: string; disabled?: boolean }) {
    return <button type="submit" disabled={disabled} style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:disabled?'not-allowed':'pointer', fontFamily:'system-ui,sans-serif', opacity:disabled?0.5:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>✓ {label}</button>;
}
function StepLabel({ n, label }: { n: number; label: string }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#f53003,#e02a00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>{n}</div>
            <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{label}</span>
        </div>
    );
}

// ─── Ligne médicament ─────────────────────────────────────────────────────────
function LigneRow({ ligne, idx, medicaments, onUpdate, onDelete }: {
    ligne: LignePrescription; idx: number; medicaments: Medicament[];
    onUpdate: (f: keyof LignePrescription, v: any) => void; onDelete: () => void;
}) {
    return (
        <div style={{ borderRadius:14, border:'1.5px solid #f0f0ee', background:'#fafaf9', padding:'14px 16px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:22, height:22, borderRadius:7, background:'#fff5f5', border:'1px solid #ffd0c8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#f53003' }}>{idx+1}</div>
                    <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif' }}>Médicament #{idx+1}</span>
                </div>
                <button type="button" onClick={onDelete} style={{ width:26, height:26, borderRadius:7, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <svg style={{width:13,height:13,color:'#ef4444'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:10, marginBottom:8 }}>
                <div style={{ gridColumn:'1/-1' }}>
                    <select value={ligne.medicament_id||''} onChange={e=>{const m=medicaments.find(x=>x.id===Number(e.target.value));onUpdate('medicament_id',Number(e.target.value));onUpdate('medicament',m??undefined);}} style={iSx} onFocus={fIn} onBlur={fOut}>
                        <option value="">Sélectionner un médicament…</option>
                        {medicaments.map(m=><option key={m.id} value={m.id}>{m.nom} — {m.dosage} ({m.forme})</option>)}
                    </select>
                    {ligne.medicament && (
                        <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:3, display:'block' }}>
                            💊 {ligne.medicament.dosage} · {ligne.medicament.forme}
                        </span>
                    )}
                </div>
                <div>
                    <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Qté *</label>
                    <input type="number" min="1" value={ligne.quantite_prescrite} onChange={e=>onUpdate('quantite_prescrite',Number(e.target.value))} style={iSx} onFocus={fIn} onBlur={fOut}/>
                </div>
                <div>
                    <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Posologie *</label>
                    <input type="text" value={ligne.posologie} onChange={e=>onUpdate('posologie',e.target.value)} placeholder="1 cp 3×/j" style={iSx} onFocus={fIn} onBlur={fOut}/>
                </div>
                <div>
                    <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Durée (j)</label>
                    <input type="number" min="1" value={ligne.duree_jours??''} onChange={e=>onUpdate('duree_jours',e.target.value?Number(e.target.value):null)} placeholder="7" style={iSx} onFocus={fIn} onBlur={fOut}/>
                </div>
                <div>
                    <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Instructions</label>
                    <input type="text" value={ligne.instructions} onChange={e=>onUpdate('instructions',e.target.value)} placeholder="Pendant les repas" style={iSx} onFocus={fIn} onBlur={fOut}/>
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Prescriptions({
    prescriptions=defaultPaginated, patients=[], medicaments=[],
    stats={ total:0, en_attente:0, delivrees:0, annulees:0 }, filters={},
}: Props) {
    const [showModal,    setShowModal]    = useState(false);
    const [showView,     setShowView]     = useState(false);
    const [showStatut,   setShowStatut]   = useState(false);
    const [showEdit,     setShowEdit]     = useState(false);
    const [selected,     setSelected]     = useState<Prescription|null>(null);
    const [search,       setSearch]       = useState(filters?.search ?? '');
    const [statutFilter, setStatutFilter] = useState(filters?.statut ?? '');
    const [anomalies,    setAnomalies]    = useState<Anomalie[]>([]);
    const [loadingAn,    setLoadingAn]    = useState(false);
    const [lignes,       setLignes]       = useState<LignePrescription[]>([]);
    const [lignesEdit,   setLignesEdit]   = useState<LignePrescription[]>([]);

    const form       = useForm({ patient_id:'', anomalie_id:'', instructions_generales:'', date_validite:'', lignes:[] as LignePrescription[] });
    const statutForm = useForm({ statut:'' });
    const editForm   = useForm({ instructions_generales:'', date_validite:'', lignes:[] as LignePrescription[] });

    const patientSel = patients.find(p=>p.id===Number(form.data.patient_id))??null;

    const openStatut = (p: Prescription) => { setSelected(p); statutForm.setData('statut',p.statut); setShowStatut(true); };
    const openView   = (p: Prescription) => { setSelected(p); setShowView(true); };
    const openEdit   = (p: Prescription) => {
        setSelected(p);
        editForm.setData({ instructions_generales:p.instructions_generales??'', date_validite:p.date_validite?.split('T')[0]??'', lignes:[] });
        setLignesEdit((p.lignePrescriptions??[]).map(l=>({...l})));
        setShowEdit(true);
    };

    const handlePatientChange = async (id: string) => {
        form.setData('patient_id', id); form.setData('anomalie_id','');
        setAnomalies([]); setLignes([]);
        if (!id) return;
        setLoadingAn(true);
        try { const r=await fetch(`/patients/${id}/anomalies-actives`); const d=await r.json(); setAnomalies(Array.isArray(d)?d:[]); }
        catch { setAnomalies([]); } finally { setLoadingAn(false); }
    };

    const closeModal   = () => { setShowModal(false); form.reset(); setLignes([]); setAnomalies([]); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); form.transform(d=>({...d,lignes})); form.post('/prescriptions',{onSuccess:closeModal}); };

    const mkUpdater = (setter: React.Dispatch<React.SetStateAction<LignePrescription[]>>) =>
        (idx: number, f: keyof LignePrescription, v: any) => setter(prev=>{
            const u=[...prev];
            if (f==='medicament_id') { const m=medicaments.find(x=>x.id===Number(v)); u[idx]={...u[idx],medicament_id:Number(v),medicament:m}; }
            else (u[idx] as any)[f]=v;
            return u;
        });

    const updLigne = mkUpdater(setLignes);
    const updEdit  = mkUpdater(setLignesEdit);

    const canSubmit     = !!(form.data.patient_id && lignes.length>0 && lignes.every(l=>l.medicament_id>0&&l.posologie));
    const canEditSubmit = lignesEdit.length>0 && lignesEdit.every(l=>l.medicament_id>0&&l.posologie);

    return (
        <DashboardLayout title="Prescriptions" subtitle="Gestion des ordonnances médicales">

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total',      value:stats.total,      icon:'📋', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)',  shadow:'rgba(0,0,0,0.25)' },
                    { label:'En attente', value:stats.en_attente, icon:'⏳', grad:'linear-gradient(135deg,#b45309,#f59e0b)',  shadow:'rgba(245,158,11,0.35)' },
                    { label:'Délivrées',  value:stats.delivrees,  icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)',  shadow:'rgba(16,185,129,0.35)' },
                    { label:'Annulées',   value:stats.annulees,   icon:'❌', grad:'linear-gradient(135deg,#374151,#6b7280)',  shadow:'rgba(107,114,128,0.2)' },
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
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <form onSubmit={e=>{ e.preventDefault(); router.get('/prescription',{search,statut:statutFilter},{preserveState:true}); }} style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:220 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </form>
                    <select value={statutFilter} onChange={e=>{ setStatutFilter(e.target.value); router.get('/prescription',{search,statut:e.target.value},{preserveState:true}); }}
                        style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                        <option value="">Tous les statuts</option>
                        {Object.entries(STATUTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
                <button onClick={()=>setShowModal(true)}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouvelle prescription
                </button>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#f59e0b,#f53003)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['N° Rx','Patient','Anomalie','Médicaments','Médecin','Date','Validité','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===8?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.data.length===0 ? (
                                <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:32, marginBottom:8 }}>📋</div>Aucune prescription trouvée
                                </td></tr>
                            ) : prescriptions.data.map((p,i)=>(
                                <tr key={p.id} style={{ borderBottom:i<prescriptions.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                    <td style={{ padding:'11px 14px' }}>
                                        <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#f53003' }}>{p.numero}</span>
                                    </td>
                                    <td style={{ padding:'11px 14px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                                            <div style={{ width:34, height:34, borderRadius:10, background:p.patient?.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                {p.patient?.prenom?.[0]}{p.patient?.nom?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{p.patient?.prenom} {p.patient?.nom}</div>
                                                <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{p.patient?.date_naissance?fmt(p.patient.date_naissance):''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding:'11px 14px' }}>
                                        {p.anomalie ? (
                                            <div>
                                                <SevBadge sev={p.anomalie.severite}/>
                                                <p style={{ fontSize:12, color:'#374151', marginTop:4, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.anomalie.titre}</p>
                                            </div>
                                        ) : <span style={{ fontSize:12, color:'#c0c0bc', fontStyle:'italic' }}>Libre</span>}
                                    </td>
                                    <td style={{ padding:'11px 14px' }}>
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                                            {(p.lignePrescriptions??[]).slice(0,2).map((l,j)=>(
                                                <span key={j} style={{ fontSize:11, fontWeight:600, color:'#374151', background:'#f5f5f3', borderRadius:6, padding:'2px 8px' }}>{nomMed(l)}</span>
                                            ))}
                                            {(p.lignePrescriptions??[]).length>2 && <span style={{ fontSize:11, color:'#9ca3af', background:'#f5f5f3', borderRadius:6, padding:'2px 8px' }}>+{p.lignePrescriptions.length-2}</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding:'11px 14px', fontSize:13, color:'#374151' }}>Dr. {p.medecin?.lastname??p.medecin?.name}</td>
                                    <td style={{ padding:'11px 14px', fontSize:12, color:'#9ca3af' }}>{p.date_prescription?fmt(p.date_prescription):''}</td>
                                    <td style={{ padding:'11px 14px', fontSize:12, color: p.date_validite?'#374151':'#c0c0bc' }}>{p.date_validite?fmt(p.date_validite):'—'}</td>
                                    <td style={{ padding:'11px 14px' }}>
                                        <button onClick={()=>openStatut(p)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                                            <Badge statut={p.statut}/>
                                        </button>
                                    </td>
                                    <td style={{ padding:'11px 14px' }}>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                            {[
                                                { title:'Voir', icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick:()=>openView(p) },
                                                { title:'Modifier', icon:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick:()=>openEdit(p) },
                                                { title:'Statut', icon:'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z', onClick:()=>openStatut(p) },
                                                { title:'Imprimer', icon:'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm1-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3', onClick:()=>window.open(`/prescriptions/${p.id}/print`,'_blank') },
                                                ...(p.statut==='annulee'?[{title:'Renouveler',icon:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',onClick:()=>router.post(`/prescriptions/${p.id}/renouveler`)}]:[]),
                                            ].map((btn,j)=>(
                                                <button key={j} onClick={btn.onClick} title={btn.title}
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {prescriptions.last_page>1 && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:'1px solid #f5f5f3' }}>
                        <span style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{(prescriptions.current_page-1)*prescriptions.per_page+1}–{Math.min(prescriptions.current_page*prescriptions.per_page,prescriptions.total)} sur {prescriptions.total}</span>
                        <div style={{ display:'flex', gap:4 }}>
                            {prescriptions.links.map((link,i)=>(
                                <a key={i} href={link.url||'#'}
                                    style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', textDecoration:'none', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':link.url?'#706f6c':'#d1d5db', border:link.active?'none':'1px solid #f0f0ee', pointerEvents:link.url?'auto':'none', opacity:link.url?1:0.4, padding:'0 6px' }}
                                    dangerouslySetInnerHTML={{ __html:link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════ MODAL VOIR */}
            {showView && selected && (
                <MModal onClose={()=>setShowView(false)} maxW={640}>
                    <MHead title={<>Ordonnance <span style={{fontFamily:'monospace',color:'#f53003'}}>{selected.numero}</span></>} sub={`${selected.patient?.prenom} ${selected.patient?.nom} · ${selected.date_prescription?fmt(selected.date_prescription):''}`} onClose={()=>setShowView(false)} extra={<Badge statut={selected.statut}/>}/>
                    <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>
                        {/* Résumé */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, borderRadius:14, background:'#fafaf9', padding:'14px 16px' }}>
                            {[['Patient',`${selected.patient?.prenom} ${selected.patient?.nom}`],['Médecin',`Dr. ${selected.medecin?.lastname??selected.medecin?.name}`],['Date',selected.date_prescription?fmt(selected.date_prescription):'—'],['Validité',selected.date_validite?fmt(selected.date_validite):'—']].map(([l,v])=>(
                                <div key={l}><p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:3 }}>{l}</p><p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{v}</p></div>
                            ))}
                        </div>
                        {/* Anomalie */}
                        {selected.anomalie ? (
                            <div style={{ borderRadius:12, background:'#fafaf9', border:'1px solid #eee', padding:'12px 16px' }}>
                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>Anomalie traitée</p>
                                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                                    <SevBadge sev={selected.anomalie.severite}/>
                                    <div>
                                        <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{selected.anomalie.titre}</p>
                                        {selected.anomalie.description && <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:3 }}>{selected.anomalie.description}</p>}
                                    </div>
                                </div>
                            </div>
                        ) : <p style={{ textAlign:'center', fontSize:13, color:'#c0c0bc', fontStyle:'italic', fontFamily:'system-ui,sans-serif', padding:'8px 0' }}>Prescription libre</p>}
                        {/* Médicaments */}
                        <div>
                            <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:10 }}>Médicaments ({(selected.lignePrescriptions??[]).length})</p>
                            {(selected.lignePrescriptions??[]).length===0
                                ? <p style={{ textAlign:'center', fontSize:13, color:'#c0c0bc', fontStyle:'italic', fontFamily:'system-ui,sans-serif' }}>Aucun médicament</p>
                                : <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    {(selected.lignePrescriptions??[]).map((l,i)=>(
                                        <div key={i} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', borderRadius:12, border:'1px solid #f0f0ee', padding:'12px 14px' }}>
                                            <div>
                                                <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{nomMed(l)}</span>
                                                {detMed(l) && <span style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginLeft:6 }}>{detMed(l)}</span>}
                                                <p style={{ fontSize:12, color:'#374151', fontFamily:'system-ui,sans-serif', marginTop:4 }}>{l.posologie}</p>
                                                {l.instructions && <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{l.instructions}</p>}
                                            </div>
                                            <div style={{ textAlign:'right', flexShrink:0, marginLeft:16 }}>
                                                <p style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{l.quantite_prescrite} u.</p>
                                                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{l.duree_jours?`${l.duree_jours}j`:'—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                        {selected.instructions_generales && (
                            <div style={{ borderRadius:12, background:'#fafaf9', padding:'12px 14px' }}>
                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Instructions générales</p>
                                <p style={{ fontSize:13, color:'#1a1a18', lineHeight:1.6 }}>{selected.instructions_generales}</p>
                            </div>
                        )}
                    </div>
                    <MFooter>
                        <CancelBtn onClick={()=>setShowView(false)}/>
                        <button onClick={()=>{setShowView(false);openEdit(selected);}} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>✏️ Modifier</button>
                        <button onClick={()=>window.open(`/prescriptions/${selected.id}/print`,'_blank')} style={{ height:36, padding:'0 16px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>🖨️ Imprimer</button>
                    </MFooter>
                </MModal>
            )}

            {/* ══════════════════════════════════════ MODAL STATUT */}
            {showStatut && selected && (
                <MModal onClose={()=>setShowStatut(false)} maxW={400}>
                    <MHead title="Changer le statut" sub={`${selected.numero} · ${selected.patient?.prenom} ${selected.patient?.nom}`} onClose={()=>setShowStatut(false)}/>
                    <form onSubmit={e=>{ e.preventDefault(); if(!selected) return; statutForm.put(`/prescriptions/${selected.id}/statut`,{onSuccess:()=>{setShowStatut(false);setSelected(null);}}); }} style={{ padding:'16px 22px' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {Object.entries(STATUTS).map(([k,v])=>{
                                const active = statutForm.data.statut===k;
                                return (
                                    <label key={k} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${active?v.color:'#f0f0ee'}`, background:active?v.bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                        <input type="radio" name="statut" value={k} checked={active} onChange={e=>statutForm.setData('statut',e.target.value)} style={{ accentColor:v.color }}/>
                                        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{v.label}</span>
                                        <Badge statut={k}/>
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16, paddingTop:14, borderTop:'1px solid #f0f0ee' }}>
                            <CancelBtn onClick={()=>setShowStatut(false)}/>
                            <SubmitBtn label="Enregistrer" disabled={statutForm.processing}/>
                        </div>
                    </form>
                </MModal>
            )}

            {/* ══════════════════════════════════════ MODAL ÉDITER */}
            {showEdit && selected && (
                <MModal onClose={()=>setShowEdit(false)} maxW={720}>
                    <MHead title={<>Modifier — <span style={{fontFamily:'monospace',color:'#f53003'}}>{selected.numero}</span></>} sub={`${selected.patient?.prenom} ${selected.patient?.nom}`} onClose={()=>setShowEdit(false)}/>
                    <form onSubmit={e=>{ e.preventDefault(); editForm.transform(d=>({...d,lignes:lignesEdit})); editForm.put(`/prescriptions/${selected.id}`,{onSuccess:()=>{setShowEdit(false);setSelected(null);setLignesEdit([]);}}); }} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
                        <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:16 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Date de validité</label>
                                    <input type="date" value={editForm.data.date_validite} onChange={e=>editForm.setData('date_validite',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}/>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Instructions générales</label>
                                    <textarea rows={2} value={editForm.data.instructions_generales} onChange={e=>editForm.setData('instructions_generales',e.target.value)}
                                        style={{ ...iSx, height:'auto', padding:'8px 10px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                                </div>
                            </div>
                            <div>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                                    <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>Médicaments ({lignesEdit.length})</span>
                                    <button type="button" onClick={()=>setLignesEdit(p=>[...p,ligneVide()])} style={{ fontSize:12, fontWeight:700, color:'#f53003', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                                        + Ajouter
                                    </button>
                                </div>
                                {lignesEdit.length===0
                                    ? <button type="button" onClick={()=>setLignesEdit(p=>[...p,ligneVide()])} style={{ width:'100%', padding:'24px', borderRadius:14, border:'2px dashed #e5e7eb', background:'transparent', cursor:'pointer', fontSize:13, color:'#c0c0bc', fontFamily:'system-ui,sans-serif' }}>+ Ajouter un médicament</button>
                                    : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                        {lignesEdit.map((l,i)=>(
                                            <LigneRow key={i} ligne={l} idx={i} medicaments={medicaments}
                                                onUpdate={(f,v)=>updEdit(i,f,v)}
                                                onDelete={()=>setLignesEdit(p=>p.filter((_,x)=>x!==i))}/>
                                        ))}
                                    </div>
                                }
                            </div>
                        </div>
                        <MFooter>
                            <CancelBtn onClick={()=>setShowEdit(false)}/>
                            <SubmitBtn label={editForm.processing?'Enregistrement…':'Enregistrer'} disabled={editForm.processing||!canEditSubmit}/>
                        </MFooter>
                    </form>
                </MModal>
            )}

            {/* ══════════════════════════════════════ MODAL NOUVELLE PRESCRIPTION */}
            {showModal && (
                <MModal onClose={closeModal} maxW={820}>
                    <MHead title="Nouvelle prescription" sub="Prescrire des médicaments à un patient" onClose={closeModal}/>
                    <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden' }}>
                        <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:22 }}>

                            {/* Étape 1 — Patient */}
                            <div>
                                <StepLabel n={1} label="Sélection du patient"/>
                                <select value={form.data.patient_id} onChange={e=>handlePatientChange(e.target.value)} style={{ ...iSx, height:40, padding:'0 12px' }} onFocus={fIn} onBlur={fOut}>
                                    <option value="">Sélectionner un patient…</option>
                                    {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom} — {p.date_naissance?fmt(p.date_naissance):''} ({p.sexe})</option>)}
                                </select>
                                {patientSel && (
                                    <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:10, borderRadius:12, background:'#fafaf9', padding:'10px 14px' }}>
                                        <div style={{ width:36, height:36, borderRadius:10, background:patientSel.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff' }}>
                                            {patientSel.prenom?.[0]}{patientSel.nom?.[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{patientSel.prenom} {patientSel.nom}</p>
                                            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{patientSel.date_naissance?fmt(patientSel.date_naissance):''}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Étape 2 — Anomalie */}
                            {form.data.patient_id && (
                                <div>
                                    <StepLabel n={2} label="Anomalie à traiter"/>
                                    {loadingAn
                                        ? <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>⏳ Chargement des anomalies…</p>
                                        : (
                                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                                <label style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${form.data.anomalie_id===''?'#f53003':'#f0f0ee'}`, background:form.data.anomalie_id===''?'#fff5f5':'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                                    <input type="radio" name="anomalie_id" value="" checked={form.data.anomalie_id===''} onChange={()=>form.setData('anomalie_id','')} style={{ accentColor:'#f53003' }}/>
                                                    <span style={{ fontSize:12, color:'#706f6c', fontStyle:'italic', fontFamily:'system-ui,sans-serif' }}>{anomalies.length===0?'Aucune anomalie — prescription libre':'Prescription libre'}</span>
                                                </label>
                                                {anomalies.map(a=>(
                                                    <label key={a.id} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${form.data.anomalie_id===String(a.id)?'#f53003':'#f0f0ee'}`, background:form.data.anomalie_id===String(a.id)?'#fff5f5':'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                                        <input type="radio" name="anomalie_id" value={a.id} checked={form.data.anomalie_id===String(a.id)} onChange={e=>form.setData('anomalie_id',e.target.value)} style={{ accentColor:'#f53003', marginTop:2 }}/>
                                                        <div style={{ minWidth:0 }}>
                                                            <SevBadge sev={a.severite}/>
                                                            <p style={{ fontSize:12, fontWeight:600, color:'#1a1a18', marginTop:4 }}>{a.titre}</p>
                                                            {a.description && <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description}</p>}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )
                                    }
                                </div>
                            )}

                            {/* Étape 3 — Médicaments */}
                            {form.data.patient_id && (
                                <div>
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                                        <StepLabel n={3} label="Médicaments prescrits"/>
                                        <button type="button" onClick={()=>setLignes(p=>[...p,ligneVide()])} style={{ fontSize:12, fontWeight:700, color:'#f53003', background:'none', border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', gap:4 }}>
                                            + Ajouter
                                        </button>
                                    </div>
                                    {lignes.length===0
                                        ? <button type="button" onClick={()=>setLignes(p=>[...p,ligneVide()])} style={{ width:'100%', padding:'28px', borderRadius:14, border:'2px dashed #e5e7eb', background:'transparent', cursor:'pointer', fontSize:13, color:'#c0c0bc', fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                                            💊<span>Ajouter le premier médicament</span>
                                          </button>
                                        : <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                            {lignes.map((l,i)=>(
                                                <LigneRow key={i} ligne={l} idx={i} medicaments={medicaments}
                                                    onUpdate={(f,v)=>updLigne(i,f,v)}
                                                    onDelete={()=>setLignes(p=>p.filter((_,x)=>x!==i))}/>
                                            ))}
                                          </div>
                                    }
                                </div>
                            )}

                            {/* Étape 4 — Compléments */}
                            {form.data.patient_id && (
                                <div>
                                    <StepLabel n={4} label="Informations complémentaires"/>
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                                        <div>
                                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Date de validité</label>
                                            <input type="date" value={form.data.date_validite} onChange={e=>form.setData('date_validite',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}/>
                                        </div>
                                        <div>
                                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Instructions générales</label>
                                            <textarea rows={2} value={form.data.instructions_generales} onChange={e=>form.setData('instructions_generales',e.target.value)} placeholder="Recommandations…"
                                                style={{ ...iSx, height:'auto', padding:'8px 10px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <MFooter>
                            <CancelBtn onClick={closeModal}/>
                            <SubmitBtn label={form.processing?'Enregistrement…':'Valider la prescription'} disabled={form.processing||!canSubmit}/>
                        </MFooter>
                    </form>
                </MModal>
            )}
        </DashboardLayout>
    );
}