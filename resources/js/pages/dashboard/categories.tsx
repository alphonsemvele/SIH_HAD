import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Categorie {
    id: number; code: string; nom: string; description: string | null;
    couleur: string; actif: boolean; medicaments_count: number;
}
interface Paginated<T> {
    data: T[]; current_page: number; last_page: number; per_page: number; total: number;
    links: { url: string|null; label: string; active: boolean }[];
}
interface Props {
    categories: Paginated<Categorie>;
    stats: { total: number; actives: number; inactives: number; total_medicaments: number };
    filters: { search?: string; statut?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hex2rgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
};

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

// ─── Modal ────────────────────────────────────────────────────────────────────

function CategorieModal({ editItem, onClose }: { editItem: Categorie|null; onClose: ()=>void }) {
    const { data, setData, processing, errors, reset } = useForm({
        code:        editItem?.code        ?? '',
        nom:         editItem?.nom         ?? '',
        description: editItem?.description ?? '',
        couleur:     editItem?.couleur     ?? '#8b5cf6',
        actif:       editItem?.actif       ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        editItem ? router.put(`/categories/${editItem.id}`, data, opts) : router.post('/categories', data, opts);
    };

    const PALETTE = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#f97316','#6366f1','#14b8a6'];

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:480, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', overflow:'hidden' }}>
                {/* Header */}
                <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:data.couleur, display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s', boxShadow:`0 4px 12px ${data.couleur}60` }}>
                            <svg style={{ width:16, height:16, color:'#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M20.59 13.41L13.42 20.58c-.35.35-.83.59-1.41.59-.59 0-1.06-.24-1.41-.59L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/></svg>
                        </div>
                        <div>
                            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{editItem ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>{editItem ? `Modification de ${editItem.nom}` : 'Ajouter une nouvelle catégorie'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                    {/* Code + Couleur */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Code *</label>
                            <input type="text" value={data.code} onChange={e=>setData('code',e.target.value)} placeholder="CAT-011" required
                                style={{ ...iSx, borderColor:errors.code?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                            {errors.code && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{errors.code}</p>}
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Couleur</label>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <input type="color" value={data.couleur} onChange={e=>setData('couleur',e.target.value)}
                                    style={{ width:38, height:38, borderRadius:10, border:'1.5px solid #f0f0ee', padding:3, cursor:'pointer', background:'#fff', flexShrink:0 }}/>
                                <span style={{ fontSize:12, fontFamily:'monospace', color:'#706f6c', fontWeight:600 }}>{data.couleur}</span>
                            </div>
                        </div>
                    </div>

                    {/* Palette rapide */}
                    <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Palette rapide</label>
                        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                            {PALETTE.map(c=>(
                                <button key={c} type="button" onClick={()=>setData('couleur',c)}
                                    style={{ width:26, height:26, borderRadius:8, background:c, border:`2.5px solid ${data.couleur===c?'#1a1a18':'transparent'}`, cursor:'pointer', transition:'transform 0.15s', flexShrink:0 }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='scale(1.15)'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='scale(1)'}/>
                            ))}
                        </div>
                    </div>

                    {/* Nom */}
                    <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Nom de la catégorie *</label>
                        <input type="text" value={data.nom} onChange={e=>setData('nom',e.target.value)} placeholder="Ex: Antibiotiques" required
                            style={{ ...iSx, borderColor:errors.nom?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        {errors.nom && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{errors.nom}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Description</label>
                        <textarea rows={3} value={data.description} onChange={e=>setData('description',e.target.value)} placeholder="Description de la catégorie…"
                            style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                    </div>

                    {/* Statut toggle */}
                    <div style={{ display:'flex', gap:8 }}>
                        {[{v:true,l:'Actif'},{v:false,l:'Inactif'}].map(({v,l})=>(
                            <button key={l} type="button" onClick={()=>setData('actif',v)}
                                style={{ flex:1, height:36, borderRadius:10, border:`1.5px solid ${data.actif===v ? (v?'#16a34a':'#dc2626') : '#f0f0ee'}`, background:data.actif===v ? (v?'#f0fdf4':'#fef2f2') : '#fafaf9', fontSize:13, fontWeight:600, color:data.actif===v ? (v?'#16a34a':'#dc2626') : '#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}>
                                {v ? '✅' : '❌'} {l}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee', marginTop:4 }}>
                        <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                        <button type="submit" disabled={processing}
                            style={{ height:36, padding:'0 18px', borderRadius:9, background:`linear-gradient(135deg,${data.couleur},${data.couleur}cc)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:`0 4px 14px ${data.couleur}40`, display:'flex', alignItems:'center', gap:7 }}>
                            ✓ {processing ? 'Enregistrement…' : editItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Categories({ categories, stats, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showModal, setShowModal]   = useState(false);
    const [editItem,  setEditItem]    = useState<Categorie|null>(null);
    const [viewMode,  setViewMode]    = useState<'grid'|'list'>('grid');
    const [search,    setSearch]      = useState(filters.search ?? '');
    const [statut,    setStatut]      = useState(filters.statut ?? 'Tous');

    const applyFilters = (ov: object = {}) => router.get('/categories', { search, statut, ...ov }, { preserveState:true, replace:true });
    const handleDelete = (cat: Categorie) => {
        if (cat.medicaments_count>0) { alert('Impossible de supprimer une catégorie liée à des médicaments.'); return; }
        if (confirm(`Supprimer "${cat.nom}" ?`)) router.delete(`/categories/${cat.id}`);
    };
    const openEdit = (cat: Categorie) => { setEditItem(cat); setShowModal(true); };
    const openNew  = () => { setEditItem(null); setShowModal(true); };

    return (
        <DashboardLayout title="Catégories" subtitle="Gestion des catégories de médicaments">

            {/* Flash */}
            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>
                    ✅ {flash.success}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total catégories',  value:stats.total,             icon:'🏷️', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)',  shadow:'rgba(0,0,0,0.25)' },
                    { label:'Actives',            value:stats.actives,           icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)',  shadow:'rgba(16,185,129,0.35)' },
                    { label:'Total médicaments',  value:stats.total_medicaments, icon:'💊', grad:'linear-gradient(135deg,#6d28d9,#8b5cf6)',  shadow:'rgba(139,92,246,0.35)' },
                    { label:'Inactives',          value:stats.inactives,         icon:'❌', grad:'linear-gradient(135deg,#991b1b,#ef4444)',  shadow:'rgba(239,68,68,0.35)' },
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
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    {/* Recherche */}
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); applyFilters({search:e.target.value}); }} placeholder="Rechercher…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:220 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>
                    {/* Filtre statut */}
                    <select value={statut} onChange={e=>{ setStatut(e.target.value); applyFilters({statut:e.target.value}); }}
                        style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                        <option>Tous</option><option>Actif</option><option>Inactif</option>
                    </select>
                    {/* Toggle vue */}
                    <div style={{ display:'flex', borderRadius:10, border:'1.5px solid #f0f0ee', overflow:'hidden' }}>
                        {(['grid','list'] as const).map(m=>(
                            <button key={m} onClick={()=>setViewMode(m)}
                                style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', background:viewMode===m?'#1a1a18':'#fafaf9', color:viewMode===m?'#fff':'#9ca3af', transition:'all 0.15s' }}>
                                {m==='grid'
                                    ? <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.5}/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.5}/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.5}/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.5}/></svg>
                                    : <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 6H21M8 12H21M8 18H21M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor"/></svg>
                                }
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={openNew}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouvelle catégorie
                </button>
            </div>

            {/* ══════════════════════════════════════ VUE GRILLE */}
            {viewMode==='grid' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                    {categories.data.map(cat=>(
                        <div key={cat.id} style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'transform 0.2s,box-shadow 0.2s', cursor:'default' }}
                            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 12px 32px ${hex2rgba(cat.couleur,0.15)}`; }}
                            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}>
                            {/* Barre couleur haut */}
                            <div style={{ height:4, background:cat.couleur }}/>
                            <div style={{ padding:'16px 18px' }}>
                                {/* Header carte */}
                                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                        <div style={{ width:40, height:40, borderRadius:12, background:hex2rgba(cat.couleur,0.15), display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <svg style={{ width:18, height:18, color:cat.couleur }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M20.59 13.41L13.42 20.58c-.35.35-.83.59-1.41.59-.59 0-1.06-.24-1.41-.59L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/></svg>
                                        </div>
                                        <div style={{ minWidth:0 }}>
                                            <p style={{ fontSize:14, fontWeight:700, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat.nom}</p>
                                            <p style={{ fontSize:11, fontFamily:'monospace', color:cat.couleur, fontWeight:700, marginTop:1 }}>{cat.code}</p>
                                        </div>
                                    </div>
                                    {/* Badge statut */}
                                    <span style={{ fontSize:10, fontWeight:700, color:cat.actif?'#16a34a':'#dc2626', background:cat.actif?'#f0fdf4':'#fef2f2', border:`1px solid ${cat.actif?'#bbf7d0':'#fecaca'}`, borderRadius:100, padding:'3px 8px', whiteSpace:'nowrap' }}>
                                        {cat.actif ? '● Actif' : '● Inactif'}
                                    </span>
                                </div>

                                {/* Description */}
                                {cat.description && (
                                    <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.6, fontFamily:'system-ui,sans-serif', marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                        {cat.description}
                                    </p>
                                )}

                                {/* Footer carte */}
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid #f5f5f3' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                        <div style={{ width:8, height:8, borderRadius:2, background:cat.couleur }}/>
                                        <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{cat.medicaments_count}</span>
                                        <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>médicament{cat.medicaments_count>1?'s':''}</span>
                                    </div>
                                    <div style={{ display:'flex', gap:4 }}>
                                        <button onClick={()=>openEdit(cat)} title="Modifier"
                                            style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                            <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                        </button>
                                        <button onClick={()=>handleDelete(cat)} title="Supprimer"
                                            style={{ width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                            <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Carte ajouter */}
                    <button onClick={openNew}
                        style={{ borderRadius:20, border:'2px dashed #e5e7eb', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', minHeight:160, transition:'all 0.2s', fontFamily:'system-ui,sans-serif' }}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.background='#fff5f5'; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'; (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:'#f5f5f3', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg style={{width:20,height:20,color:'#c0c0bc'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14"/></svg>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#c0c0bc' }}>Nouvelle catégorie</span>
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════ VUE LISTE */}
            {viewMode==='list' && (
                <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ height:3, background:'linear-gradient(90deg,#8b5cf6,#ec4899)' }}/>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['Catégorie','Code','Description','Médicaments','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 16px', textAlign:i===5?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.data.map((cat,i)=>(
                                <tr key={cat.id} style={{ borderBottom:i<categories.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                    <td style={{ padding:'11px 16px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <div style={{ width:10, height:10, borderRadius:3, background:cat.couleur, flexShrink:0 }}/>
                                            <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{cat.nom}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding:'11px 16px' }}>
                                        <span style={{ fontSize:12, fontFamily:'monospace', fontWeight:700, color:cat.couleur }}>{cat.code}</span>
                                    </td>
                                    <td style={{ padding:'11px 16px', fontSize:12, color:'#9ca3af', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                        {cat.description ?? '—'}
                                    </td>
                                    <td style={{ padding:'11px 16px' }}>
                                        <span style={{ fontSize:12, fontWeight:700, color:cat.couleur, background:hex2rgba(cat.couleur,0.12), borderRadius:100, padding:'3px 10px' }}>
                                            {cat.medicaments_count}
                                        </span>
                                    </td>
                                    <td style={{ padding:'11px 16px' }}>
                                        <span style={{ fontSize:11, fontWeight:700, color:cat.actif?'#16a34a':'#dc2626', background:cat.actif?'#f0fdf4':'#fef2f2', border:`1px solid ${cat.actif?'#bbf7d0':'#fecaca'}`, borderRadius:100, padding:'3px 10px' }}>
                                            {cat.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td style={{ padding:'11px 16px' }}>
                                        <div style={{ display:'flex', justifyContent:'flex-end', gap:2 }}>
                                            {[
                                                { title:'Modifier', icon:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick:()=>openEdit(cat), hBg:'#f0f0ee' },
                                                { title:'Supprimer', icon:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', onClick:()=>handleDelete(cat), hBg:'#fef2f2' },
                                            ].map((btn,j)=>(
                                                <button key={j} onClick={btn.onClick} title={btn.title}
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=btn.hBg}
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
            )}

            {/* Vide */}
            {categories.data.length===0 && (
                <div style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14, fontFamily:'system-ui,sans-serif' }}>
                    <div style={{ fontSize:40, marginBottom:10 }}>🏷️</div>
                    <p style={{ fontWeight:600, color:'#374151', marginBottom:4 }}>Aucune catégorie trouvée</p>
                    <p>Modifiez vos critères ou créez une nouvelle catégorie.</p>
                </div>
            )}

            {/* Pagination */}
            {categories.last_page>1 && (
                <div style={{ display:'flex', justifyContent:'center', gap:4, marginTop:20 }}>
                    {categories.links.map((link,i)=>(
                        <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                            style={{ minWidth:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, fontSize:13, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                            dangerouslySetInnerHTML={{ __html:link.label }}/>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && <CategorieModal editItem={editItem} onClose={()=>{ setShowModal(false); setEditItem(null); }}/>}
        </DashboardLayout>
    );
}