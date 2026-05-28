import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Anomalie { id: number; nom: string; categorie: string|null; description: string|null; actif: boolean; }
interface Props { anomalies: Anomalie[]; categories: string[]; filters: { search?: string; categorie?: string }; }

// ─── Config catégories ────────────────────────────────────────────────────────

const CATEGORIES_PHARMACIE = [
    'Cardiovasculaire','Respiratoire','Neurologique','Digestif / Gastro-entérologie',
    'Endocrinologie / Métabolisme','Infectieux / Parasitaire','Dermatologie',
    'Rhumatologie / Ostéo-articulaire','Urologie / Néphrologie','Gynécologie / Obstétrique',
    'Pédiatrie','Psychiatrie / Santé mentale','Ophtalmologie','ORL',
    'Hématologie / Oncologie','Immunologie / Allergologie','Traumatologie / Orthopédie',
    'Chirurgie','Urgences','Autre',
];

// Couleur + emoji par catégorie médicale
const CAT_CFG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    'Cardiovasculaire':               { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:'❤️' },
    'Respiratoire':                   { color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd', icon:'🫁' },
    'Neurologique':                   { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', icon:'🧠' },
    'Digestif / Gastro-entérologie':  { color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:'🫃' },
    'Endocrinologie / Métabolisme':   { color:'#059669', bg:'#f0fdf4', border:'#bbf7d0', icon:'⚗️' },
    'Infectieux / Parasitaire':       { color:'#16a34a', bg:'#f0fdf4', border:'#86efac', icon:'🦠' },
    'Dermatologie':                   { color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8', icon:'🧴' },
    'Rhumatologie / Ostéo-articulaire':{ color:'#9a3412', bg:'#fff7ed', border:'#fed7aa', icon:'🦴' },
    'Urologie / Néphrologie':         { color:'#0369a1', bg:'#e0f2fe', border:'#bae6fd', icon:'💧' },
    'Gynécologie / Obstétrique':      { color:'#be185d', bg:'#fdf2f8', border:'#f9a8d4', icon:'🌸' },
    'Pédiatrie':                      { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', icon:'👶' },
    'Psychiatrie / Santé mentale':    { color:'#6d28d9', bg:'#ede9fe', border:'#c4b5fd', icon:'🧘' },
    'Ophtalmologie':                  { color:'#0e7490', bg:'#ecfeff', border:'#a5f3fc', icon:'👁️' },
    'ORL':                            { color:'#4338ca', bg:'#eef2ff', border:'#c7d2fe', icon:'👂' },
    'Hématologie / Oncologie':        { color:'#b91c1c', bg:'#fef2f2', border:'#fca5a5', icon:'🩸' },
    'Immunologie / Allergologie':     { color:'#15803d', bg:'#f0fdf4', border:'#86efac', icon:'🛡️' },
    'Traumatologie / Orthopédie':     { color:'#92400e', bg:'#fef3c7', border:'#fcd34d', icon:'🦿' },
    'Chirurgie':                      { color:'#374151', bg:'#f9fafb', border:'#e5e7eb', icon:'🔪' },
    'Urgences':                       { color:'#f53003', bg:'#fff5f5', border:'#fca5a5', icon:'🚨' },
    'Autre':                          { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', icon:'📋' },
    '—':                              { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', icon:'📋' },
};
const getCat = (c: string) => CAT_CFG[c] ?? CAT_CFG['Autre'];

const FORM_VIDE = { nom:'', categorie:'', description:'' };

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnomaliesIndex({ anomalies=[], categories=[], filters={} }: Partial<Props>) {
    const { flash, errors: serverErrors } = usePage<{ flash?: { success?:string; error?:string }; errors: Record<string,string> }>().props;

    const [search,    setSearch]    = useState(filters.search    ?? '');
    const [categorie, setCategorie] = useState(filters.categorie ?? '');
    const [modal,     setModal]     = useState<'create'|'edit'|null>(null);
    const [editing,   setEditing]   = useState<Anomalie|null>(null);
    const [form,      setForm]      = useState(FORM_VIDE);

    const ouvrirCreate = () => { setForm(FORM_VIDE); setEditing(null); setModal('create'); };
    const ouvrirEdit   = (a: Anomalie) => { setForm({ nom:a.nom, categorie:a.categorie??'', description:a.description??'' }); setEditing(a); setModal('edit'); };
    const fermer       = () => { setModal(null); setEditing(null); };

    const applyFilters = (s: string, c: string) => router.get('/anomalies', { search:s||undefined, categorie:c||undefined }, { preserveScroll:true, replace:true });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (modal==='create') router.post('/anomalies', form, { preserveScroll:true, onSuccess:fermer });
        else if (editing) router.put(`/anomalies/${editing.id}`, form, { preserveScroll:true, onSuccess:fermer });
    };
    const toggleActif = (a: Anomalie) => router.put(`/anomalies/${a.id}`, { nom:a.nom, categorie:a.categorie??'', description:a.description??'', actif:!a.actif }, { preserveScroll:true });
    const supprimer   = (a: Anomalie) => { if (!confirm(`Supprimer « ${a.nom} » ?`)) return; router.delete(`/anomalies/${a.id}`, { preserveScroll:true }); };

    // Groupes
    const groupes: Record<string, Anomalie[]> = {};
    for (const a of anomalies) { const k = a.categorie ?? '—'; if (!groupes[k]) groupes[k]=[]; groupes[k].push(a); }
    const totalActifs = anomalies.filter(a=>a.actif).length;

    return (
        <DashboardLayout title="Anomalies pharmacie" subtitle="Référentiel des anomalies déclarables">

            {/* Flash */}
            {(flash?.success||flash?.error) && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:flash.error?'#fef2f2':'#f0fdf4', border:`1px solid ${flash.error?'#fecaca':'#bbf7d0'}`, fontSize:13, color:flash.error?'#dc2626':'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>
                    {flash.error?'⚠️':'✅'} {flash.success??flash.error}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI mini */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
                {[
                    { label:'Total anomalies',    value:anomalies.length,                          icon:'📋', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.2)' },
                    { label:'Actives',            value:totalActifs,                               icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.3)' },
                    { label:'Inactives',          value:anomalies.length-totalActifs,              icon:'⏸️', grad:'linear-gradient(135deg,#374151,#6b7280)', shadow:'rgba(107,114,128,0.2)' },
                    { label:'Catégories',         value:Object.keys(groupes).length,               icon:'🗂️', grad:'linear-gradient(135deg,#4c1d95,#8b5cf6)', shadow:'rgba(139,92,246,0.3)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:16, padding:'18px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 6px 20px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-12, right:-12, width:60, height:60, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:20, marginBottom:6 }}>{k.icon}</div>
                        <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:10, fontWeight:500, opacity:0.8, marginTop:3, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:22, flexWrap:'wrap' }}>
                <div style={{ position:'relative', flex:1, minWidth:240 }}>
                    <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search}
                        onChange={e=>setSearch(e.target.value)}
                        onKeyDown={e=>{ if(e.key==='Enter') applyFilters(search,categorie); }}
                        placeholder="Rechercher une anomalie…"
                        style={{ ...iSx, paddingLeft:30 }} onFocus={fIn} onBlur={fOut}/>
                </div>
                <select value={categorie} onChange={e=>{ setCategorie(e.target.value); applyFilters(search,e.target.value); }}
                    style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer', maxWidth:280 }}>
                    <option value="">Toutes les catégories</option>
                    {CATEGORIES_PHARMACIE.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={ouvrirCreate}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s', whiteSpace:'nowrap' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouvelle anomalie
                </button>
            </div>

            {/* ══════════════════════════════════════ CONTENU */}
            {anomalies.length===0 ? (
                <div style={{ borderRadius:20, border:'2px dashed #e5e7eb', padding:'60px 40px', textAlign:'center', fontFamily:'system-ui,sans-serif' }}>
                    <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
                    <p style={{ fontSize:15, fontWeight:700, color:'#1a1a18', marginBottom:6 }}>Aucune anomalie dans le référentiel</p>
                    <p style={{ fontSize:13, color:'#9ca3af', marginBottom:18 }}>Commencez par ajouter une première anomalie.</p>
                    <button onClick={ouvrirCreate}
                        style={{ height:36, padding:'0 20px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>
                        Ajouter la première
                    </button>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {Object.entries(groupes)
                        .sort(([a],[b])=>a.localeCompare(b))
                        .map(([catName, items])=>{
                            const cfg = getCat(catName);
                            return (
                                <div key={catName}>
                                    {/* Header catégorie */}
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'4px 12px 4px 8px', borderRadius:100, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                                            <span style={{ fontSize:14 }}>{cfg.icon}</span>
                                            <span style={{ fontSize:11, fontWeight:800, color:cfg.color, letterSpacing:'0.04em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{catName}</span>
                                        </div>
                                        <div style={{ height:1, flex:1, background:'#f0f0ee' }}/>
                                        <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', background:'#f5f5f3', borderRadius:100, padding:'2px 8px', fontFamily:'system-ui,sans-serif' }}>
                                            {items.length} anomalie{items.length>1?'s':''}
                                        </span>
                                    </div>

                                    {/* Liste anomalies */}
                                    <div style={{ borderRadius:16, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
                                        <div style={{ height:2, background:`linear-gradient(90deg,${cfg.color},${cfg.border})` }}/>
                                        {items.map((a,i)=>(
                                            <div key={a.id}
                                                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 16px', borderBottom:i<items.length-1?'1px solid #f5f5f3':'none', opacity:a.actif?1:0.5, transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                                {/* Bullet + nom */}
                                                <div style={{ display:'flex', alignItems:'flex-start', gap:10, flex:1, minWidth:0 }}>
                                                    <div style={{ width:7, height:7, borderRadius:'50%', background:a.actif?cfg.color:'#d1d5db', marginTop:5, flexShrink:0 }}/>
                                                    <div style={{ minWidth:0 }}>
                                                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                                                            <p style={{ fontSize:14, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{a.nom}</p>
                                                            {!a.actif && (
                                                                <span style={{ fontSize:10, fontWeight:700, color:'#6b7280', background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:100, padding:'1px 7px', fontFamily:'system-ui,sans-serif' }}>Inactif</span>
                                                            )}
                                                        </div>
                                                        {a.description && (
                                                            <p style={{ fontSize:12, color:'#9ca3af', marginTop:2, fontFamily:'system-ui,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:480 }}>
                                                                {a.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div style={{ display:'flex', alignItems:'center', gap:2, flexShrink:0 }}>
                                                    <button onClick={()=>ouvrirEdit(a)} title="Modifier"
                                                        style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                    </button>
                                                    <button onClick={()=>toggleActif(a)} title={a.actif?'Désactiver':'Activer'}
                                                        style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=a.actif?'#f0f0ee':'#f0fdf4'}
                                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                        <svg style={{width:13,height:13,color:a.actif?'#9ca3af':'#16a34a'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {a.actif
                                                                ? <path strokeLinecap="round" strokeWidth={1.5} d="M18.36 6.64A9 9 0 115.64 18.36M12 2V12"/>
                                                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            }
                                                        </svg>
                                                    </button>
                                                    <button onClick={()=>supprimer(a)} title="Supprimer"
                                                        style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* ══════════════════════════════════════ MODAL CREATE / EDIT */}
            {modal && (
                <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
                    <div style={{ width:'100%', maxWidth:480, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', overflow:'hidden' }}>

                        {/* Header */}
                        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <div style={{ width:38, height:38, borderRadius:11, background:modal==='create'?'linear-gradient(135deg,#f53003,#ff8c6a)':getCat(form.categorie||'Autre').bg, border:modal==='edit'?`1.5px solid ${getCat(form.categorie||'Autre').border}`:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
                                    {modal==='create' ? '➕' : getCat(form.categorie||'Autre').icon}
                                </div>
                                <div>
                                    <h2 style={{ fontSize:15, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.2px' }}>
                                        {modal==='create' ? 'Nouvelle anomalie' : `Modifier — ${editing?.nom}`}
                                    </h2>
                                    <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>
                                        {modal==='create' ? 'Ajouter au référentiel' : 'Mettre à jour les informations'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={fermer} style={{ width:28, height:28, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg style={{width:12,height:12,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                            <div>
                                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Nom *</label>
                                <input type="text" value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))}
                                    placeholder="ex : Hypertension artérielle" required autoFocus
                                    style={{ ...iSx, borderColor:serverErrors?.nom?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                                {serverErrors?.nom && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{serverErrors.nom}</p>}
                            </div>

                            <div>
                                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Catégorie</label>
                                <div style={{ position:'relative' }}>
                                    {form.categorie && (
                                        <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:16, pointerEvents:'none' }}>
                                            {getCat(form.categorie).icon}
                                        </span>
                                    )}
                                    <select value={form.categorie} onChange={e=>setForm(p=>({...p,categorie:e.target.value}))}
                                        style={{ ...iSx, paddingLeft:form.categorie?34:12, borderColor:form.categorie?getCat(form.categorie).color:'#f0f0ee', background:form.categorie?getCat(form.categorie).bg:'#fafaf9', color:form.categorie?getCat(form.categorie).color:'#374151' }}
                                        onFocus={fIn} onBlur={fOut}>
                                        <option value="">— Choisir une catégorie —</option>
                                        {CATEGORIES_PHARMACIE.map(c=><option key={c} value={c}>{CAT_CFG[c]?.icon??'📋'} {c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Description</label>
                                <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3}
                                    placeholder="Description optionnelle…"
                                    style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                            </div>

                            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                                <button type="button" onClick={fermer} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                                <button type="submit"
                                    style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                                    ✓ {modal==='create' ? 'Ajouter' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}