import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TypeExamen {
    id: number; code: string; nom: string; description: string|null;
    module: 'laboratoire'|'imagerie'; categorie: string|null;
    modalite_imagerie_id: number|null;
    modalite_imagerie?: { id: number; code: string; nom: string }|null;
    prix: number|null; duree_minutes: number|null; actif: boolean;
    analyses_count: number; examens_imagerie_count: number;
}
interface Props {
    typesExamens: { data: TypeExamen[]; total: number; last_page: number; links: any[] };
    stats: { total: number; laboratoire: number; imagerie: number; actifs: number };
    modalites: { id: number; code: string; nom: string }[];
    filters: { search?: string; module?: string; actif?: string };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATS_LABO     = ['Hématologie','Biochimie','Microbiologie','Immunologie','Parasitologie','Hormonologie','Toxicologie'];
const CATS_IMAGERIE = ['Radiologie conventionnelle','Imagerie en coupe','Sénologie','Dentisterie','Médecine nucléaire'];

const MOD_CLR: Record<string, { color: string; bg: string; border: string }> = {
    'Radiographie': { color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd' },
    'Scanner':      { color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe' },
    'IRM':          { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    'Échographie':  { color:'#0d9488', bg:'#f0fdfa', border:'#99f6e4' },
    'Mammographie': { color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8' },
    'Panoramique':  { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    'TEP-Scan':     { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function SLabel({ label, color='#f53003' }: { label: string; color?: string }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:3, height:14, borderRadius:100, background:color }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span>
        </div>
    );
}

function FL({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>
            {children}
            {error && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{error}</p>}
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function TypeExamenModal({ editItem, onClose, modalites }: { editItem: TypeExamen|null; onClose:()=>void; modalites: { id: number; code: string; nom: string }[] }) {
    const [form, setForm] = useState({
        code: editItem?.code ?? '', nom: editItem?.nom ?? '', description: editItem?.description ?? '',
        module: (editItem?.module ?? 'laboratoire') as 'laboratoire'|'imagerie',
        categorie: editItem?.categorie ?? '',
        modalite_imagerie_id: editItem?.modalite_imagerie_id?.toString() ?? '',
        prix: editItem?.prix?.toString() ?? '', duree_minutes: editItem?.duree_minutes?.toString() ?? '',
        actif: editItem?.actif ?? true,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const cats = form.module==='imagerie' ? CATS_IMAGERIE : CATS_LABO;
    const isLab = form.module === 'laboratoire';

    const setModule = (m: 'laboratoire'|'imagerie') => setForm(f=>({...f,module:m,categorie:'',modalite_imagerie_id:''}));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.module==='imagerie' && !form.modalite_imagerie_id) { setErrors({modalite_imagerie_id:'La modalité est obligatoire pour l\'imagerie'}); return; }
        setErrors({}); setProcessing(true);
        const data = { ...form, prix:form.prix?Number(form.prix):null, duree_minutes:form.duree_minutes?Number(form.duree_minutes):null, modalite_imagerie_id:form.modalite_imagerie_id?Number(form.modalite_imagerie_id):null };
        const opts = { onFinish:()=>setProcessing(false), onSuccess:onClose };
        editItem ? router.put(`/type-examens/${editItem.id}`, data, opts) : router.post('/type-examens', data, opts);
    };

    const modColor = isLab ? '#059669' : '#0284c7';
    const modBg    = isLab ? '#f0fdf4' : '#f0f9ff';

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:680, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>

                {/* Header */}
                <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:modBg, border:`1.5px solid ${modColor}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                            {isLab ? '🧪' : '🩻'}
                        </div>
                        <div>
                            <h2 style={{ fontSize:17, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{editItem ? 'Modifier le type d\'examen' : 'Nouveau type d\'examen'}</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>Catalogue des examens disponibles</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div style={{ overflowY:'auto', flex:1 }}>
                    <form onSubmit={submit} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:20 }}>

                        {/* Sélection module */}
                        <div>
                            <SLabel label="Module *"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                {(['laboratoire','imagerie'] as const).map(m=>{
                                    const active = form.module===m;
                                    const mc = m==='laboratoire' ? '#059669' : '#0284c7';
                                    const mb = m==='laboratoire' ? '#f0fdf4' : '#f0f9ff';
                                    const mbd = m==='laboratoire' ? '#bbf7d0' : '#bae6fd';
                                    return (
                                        <button key={m} type="button" onClick={()=>setModule(m)}
                                            style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, border:`2px solid ${active?mc:'#f0f0ee'}`, background:active?mb:'#fafaf9', cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}>
                                            <div style={{ width:42, height:42, borderRadius:12, background:active?mb:'#f5f5f3', border:`1.5px solid ${active?mbd:'#f0f0ee'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                                                {m==='laboratoire' ? '🧪' : '🩻'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize:14, fontWeight:700, color:active?mc:'#1a1a18' }}>
                                                    {m==='laboratoire' ? 'Laboratoire' : 'Imagerie'}
                                                </p>
                                                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>
                                                    {m==='laboratoire' ? 'Analyses biologiques' : 'Examens radiologiques'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Identification */}
                        <div>
                            <SLabel label="Identification" color={modColor}/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <FL label="Code *">
                                    <input type="text" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder={isLab?"LAB-HEM-001":"IMG-RX-001"} required style={iSx} onFocus={fIn} onBlur={fOut}/>
                                </FL>
                                <FL label="Nom *">
                                    <input type="text" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} placeholder={isLab?"Numération Formule Sanguine":"Radiographie thoracique"} required style={iSx} onFocus={fIn} onBlur={fOut}/>
                                </FL>
                            </div>
                        </div>

                        {/* Catégorie + Modalité */}
                        <div>
                            <SLabel label={isLab ? 'Catégorie' : 'Catégorie & Modalité'} color={modColor}/>
                            <div style={{ display:'grid', gridTemplateColumns:form.module==='imagerie'?'1fr 1fr':'1fr', gap:12 }}>
                                <FL label="Catégorie">
                                    <select value={form.categorie} onChange={e=>setForm(f=>({...f,categorie:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value="">Sélectionner…</option>
                                        {cats.map(c=><option key={c}>{c}</option>)}
                                    </select>
                                </FL>
                                {form.module==='imagerie' && (
                                    <FL label="Modalité *" error={errors.modalite_imagerie_id}>
                                        <select value={form.modalite_imagerie_id} onChange={e=>setForm(f=>({...f,modalite_imagerie_id:e.target.value}))} required style={{ ...iSx, borderColor:errors.modalite_imagerie_id?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}>
                                            <option value="">Sélectionner…</option>
                                            {modalites.map(m=><option key={m.id} value={m.id}>{m.code?`${m.code} - `:''}{m.nom}</option>)}
                                        </select>
                                    </FL>
                                )}
                            </div>
                        </div>

                        {/* Tarification */}
                        <div>
                            <SLabel label="Tarification & durée" color="#f59e0b"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <FL label="Prix (FCFA)">
                                    <input type="number" value={form.prix} onChange={e=>setForm(f=>({...f,prix:e.target.value}))} min={0} placeholder="5000" style={iSx} onFocus={fIn} onBlur={fOut}/>
                                </FL>
                                <FL label="Durée estimée (min)">
                                    <input type="number" value={form.duree_minutes} onChange={e=>setForm(f=>({...f,duree_minutes:e.target.value}))} min={0} placeholder="30" style={iSx} onFocus={fIn} onBlur={fOut}/>
                                </FL>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <SLabel label="Description" color="#8b5cf6"/>
                            <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Description et indications…"
                                style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                        </div>

                        {/* Actif toggle */}
                        <label onClick={()=>setForm(f=>({...f,actif:!f.actif}))}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${form.actif?'#16a34a':'#f0f0ee'}`, background:form.actif?'#f0fdf4':'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                            <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${form.actif?'#16a34a':'#d1d5db'}`, background:form.actif?'#16a34a':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {form.actif && <svg style={{width:11,height:11,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <div>
                                <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>Type d'examen actif</p>
                                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>Visible dans le catalogue de prescriptions</p>
                            </div>
                        </label>

                        {/* Footer */}
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                            <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                            <button type="submit" disabled={processing}
                                style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                                ✓ {processing ? 'Enregistrement…' : editItem ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TypesExamens({ typesExamens, stats, modalites, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem,  setEditItem]  = useState<TypeExamen|null>(null);
    const [search,    setSearch]    = useState(filters.search ?? '');
    const [module,    setModFilter] = useState(filters.module ?? '');
    const [actif,     setActif]     = useState(filters.actif  ?? '');

    if (!typesExamens) return (
        <DashboardLayout title="Types d'examens" subtitle="Catalogue unifié laboratoire et imagerie">
            <div style={{ padding:'32px', textAlign:'center', color:'#dc2626', fontFamily:'system-ui,sans-serif' }}>Erreur : données non chargées.</div>
        </DashboardLayout>
    );

    const apply = (ov: object = {}) => router.get('/type-examens', { search, module, actif, ...ov }, { preserveState:true, replace:true });
    const del = (t: TypeExamen) => {
        const u = t.analyses_count + t.examens_imagerie_count;
        if (u>0) { alert(`Impossible de supprimer : ce type est utilisé dans ${u} examen(s).`); return; }
        if (confirm(`Supprimer "${t.nom}" ?`)) router.delete(`/type-examens/${t.id}`);
    };

    return (
        <DashboardLayout title="Types d'examens" subtitle="Catalogue unifié laboratoire et imagerie">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total',        value:stats.total,       icon:'📋', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Laboratoire',  value:stats.laboratoire, icon:'🧪', grad:'linear-gradient(135deg,#065f46,#059669)', shadow:'rgba(5,150,105,0.35)' },
                    { label:'Imagerie',     value:stats.imagerie,    icon:'🩻', grad:'linear-gradient(135deg,#0c4a6e,#0284c7)', shadow:'rgba(2,132,199,0.35)' },
                    { label:'Actifs',       value:stats.actifs,      icon:'✅', grad:'linear-gradient(135deg,#14532d,#16a34a)', shadow:'rgba(22,163,74,0.3)' },
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
                    {/* Recherche */}
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="Code, nom…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:200 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>

                    {/* Toggle module */}
                    <div style={{ display:'flex', borderRadius:10, border:'1.5px solid #f0f0ee', overflow:'hidden' }}>
                        {[['','Tous'],['laboratoire','🧪 Labo'],['imagerie','🩻 Imagerie']].map(([v,l])=>(
                            <button key={v} onClick={()=>{ setModFilter(v); apply({module:v}); }}
                                style={{ height:36, padding:'0 12px', fontSize:13, fontWeight:600, fontFamily:'system-ui,sans-serif', background:module===v?'#f53003':'#fafaf9', color:module===v?'#fff':'#9ca3af', border:'none', cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                                {l}
                            </button>
                        ))}
                    </div>

                    <select value={actif} onChange={e=>{ setActif(e.target.value); apply({actif:e.target.value}); }}
                        style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                        <option value="">Tous statuts</option>
                        <option value="1">Actifs</option>
                        <option value="0">Inactifs</option>
                    </select>
                </div>

                <button onClick={()=>{ setEditItem(null); setShowModal(true); }}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouveau type
                </button>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#059669,#0284c7,#8b5cf6)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['Code','Nom','Module','Catégorie / Modalité','Prix','Durée','Utilisations','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===8?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {typesExamens.data.length===0 ? (
                                <tr><td colSpan={9} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
                                    <p style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>Aucun type d'examen trouvé</p>
                                    <p>Modifiez vos filtres ou créez un nouveau type.</p>
                                </td></tr>
                            ) : typesExamens.data.map((t,i)=>{
                                const isLab = t.module==='laboratoire';
                                const modCfg = t.modalite_imagerie ? (MOD_CLR[t.modalite_imagerie.nom] ?? { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' }) : null;
                                const usages = t.analyses_count + t.examens_imagerie_count;
                                return (
                                    <tr key={t.id} style={{ borderBottom:i<typesExamens.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s', opacity:t.actif?1:0.6 }}
                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                                            <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:'#f53003' }}>{t.code}</span>
                                        </td>
                                        <td style={{ padding:'12px 14px', maxWidth:200 }}>
                                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.nom}</p>
                                            {t.description && <p style={{ fontSize:11, color:'#9ca3af', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.description}</p>}
                                        </td>
                                        <td style={{ padding:'12px 14px', whiteSpace:'nowrap' }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:isLab?'#059669':'#0284c7', background:isLab?'#f0fdf4':'#f0f9ff', border:`1px solid ${isLab?'#bbf7d0':'#bae6fd'}`, borderRadius:100, padding:'3px 10px' }}>
                                                {isLab ? '🧪 Labo' : '🩻 Imagerie'}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            {t.categorie && <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>{t.categorie}</p>}
                                            {modCfg && t.modalite_imagerie && (
                                                <span style={{ fontSize:11, fontWeight:700, color:modCfg.color, background:modCfg.bg, border:`1px solid ${modCfg.border}`, borderRadius:100, padding:'2px 9px', whiteSpace:'nowrap' }}>
                                                    {t.modalite_imagerie.nom}
                                                </span>
                                            )}
                                            {!t.categorie && !t.modalite_imagerie && <span style={{ color:'#c0c0bc', fontSize:12 }}>—</span>}
                                        </td>
                                        <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color:'#1a1a18', whiteSpace:'nowrap' }}>
                                            {t.prix ? new Intl.NumberFormat('fr-CM').format(t.prix)+' F' : '—'}
                                        </td>
                                        <td style={{ padding:'12px 14px', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>
                                            {t.duree_minutes ? `⏱ ${t.duree_minutes} min` : '—'}
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontSize:12, fontWeight:600, color:'#374151', background:'#f5f5f3', borderRadius:100, padding:'3px 10px' }}>
                                                {usages} examen{usages>1?'s':''}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:t.actif?'#16a34a':'#6b7280', background:t.actif?'#f0fdf4':'#f9fafb', border:`1px solid ${t.actif?'#bbf7d0':'#e5e7eb'}`, borderRadius:100, padding:'3px 10px' }}>
                                                {t.actif ? '● Actif' : '● Inactif'}
                                            </span>
                                        </td>
                                        <td style={{ padding:'12px 14px' }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                                <button onClick={()=>{ setEditItem(t); setShowModal(true); }} title="Modifier"
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
                                                <button onClick={()=>del(t)} title="Supprimer"
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

                {/* Footer pagination */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderTop:'1px solid #f5f5f3' }}>
                    <span style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{typesExamens.total}</span> types d'examens
                    </span>
                    {typesExamens.last_page > 1 && (
                        <div style={{ display:'flex', gap:4 }}>
                            {typesExamens.links.map((link,i)=>(
                                <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                    style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                    dangerouslySetInnerHTML={{ __html:link.label }}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && <TypeExamenModal editItem={editItem} onClose={()=>{ setShowModal(false); setEditItem(null); }} modalites={modalites}/>}
        </DashboardLayout>
    );
}