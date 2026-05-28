import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Consultation {
    id: number;
    numero: string;
    patient: { id: number; nom: string; prenom: string; sexe: 'M'|'F'; date_naissance: string };
    medecin: { id: number; name: string };
    service: { id: number; nom: string } | null;
    motif: string;
    type: 'interne'|'externe'|'urgence'|'teleconsultation';
    statut: 'en_attente'|'en_cours'|'terminee'|'annulee';
    date_consultation: string;
    heure_debut: string;
    heure_fin: string | null;
    diagnostic: string | null;
    ordonnance: boolean;
    examens_demandes: boolean;
    notes: string | null;
    created_at: string;
}

interface Anomalie { id: number; nom: string; categorie: string|null; }
interface Patient { id: number; nom: string; prenom: string; sexe: string; date_naissance: string; }
interface Medecin { id: number; name: string; }
interface Service { id: number; nom: string; }

interface Props {
    consultations: { data: Consultation[]; total: number; last_page: number; links: any[] };
    stats: { total: number; aujourd_hui: number; en_cours: number; terminees: number; urgences: number };
    patients: Patient[];
    medecins: Medecin[];
    services: Service[];
    anomalies: Anomalie[];
    filters: { search?: string; type?: string; statut?: string; date?: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
    interne:        { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', label:'Interne',        icon:'🏥' },
    externe:        { color:'#059669', bg:'#f0fdf4', border:'#bbf7d0', label:'Externe',        icon:'🚶' },
    urgence:        { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'Urgence',        icon:'🚨' },
    teleconsultation:{ color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', label:'Téléconsult.', icon:'💻' },
};

const STATUT_CFG: Record<string, { color: string; bg: string; border: string; label: string }> = {
    en_attente: { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'En attente' },
    en_cours:   { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', label:'En cours'   },
    terminee:   { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', label:'Terminée'   },
    annulee:    { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', label:'Annulée'    },
};

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}><div style={{ width:3, height:13, borderRadius:100, background:color }}/><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span></div>;
}
function FL({ label, children }: { label:string; children:React.ReactNode }) {
    return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>{children}</div>;
}


// ─── Config couleurs catégories ──────────────────────────────────────────────

const CAT_COLORS: Record<string, { color: string; bg: string; dot: string }> = {
    'Cardiovasculaire':               { color:'#dc2626', bg:'#fef2f2', dot:'#ef4444' },
    'Respiratoire':                   { color:'#0284c7', bg:'#f0f9ff', dot:'#38bdf8' },
    'Neurologique':                   { color:'#7c3aed', bg:'#f5f3ff', dot:'#a78bfa' },
    'Digestif / Gastro-entérologie':  { color:'#d97706', bg:'#fffbeb', dot:'#fbbf24' },
    'Endocrinologie / Métabolisme':   { color:'#059669', bg:'#f0fdf4', dot:'#34d399' },
    'Infectieux / Parasitaire':       { color:'#16a34a', bg:'#f0fdf4', dot:'#4ade80' },
    'Dermatologie':                   { color:'#db2777', bg:'#fdf2f8', dot:'#f472b6' },
    'Rhumatologie / Ostéo-articulaire':{ color:'#92400e', bg:'#fff7ed', dot:'#f59e0b' },
    'Urologie / Néphrologie':         { color:'#0369a1', bg:'#e0f2fe', dot:'#7dd3fc' },
    'Gynécologie / Obstétrique':      { color:'#be185d', bg:'#fdf2f8', dot:'#f9a8d4' },
    'Pédiatrie':                      { color:'#2563eb', bg:'#eff6ff', dot:'#93c5fd' },
    'Psychiatrie / Santé mentale':    { color:'#6d28d9', bg:'#ede9fe', dot:'#c4b5fd' },
    'Ophtalmologie':                  { color:'#0e7490', bg:'#ecfeff', dot:'#67e8f9' },
    'ORL':                            { color:'#4338ca', bg:'#eef2ff', dot:'#a5b4fc' },
    'Hématologie / Oncologie':        { color:'#b91c1c', bg:'#fef2f2', dot:'#fca5a5' },
    'Immunologie / Allergologie':     { color:'#15803d', bg:'#f0fdf4', dot:'#86efac' },
    'Traumatologie / Orthopédie':     { color:'#92400e', bg:'#fef3c7', dot:'#fcd34d' },
    'Chirurgie':                      { color:'#374151', bg:'#f9fafb', dot:'#9ca3af' },
    'Urgences':                       { color:'#f53003', bg:'#fff5f5', dot:'#f87171' },
    'Autre':                          { color:'#6b7280', bg:'#f9fafb', dot:'#d1d5db' },
};
const getCC = (cat: string) => CAT_COLORS[cat] ?? CAT_COLORS['Autre'];

// ─── Composant MultiSelect Anomalies ────────────────────────────────────────

function AnomalieSelect({ anomalies, selected, onChange }: {
    anomalies: Anomalie[];
    selected: number[];
    onChange: (ids: number[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [open,   setOpen]   = useState(false);

    const filtered = anomalies.filter(a =>
        a.nom.toLowerCase().includes(search.toLowerCase()) ||
        (a.categorie ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const grouped: Record<string, Anomalie[]> = {};
    for (const a of filtered) {
        const k = a.categorie ?? 'Autre';
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push(a);
    }

    const toggle = (id: number) => {
        onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    };

    const selectedAnomalies = anomalies.filter(a => selected.includes(a.id));
    const totalCats = Object.keys(grouped).length;

    return (
        <div style={{ position: 'relative' }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>
                Motif(s) de consultation *
                {selected.length > 0 && (
                    <span style={{ marginLeft:8, fontSize:11, fontWeight:700, color:'#f53003', background:'#fff5f5', border:'1px solid #fecaca', borderRadius:100, padding:'2px 8px' }}>
                        {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                    </span>
                )}
            </label>

            {/* Zone de saisie + tags */}
            <div
                onClick={() => setOpen(true)}
                style={{ minHeight:42, padding:'6px 10px', borderRadius:11, border:`1.5px solid ${open ? '#f53003' : selected.length > 0 ? '#fecaca' : '#f0f0ee'}`, background: open ? '#fff' : selected.length > 0 ? '#fff9f9' : '#fafaf9', cursor:'text', display:'flex', flexWrap:'wrap', gap:5, alignItems:'center', transition:'all 0.15s', boxShadow: open ? '0 0 0 3px rgba(245,48,3,0.07)' : 'none' }}>

                {/* Tags sélectionnés */}
                {selectedAnomalies.map(a => {
                    const cc = getCC(a.categorie ?? 'Autre');
                    return (
                        <span key={a.id} style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:cc.color, background:cc.bg, border:`1px solid ${cc.dot}40`, borderRadius:8, padding:'3px 8px', fontFamily:'system-ui,sans-serif', lineHeight:1.2 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:cc.dot, flexShrink:0 }}/>
                            {a.nom}
                            <button type="button"
                                onClick={e => { e.stopPropagation(); toggle(a.id); }}
                                style={{ width:14, height:14, borderRadius:'50%', background:'rgba(0,0,0,0.08)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, flexShrink:0, transition:'background 0.1s' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = cc.color}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.08)'}>
                                <svg style={{width:7,height:7,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </span>
                    );
                })}

                {/* Input de recherche inline */}
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={selected.length === 0 ? '🔍  Rechercher une pathologie…' : 'Ajouter…'}
                    style={{ flex:1, minWidth:160, border:'none', background:'transparent', outline:'none', fontSize:13, color:'#374151', fontFamily:'system-ui,sans-serif', padding:'2px 4px' }}
                />

                {/* Bouton effacer tout */}
                {selected.length > 0 && (
                    <button type="button"
                        onClick={e => { e.stopPropagation(); onChange([]); setSearch(''); }}
                        style={{ marginLeft:'auto', height:22, padding:'0 8px', borderRadius:6, background:'#f5f5f3', border:'none', cursor:'pointer', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', whiteSpace:'nowrap', flexShrink:0 }}>
                        ✕ Tout effacer
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {open && (
                <>
                    <div style={{ position:'fixed', inset:0, zIndex:40 }} onClick={() => { setOpen(false); setSearch(''); }}/>
                    <div style={{ position:'absolute', left:0, right:0, top:'calc(100% + 6px)', zIndex:50, borderRadius:16, border:'1px solid #f0f0ee', background:'#fff', boxShadow:'0 20px 50px rgba(0,0,0,0.14)', overflow:'hidden' }}>

                        {/* Header dropdown */}
                        <div style={{ padding:'10px 14px 8px', borderBottom:'1px solid #f5f5f3', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'system-ui,sans-serif' }}>
                                {filtered.length} pathologie{filtered.length !== 1 ? 's' : ''}{search ? ` pour "${search}"` : ''} · {totalCats} catégorie{totalCats !== 1 ? 's' : ''}
                            </span>
                            {selected.length > 0 && (
                                <span style={{ fontSize:11, fontWeight:700, color:'#f53003', fontFamily:'system-ui,sans-serif' }}>
                                    {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {/* Liste scrollable */}
                        <div style={{ maxHeight:300, overflowY:'auto' }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding:'28px', textAlign:'center' }}>
                                    <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
                                    <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 4px', fontFamily:'system-ui,sans-serif' }}>Aucune pathologie trouvée</p>
                                    <p style={{ fontSize:12, color:'#9ca3af', margin:0, fontFamily:'system-ui,sans-serif' }}>Essayez un autre terme</p>
                                </div>
                            ) : (
                                Object.entries(grouped)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([cat, items]) => {
                                        const cc = getCC(cat);
                                        const selInCat = items.filter(a => selected.includes(a.id)).length;
                                        return (
                                            <div key={cat}>
                                                {/* Header catégorie */}
                                                <div style={{ padding:'7px 14px', display:'flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${cc.bg},#fff)`, borderBottom:`1px solid ${cc.dot}20`, position:'sticky', top:0 }}>
                                                    <div style={{ width:8, height:8, borderRadius:'50%', background:cc.dot, flexShrink:0, boxShadow:`0 0 4px ${cc.dot}80` }}/>
                                                    <span style={{ fontSize:10, fontWeight:800, color:cc.color, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'system-ui,sans-serif', flex:1 }}>{cat}</span>
                                                    {selInCat > 0 && (
                                                        <span style={{ fontSize:10, fontWeight:700, color:cc.color, background:cc.bg, border:`1px solid ${cc.dot}60`, borderRadius:100, padding:'1px 7px' }}>
                                                            {selInCat}/{items.length}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Items */}
                                                {items.map((a, idx) => {
                                                    const isSel = selected.includes(a.id);
                                                    return (
                                                        <button key={a.id} type="button"
                                                            onClick={() => { toggle(a.id); setSearch(''); }}
                                                            style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'10px 16px', background:isSel ? `${cc.bg}` : 'transparent', border:'none', borderBottom: idx < items.length - 1 ? '1px solid #f9f9f8' : 'none', cursor:'pointer', textAlign:'left', transition:'background 0.1s' }}
                                                            onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}
                                                            onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                                                            {/* Checkbox stylisé */}
                                                            <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${isSel ? cc.color : '#d1d5db'}`, background:isSel ? cc.color : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s', boxShadow:isSel ? `0 2px 6px ${cc.color}40` : 'none' }}>
                                                                {isSel && (
                                                                    <svg style={{width:10,height:10,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                                                                    </svg>
                                                                )}
                                                            </div>

                                                            {/* Nom anomalie */}
                                                            <span style={{ fontSize:13, fontWeight:isSel ? 600 : 400, color:isSel ? cc.color : '#1a1a18', fontFamily:'system-ui,sans-serif', flex:1, lineHeight:1.3 }}>
                                                                {a.nom}
                                                            </span>

                                                            {/* Pastille si sélectionné */}
                                                            {isSel && (
                                                                <div style={{ width:6, height:6, borderRadius:'50%', background:cc.dot, flexShrink:0 }}/>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                            )}
                        </div>

                        {/* Footer */}
                        {selected.length > 0 && (
                            <div style={{ padding:'10px 14px', borderTop:'1px solid #f5f5f3', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                                    {selectedAnomalies.slice(0, 3).map(a => {
                                        const cc = getCC(a.categorie ?? 'Autre');
                                        return <span key={a.id} style={{ fontSize:11, fontWeight:600, color:cc.color, background:cc.bg, borderRadius:100, padding:'2px 8px', fontFamily:'system-ui,sans-serif' }}>{a.nom}</span>;
                                    })}
                                    {selected.length > 3 && <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', padding:'2px 0' }}>+{selected.length - 3} autres</span>}
                                </div>
                                <button type="button"
                                    onClick={() => { setOpen(false); setSearch(''); }}
                                    style={{ height:30, padding:'0 14px', borderRadius:8, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 2px 8px rgba(245,48,3,0.25)', flexShrink:0 }}>
                                    ✓ Confirmer
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}


// ─── Modal Nouvelle Consultation ─────────────────────────────────────────────

function ConsultationModal({ patients, medecins, services, anomalies, editItem, onClose }: {
    patients: Patient[]; medecins: Medecin[]; services: Service[]; anomalies: Anomalie[];
    editItem: Consultation|null; onClose:()=>void;
}) {
    const today = new Date().toISOString().slice(0,10);
    const now   = new Date().toTimeString().slice(0,5);

    const [form, setForm] = useState({
        patient_id:        editItem?.patient.id.toString()    ?? '',
        medecin_id:        editItem?.medecin.id.toString()    ?? '',
        service_id:        editItem?.service?.id.toString()   ?? '',
        motif:             editItem?.motif                    ?? '',
        anomalie_ids:      (editItem as any)?.anomalie_ids      ?? [] as number[],
        type:              editItem?.type                     ?? 'interne',
        statut:            editItem?.statut                   ?? 'en_attente',
        date_consultation: editItem?.date_consultation        ?? today,
        heure_debut:       editItem?.heure_debut              ?? now,
        heure_fin:         editItem?.heure_fin                ?? '',
        diagnostic:        editItem?.diagnostic               ?? '',
        ordonnance:        editItem?.ordonnance               ?? false,
        examens_demandes:  editItem?.examens_demandes         ?? false,
        notes:             editItem?.notes                    ?? '',
    });
    const [processing, setProcessing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const opts = { onFinish:()=>setProcessing(false), onSuccess:onClose };
        editItem
            ? router.put(`/consultations/${editItem.id}`, form as any, opts)
            : router.post('/consultations', form as any, opts);
    };

    const typeCfg = TYPE_CFG[form.type] ?? TYPE_CFG.interne;

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:680, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>

                {/* Header */}
                <div style={{ padding:'18px 22px 14px', background:`linear-gradient(135deg,${typeCfg.bg},#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:42, height:42, borderRadius:13, background:typeCfg.bg, border:`1.5px solid ${typeCfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                            {typeCfg.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize:16, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>
                                {editItem ? 'Modifier la consultation' : 'Nouvelle consultation'}
                            </h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>
                                Enregistrement d'une consultation médicale
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                    {/* Type de consultation */}
                    <div>
                        <SLabel label="Type de consultation" color={typeCfg.color}/>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                            {Object.entries(TYPE_CFG).map(([k,v])=>{
                                const active = form.type===k;
                                return (
                                    <button key={k} type="button" onClick={()=>setForm(p=>({...p,type:k as 'interne'|'externe'|'urgence'|'teleconsultation'}))}
                                        style={{ padding:'10px 8px', borderRadius:12, border:`1.5px solid ${active?v.color:'#f0f0ee'}`, background:active?v.bg:'#fafaf9', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                                        <div style={{ fontSize:20, marginBottom:4 }}>{v.icon}</div>
                                        <p style={{ fontSize:11, fontWeight:700, color:active?v.color:'#374151', fontFamily:'system-ui,sans-serif' }}>{v.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Patient + Médecin */}
                    <div>
                        <SLabel label="Patient & Médecin" color="#3b82f6"/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <FL label="Patient *">
                                <select value={form.patient_id} onChange={e=>setForm(p=>({...p,patient_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                    <option value="">Sélectionner…</option>
                                    {patients.map(p=><option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                                </select>
                            </FL>
                            <FL label="Médecin *">
                                <select value={form.medecin_id} onChange={e=>setForm(p=>({...p,medecin_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                    <option value="">Sélectionner…</option>
                                    {medecins.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </FL>
                        </div>
                    </div>

                    {/* Service + Motif */}
                    <div>
                        <SLabel label="Détails" color="#059669"/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                            <FL label="Service">
                                <select value={form.service_id} onChange={e=>setForm(p=>({...p,service_id:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                    <option value="">Sélectionner…</option>
                                    {services.map(s=><option key={s.id} value={s.id}>{s.nom}</option>)}
                                </select>
                            </FL>
                            <FL label="Statut">
                                <select value={form.statut} onChange={e=>setForm(p=>({...p,statut:e.target.value as 'en_attente'|'en_cours'|'terminee'|'annulee'}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                    {Object.entries(STATUT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                                </select>
                            </FL>
                        </div>
                        <AnomalieSelect
                            anomalies={anomalies}
                            selected={form.anomalie_ids}
                            onChange={ids => {
                                const noms = anomalies.filter(a=>ids.includes(a.id)).map(a=>a.nom).join(', ');
                                setForm(p=>({...p, anomalie_ids:ids, motif:noms}));
                            }}
                        />
                    </div>

                    {/* Date + Heures */}
                    <div>
                        <SLabel label="Planification" color="#f59e0b"/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                            <FL label="Date *">
                                <input type="date" value={form.date_consultation} onChange={e=>setForm(p=>({...p,date_consultation:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}/>
                            </FL>
                            <FL label="Heure début *">
                                <input type="time" value={form.heure_debut} onChange={e=>setForm(p=>({...p,heure_debut:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}/>
                            </FL>
                            <FL label="Heure fin">
                                <input type="time" value={form.heure_fin} onChange={e=>setForm(p=>({...p,heure_fin:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}/>
                            </FL>
                        </div>
                    </div>

                    {/* Diagnostic */}
                    <div>
                        <SLabel label="Diagnostic & Notes" color="#8b5cf6"/>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            <FL label="Diagnostic">
                                <input type="text" value={form.diagnostic} onChange={e=>setForm(p=>({...p,diagnostic:e.target.value}))} placeholder="Diagnostic principal…" style={iSx} onFocus={fIn} onBlur={fOut}/>
                            </FL>
                            <FL label="Notes cliniques">
                                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={3} placeholder="Observations, antécédents, recommandations…"
                                    style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                            </FL>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        {[
                            { key:'ordonnance',       label:'Ordonnance émise',      icon:'💊', color:'#059669', bg:'#f0fdf4', border:'#bbf7d0' },
                            { key:'examens_demandes', label:'Examens complémentaires',icon:'🧪', color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd' },
                        ].map(({key,label,icon,color,bg,border})=>{
                            const active = form[key as 'ordonnance'|'examens_demandes'];
                            return (
                                <label key={key} onClick={()=>setForm(p=>({...p,[key]:!p[key as 'ordonnance'|'examens_demandes']}))}
                                    style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, border:`1.5px solid ${active?color:'#f0f0ee'}`, background:active?bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                    <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${active?color:'#d1d5db'}`, background:active?color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        {active && <svg style={{width:11,height:11,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                    </div>
                                    <span style={{ fontSize:12 }}>{icon}</span>
                                    <span style={{ fontSize:12, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                                </label>
                            );
                        })}
                    </div>

                    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                        <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                        <button type="submit" disabled={processing}
                            style={{ height:36, padding:'0 18px', borderRadius:9, background:`linear-gradient(135deg,${typeCfg.color},${typeCfg.color}cc)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:`0 4px 14px ${typeCfg.color}30`, display:'flex', alignItems:'center', gap:7 }}>
                            ✓ {processing ? 'Enregistrement…' : editItem ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Consultations({ consultations, stats, patients=[], medecins=[], services=[], anomalies=[], filters={} }: Partial<Props>) {
    const { flash }: any = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem,  setEditItem]  = useState<Consultation|null>(null);
    const [search,    setSearch]    = useState(filters.search  ?? '');
    const [typeF,     setTypeF]     = useState(filters.type    ?? '');
    const [statutF,   setStatutF]   = useState(filters.statut  ?? '');
    const [dateF,     setDateF]     = useState(filters.date    ?? '');

    const today = new Date().toISOString().slice(0,10);

    const apply = (ov: object = {}) => router.get('/consultations', { search, type:typeF, statut:statutF, date:dateF, ...ov }, { preserveState:true, replace:true });

    const del = (c: Consultation) => {
        if (confirm(`Supprimer la consultation ${c.numero} ?`)) router.delete(`/consultations/${c.id}`);
    };

    const kpi = stats ?? { total:0, aujourd_hui:0, en_cours:0, terminees:0, urgences:0 };

    return (
        <DashboardLayout title="Consultations" subtitle="Gestion des consultations médicales">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total',        value:kpi.total,         icon:'📋', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:"Aujourd'hui",  value:kpi.aujourd_hui,   icon:'📅', grad:'linear-gradient(135deg,#1e3a8a,#2563eb)', shadow:'rgba(37,99,235,0.35)' },
                    { label:'En cours',     value:kpi.en_cours,      icon:'⏳', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
                    { label:'Terminées',    value:kpi.terminees,     icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'Urgences',     value:kpi.urgences,      icon:'🚨', grad:'linear-gradient(135deg,#991b1b,#ef4444)', shadow:'rgba(239,68,68,0.35)' },
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
                    {/* Recherche */}
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="N°, patient, médecin, motif…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:240 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>

                    {/* Filtre type */}
                    <div style={{ display:'flex', borderRadius:10, border:'1.5px solid #f0f0ee', overflow:'hidden' }}>
                        {[['','Tous'],['interne','🏥'],['externe','🚶'],['urgence','🚨'],['teleconsultation','💻']].map(([v,l])=>(
                            <button key={v} onClick={()=>{ setTypeF(v); apply({type:v}); }}
                                style={{ height:36, padding:'0 10px', fontSize:13, fontFamily:'system-ui,sans-serif', background:typeF===v?'#f53003':'#fafaf9', color:typeF===v?'#fff':'#9ca3af', border:'none', cursor:'pointer', transition:'all 0.15s' }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <select value={statutF} onChange={e=>{ setStatutF(e.target.value); apply({statut:e.target.value}); }}
                        style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                        <option value="">Tous statuts</option>
                        {Object.entries(STATUT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>

                    {/* Date picker */}
                    <div style={{ position:'relative' }}>
                        <input type="date" value={dateF} onChange={e=>{ setDateF(e.target.value); apply({date:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:`1.5px solid ${dateF?'#f53003':'#f0f0ee'}`, background:dateF?'#fff5f5':'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer', color:dateF?'#f53003':'#374151' }}
                            onFocus={fIn} onBlur={fOut}/>
                        {dateF && (
                            <button onClick={()=>{ setDateF(''); apply({date:''}); }}
                                style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:16, height:16, borderRadius:'50%', background:'#f53003', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg style={{width:8,height:8,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        )}
                    </div>

                    {/* Raccourci aujourd'hui */}
                    {dateF !== today && (
                        <button onClick={()=>{ setDateF(today); apply({date:today}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, fontWeight:600, color:'#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}
                            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.color='#f53003'; }}
                            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f0f0ee'; (e.currentTarget as HTMLElement).style.color='#9ca3af'; }}>
                            📅 Aujourd'hui
                        </button>
                    )}
                </div>

                <button onClick={()=>{ setEditItem(null); setShowModal(true); }}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouvelle consultation
                </button>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#2563eb,#059669,#dc2626,#7c3aed)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['N° Consultation','Patient','Médecin','Motif','Type','Date & Heure','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===7?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!consultations || consultations.data.length===0) ? (
                                <tr><td colSpan={8} style={{ padding:'52px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:40, marginBottom:10 }}>🩺</div>
                                    <p style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>Aucune consultation trouvée</p>
                                    <p>Modifiez vos filtres ou créez une nouvelle consultation.</p>
                                </td></tr>
                            ) : consultations.data.map((c,i)=>{
                                const tc = TYPE_CFG[c.type]   ?? TYPE_CFG.interne;
                                const sc = STATUT_CFG[c.statut] ?? STATUT_CFG.en_attente;
                                return (
                                    <tr key={c.id} style={{ borderBottom:i<consultations.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s', borderLeft:`3px solid ${c.type==='urgence'?'#dc2626':'transparent'}` }}
                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                <div style={{ width:32, height:32, borderRadius:9, background:tc.bg, border:`1.5px solid ${tc.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{tc.icon}</div>
                                                <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#f53003' }}>{c.numero}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                <div style={{ width:30, height:30, borderRadius:9, background:c.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                    {c.patient.prenom[0]}{c.patient.nom[0]}
                                                </div>
                                                <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{c.patient.prenom} {c.patient.nom}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding:'12px 14px', fontSize:13, color:'#374151' }}>Dr. {c.medecin.name}</td>
                                        <td style={{ padding:'12px 14px', maxWidth:180 }}>
                                            <p style={{ fontSize:13, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.motif}</p>
                                            {(c.ordonnance||c.examens_demandes) && (
                                                <div style={{ display:'flex', gap:4, marginTop:3 }}>
                                                    {c.ordonnance        && <span style={{ fontSize:10, color:'#059669', background:'#f0fdf4', borderRadius:100, padding:'1px 6px', border:'1px solid #bbf7d0' }}>💊 Ord.</span>}
                                                    {c.examens_demandes  && <span style={{ fontSize:10, color:'#0284c7', background:'#f0f9ff', borderRadius:100, padding:'1px 6px', border:'1px solid #bae6fd' }}>🧪 Ex.</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:tc.color, background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:100, padding:'3px 10px' }}>
                                                {tc.icon} {tc.label}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{c.date_consultation}</p>
                                            <p style={{ fontSize:11, color:'#9ca3af' }}>{c.heure_debut}{c.heure_fin?` → ${c.heure_fin}`:''}</p>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:sc.color, background:sc.bg, border:`1px solid ${sc.border}`, borderRadius:100, padding:'3px 10px' }}>{sc.label}</span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                                <button onClick={()=>{ setEditItem(c); setShowModal(true); }} title="Modifier"
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
                                                <button onClick={()=>del(c)} title="Supprimer"
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
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

                {/* Pagination */}
                {consultations && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:'1px solid #f5f5f3' }}>
                        <span style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                            <span style={{ fontWeight:600, color:'#1a1a18' }}>{consultations.total}</span> consultations
                        </span>
                        {consultations.last_page>1 && (
                            <div style={{ display:'flex', gap:4 }}>
                                {consultations.links.map((link,i)=>(
                                    <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                        style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                        dangerouslySetInnerHTML={{ __html:link.label }}/>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <ConsultationModal
                    patients={patients} medecins={medecins} services={services}
                    anomalies={anomalies}
                    editItem={editItem}
                    onClose={()=>{ setShowModal(false); setEditItem(null); }}/>
            )}
        </DashboardLayout>
    );
}