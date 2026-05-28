import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Medicament {
    id: number; code: string; nom: string; dci: string; forme: string;
    dosage: string | null; categorie: string | null; categorie_id: number | null;
    stock_actuel: number; stock_minimum: number; stock_maximum: number;
    prix_achat: number; prix_vente: number;
    fournisseur: string | null; fournisseur_id: number | null;
    date_expiration: string | null; ordonnance_obligatoire: boolean; actif: boolean;
    statut: 'En stock' | 'Stock bas' | 'Rupture' | 'Péremption proche';
}
interface Categorie   { id: number; nom: string }
interface Fournisseur { id: number; nom: string }
interface Paginated<T> { data: T[]; current_page: number; last_page: number; total: number; links: { url: string|null; label: string; active: boolean }[] }
interface Props {
    medicaments:  Paginated<Medicament>;
    stats:        { total: number; en_stock: number; stock_bas: number; ruptures: number; peremption: number };
    alertes:      { ruptures: string; peremption: string };
    categories:   Categorie[];
    fournisseurs: Fournisseur[];
    filters:      { search?: string; categorie_id?: string; statut?: string; fournisseur_id?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('fr-CM').format(n) + ' FCFA';

const STATUT_CFG: Record<string, { color: string; bg: string; border: string }> = {
    'En stock':          { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    'Stock bas':         { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    'Rupture':           { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    'Péremption proche': { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
};

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const focIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const focOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function SLabel({ label }: { label: string }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:14, borderRadius:100, background:'#f53003' }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span>
        </div>
    );
}

// ─── Modal Médicament ─────────────────────────────────────────────────────────

function MedicamentModal({ editItem, categories, fournisseurs, onClose }: {
    editItem: Medicament | null; categories: Categorie[]; fournisseurs: Fournisseur[]; onClose: () => void;
}) {
    const { data, setData, processing, errors, reset } = useForm({
        code:                   editItem?.code                   ?? '',
        nom:                    editItem?.nom                    ?? '',
        dci:                    editItem?.dci                    ?? '',
        forme:                  editItem?.forme                  ?? '',
        dosage:                 editItem?.dosage                 ?? '',
        categorie_medicament_id: editItem?.categorie_id          ?? '' as any,
        conditionnement:        '',
        stock_actuel:           editItem?.stock_actuel           ?? 0,
        stock_minimum:          editItem?.stock_minimum          ?? 0,
        stock_maximum:          editItem?.stock_maximum          ?? 0,
        prix_achat:             editItem?.prix_achat             ?? 0,
        prix_vente:             editItem?.prix_vente             ?? 0,
        fournisseur_id:         editItem?.fournisseur_id         ?? '' as any,
        date_expiration:        '',
        ordonnance_obligatoire: editItem?.ordonnance_obligatoire ?? false,
        actif:                  editItem?.actif                  ?? true,
        notes:                  '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess: () => { reset(); onClose(); } };
        editItem ? router.put(`/medicaments/${editItem.id}`, data as any, opts) : router.post('/medicaments', data as any, opts);
    };

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:760, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>

                {/* Header */}
                <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f53003,#ff8c6a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>💊</div>
                        <div>
                            <h2 style={{ fontSize:17, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{editItem ? 'Modifier le médicament' : 'Nouveau médicament'}</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{editItem ? `Modification de ${editItem.nom}` : 'Ajout d\'une nouvelle référence au stock'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY:'auto', flex:1 }}>
                    <form onSubmit={submit} style={{ padding:'20px 24px' }}>

                        {/* Identification */}
                        <div style={{ marginBottom:26 }}>
                            <SLabel label="Identification"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                                {[{l:'Code interne *',k:'code',ph:'MED-042',req:true},{l:'Nom commercial *',k:'nom',ph:'Paracétamol 500mg',req:true},{l:'DCI *',k:'dci',ph:'Paracétamol',req:true}].map(f=>(
                                    <div key={f.k}>
                                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{f.l}</label>
                                        <input type="text" value={(data as any)[f.k]} onChange={e=>setData(f.k as any, e.target.value)} placeholder={f.ph} required={f.req} style={{ ...iSx, borderColor: (errors as any)[f.k] ? '#ef4444' : '#f0f0ee' }} onFocus={focIn} onBlur={focOut}/>
                                        {(errors as any)[f.k] && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{(errors as any)[f.k]}</p>}
                                    </div>
                                ))}
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Forme *</label>
                                    <select value={data.forme} onChange={e=>setData('forme', e.target.value)} required style={iSx} onFocus={focIn} onBlur={focOut}>
                                        <option value="">Sélectionner…</option>
                                        {[['comprime','Comprimé'],['gelule','Gélule'],['sirop','Sirop'],['injectable','Injectable'],['pommade','Pommade'],['collyre','Collyre'],['suppositoire','Suppositoire'],['solution','Solution'],['poudre','Poudre'],['autre','Autre']].map(([v,l])=>(
                                            <option key={v} value={v}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Dosage</label>
                                    <input type="text" value={data.dosage} onChange={e=>setData('dosage', e.target.value)} placeholder="500mg, 100µg…" style={iSx} onFocus={focIn} onBlur={focOut}/>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Catégorie</label>
                                    <select value={data.categorie_medicament_id} onChange={e=>setData('categorie_medicament_id', e.target.value)} style={iSx} onFocus={focIn} onBlur={focOut}>
                                        <option value="">Aucune</option>
                                        {categories.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Stock */}
                        <div style={{ marginBottom:26 }}>
                            <SLabel label="Gestion du stock"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                                {[{l:'Stock actuel',k:'stock_actuel'},{l:'Stock minimum (alerte)',k:'stock_minimum'},{l:'Stock maximum',k:'stock_maximum'}].map(f=>(
                                    <div key={f.k}>
                                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{f.l}</label>
                                        <input type="number" value={(data as any)[f.k]} onChange={e=>setData(f.k as any, parseInt(e.target.value)||0)} min={0} style={iSx} onFocus={focIn} onBlur={focOut}/>
                                    </div>
                                ))}
                            </div>
                            {/* Mini barre visuelle */}
                            {data.stock_maximum > 0 && (
                                <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'#fafaf9', border:'1px solid #f0f0ee' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>
                                        <span>Stock actuel : <strong style={{ color:'#1a1a18' }}>{data.stock_actuel}</strong></span>
                                        <span>Max : {data.stock_maximum}</span>
                                    </div>
                                    <div style={{ height:6, borderRadius:100, background:'#f0f0ee', overflow:'hidden' }}>
                                        <div style={{ height:'100%', width:`${Math.min((data.stock_actuel/data.stock_maximum)*100, 100)}%`, background: data.stock_actuel===0?'#ef4444':data.stock_actuel<=data.stock_minimum?'#f59e0b':'#10b981', borderRadius:100, transition:'width 0.4s' }}/>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prix & Fournisseur */}
                        <div style={{ marginBottom:26 }}>
                            <SLabel label="Prix & Fournisseur"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:14 }}>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Prix d'achat (FCFA)</label>
                                    <input type="number" value={data.prix_achat} onChange={e=>setData('prix_achat', parseFloat(e.target.value)||0)} min={0} style={iSx} onFocus={focIn} onBlur={focOut}/>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Prix de vente (FCFA) *</label>
                                    <input type="number" value={data.prix_vente} onChange={e=>setData('prix_vente', parseFloat(e.target.value)||0)} min={0} required style={{ ...iSx, borderColor: errors.prix_vente ? '#ef4444' : '#f0f0ee' }} onFocus={focIn} onBlur={focOut}/>
                                    {errors.prix_vente && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{errors.prix_vente}</p>}
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Fournisseur</label>
                                    <select value={data.fournisseur_id} onChange={e=>setData('fournisseur_id', e.target.value)} style={iSx} onFocus={focIn} onBlur={focOut}>
                                        <option value="">Aucun</option>
                                        {fournisseurs.map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Date d'expiration</label>
                                    <input type="date" value={data.date_expiration} onChange={e=>setData('date_expiration', e.target.value)} style={iSx} onFocus={focIn} onBlur={focOut}/>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div style={{ marginBottom:20 }}>
                            <SLabel label="Options"/>
                            <div style={{ display:'flex', gap:24 }}>
                                {[{k:'ordonnance_obligatoire',l:'Ordonnance obligatoire (Rx)'},{k:'actif',l:'Médicament actif'}].map(opt=>(
                                    <label key={opt.k} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                                        <input type="checkbox" checked={(data as any)[opt.k]} onChange={e=>setData(opt.k as any, e.target.checked)} style={{ width:16, height:16, accentColor:'#f53003', cursor:'pointer' }}/>
                                        <span style={{ fontSize:13, color:'#374151', fontFamily:'system-ui,sans-serif' }}>{opt.l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ marginBottom:20 }}>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Notes / Remarques</label>
                            <textarea rows={3} value={data.notes} onChange={e=>setData('notes', e.target.value)} placeholder="Conditions de conservation, remarques…"
                                style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', resize:'vertical', boxSizing:'border-box' }}
                                onFocus={focIn} onBlur={focOut}/>
                        </div>

                        {/* Footer form */}
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:16, borderTop:'1px solid #f0f0ee' }}>
                            <button type="button" onClick={onClose} style={{ height:38, padding:'0 18px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                            <button type="submit" disabled={processing}
                                style={{ height:38, padding:'0 22px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                                {processing ? 'Enregistrement…' : `✓ ${editItem ? 'Mettre à jour' : 'Enregistrer'}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Medicaments({ medicaments, stats, alertes, categories, fournisseurs, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showModal,     setShowModal]     = useState(false);
    const [editItem,      setEditItem]      = useState<Medicament|null>(null);
    const [search,        setSearch]        = useState(filters.search        ?? '');
    const [categorieId,   setCategorieId]   = useState(filters.categorie_id  ?? '');
    const [statut,        setStatut]        = useState(filters.statut        ?? '');
    const [fournisseurId, setFournisseurId] = useState(filters.fournisseur_id ?? '');

    const applyFilters = (ov: object = {}) => router.get('/medicaments', { search, categorie_id:categorieId, statut, fournisseur_id:fournisseurId, ...ov }, { preserveState:true, replace:true });
    const openEdit = (m: Medicament) => { setEditItem(m); setShowModal(true); };
    const openNew  = () => { setEditItem(null); setShowModal(true); };
    const del = (m: Medicament) => { if (confirm(`Supprimer "${m.nom}" ?`)) router.delete(`/medicaments/${m.id}`); };

    return (
        <DashboardLayout title="Médicaments" subtitle="Gestion du stock de la pharmacie">

            {/* Flash */}
            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>
                    <span>✅</span> {flash.success}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Références',         value:stats.total,      icon:'💊', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)',  shadow:'rgba(0,0,0,0.25)' },
                    { label:'En stock',            value:stats.en_stock,   icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)',  shadow:'rgba(16,185,129,0.35)' },
                    { label:'Stock bas',           value:stats.stock_bas,  icon:'⚠️', grad:'linear-gradient(135deg,#b45309,#f59e0b)',  shadow:'rgba(245,158,11,0.35)' },
                    { label:'Ruptures',            value:stats.ruptures,   icon:'🚨', grad:'linear-gradient(135deg,#991b1b,#ef4444)',  shadow:'rgba(239,68,68,0.35)' },
                    { label:'Péremption proche',   value:stats.peremption, icon:'🕐', grad:'linear-gradient(135deg,#9a3412,#ea580c)',  shadow:'rgba(234,88,12,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.85, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Alertes */}
            {(alertes.ruptures || alertes.peremption) && (
                <div style={{ display:'grid', gridTemplateColumns: alertes.ruptures && alertes.peremption ? '1fr 1fr' : '1fr', gap:14, marginBottom:20 }}>
                    {alertes.ruptures && (
                        <div style={{ borderRadius:14, background:'#fef2f2', border:'1px solid #fecaca', padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                            <span style={{ fontSize:18, flexShrink:0 }}>🚨</span>
                            <div>
                                <p style={{ fontSize:13, fontWeight:700, color:'#dc2626', fontFamily:'system-ui,sans-serif' }}>Alertes ruptures de stock</p>
                                <p style={{ fontSize:12, color:'#b91c1c', fontFamily:'system-ui,sans-serif', marginTop:3, lineHeight:1.5 }}>{alertes.ruptures}</p>
                            </div>
                        </div>
                    )}
                    {alertes.peremption && (
                        <div style={{ borderRadius:14, background:'#fff7ed', border:'1px solid #fed7aa', padding:'12px 16px', display:'flex', gap:10, alignItems:'flex-start' }}>
                            <span style={{ fontSize:18, flexShrink:0 }}>⏰</span>
                            <div>
                                <p style={{ fontSize:13, fontWeight:700, color:'#ea580c', fontFamily:'system-ui,sans-serif' }}>Péremption dans moins de 3 mois</p>
                                <p style={{ fontSize:12, color:'#c2410c', fontFamily:'system-ui,sans-serif', marginTop:3, lineHeight:1.5 }}>{alertes.peremption}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:18, flexWrap:'wrap' }}>
                {/* Recherche */}
                <div style={{ position:'relative', flex:1, minWidth:240, maxWidth:380 }}>
                    <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:14, height:14, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); applyFilters({search:e.target.value}); }} placeholder="Nom, DCI, code…"
                        style={{ width:'100%', height:38, paddingLeft:34, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}
                        onFocus={focIn} onBlur={focOut}/>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    {[
                        { val:categorieId, set:setCategorieId, key:'categorie_id', opts:[['','Toutes catégories'],...categories.map(c=>[String(c.id),c.nom])] },
                        { val:statut,      set:setStatut,      key:'statut',       opts:[['','Tous les statuts'],['en_stock','En stock'],['stock_bas','Stock bas'],['rupture','Rupture'],['peremption','Péremption proche']] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>{ f.set(e.target.value); applyFilters({[f.key]:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                    {fournisseurs.length > 0 && (
                        <select value={fournisseurId} onChange={e=>{ setFournisseurId(e.target.value); applyFilters({fournisseur_id:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            <option value="">Tous fournisseurs</option>
                            {fournisseurs.map(f=><option key={f.id} value={f.id}>{f.nom}</option>)}
                        </select>
                    )}
                    <button onClick={openNew}
                        style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                        <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Ajouter médicament
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#8b5cf6,#f53003)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['Médicament','Catégorie','Stock','Prix vente','Fournisseur','Expiration','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'13px 16px', textAlign:i===7?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {medicaments.data.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:32, marginBottom:8 }}>💊</div>
                                    Aucun médicament trouvé
                                </td></tr>
                            ) : medicaments.data.map((m, i) => {
                                const pct = m.stock_maximum > 0 ? Math.min((m.stock_actuel/m.stock_maximum)*100, 100) : 0;
                                const barColor = m.stock_actuel===0 ? '#ef4444' : m.stock_actuel<=m.stock_minimum ? '#f59e0b' : '#10b981';
                                const stat = STATUT_CFG[m.statut] ?? STATUT_CFG['En stock'];
                                return (
                                    <tr key={m.id} style={{ borderBottom:i<medicaments.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                        {/* Médicament */}
                                        <td style={{ padding:'12px 16px', maxWidth:220 }}>
                                            <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                                                {m.ordonnance_obligatoire && (
                                                    <span style={{ marginTop:1, flexShrink:0, fontSize:10, fontWeight:800, color:'#7c3aed', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:6, padding:'2px 6px' }}>Rx</span>
                                                )}
                                                <div style={{ minWidth:0 }}>
                                                    <div style={{ fontSize:13, fontWeight:700, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.nom}</div>
                                                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}><span style={{ fontFamily:'monospace', color:'#f53003', fontWeight:700 }}>{m.code}</span> · {m.forme}{m.dosage?` · ${m.dosage}`:''}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Catégorie */}
                                        <td style={{ padding:'12px 16px' }}>
                                            {m.categorie
                                                ? <span style={{ fontSize:11, fontWeight:600, color:'#374151', background:'#f5f5f3', border:'1px solid #e5e7eb', borderRadius:100, padding:'3px 10px' }}>{m.categorie}</span>
                                                : <span style={{ color:'#c0c0bc', fontSize:13 }}>—</span>}
                                        </td>

                                        {/* Stock */}
                                        <td style={{ padding:'12px 16px' }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                                                <span style={{ fontSize:14, fontWeight:800, color:barColor, letterSpacing:'-0.3px' }}>{m.stock_actuel}</span>
                                                <span style={{ fontSize:11, color:'#c0c0bc' }}>/ {m.stock_maximum}</span>
                                            </div>
                                            <div style={{ width:72, height:5, borderRadius:100, background:'#f0f0ee', overflow:'hidden' }}>
                                                <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:100 }}/>
                                            </div>
                                        </td>

                                        {/* Prix */}
                                        <td style={{ padding:'12px 16px' }}>
                                            <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{fmt(m.prix_vente)}</span>
                                        </td>

                                        {/* Fournisseur */}
                                        <td style={{ padding:'12px 16px', fontSize:13, color:m.fournisseur?'#374151':'#c0c0bc' }}>{m.fournisseur ?? '—'}</td>

                                        {/* Expiration */}
                                        <td style={{ padding:'12px 16px', fontSize:12, color: m.date_expiration ? '#374151' : '#c0c0bc' }}>{m.date_expiration ?? '—'}</td>

                                        {/* Statut */}
                                        <td style={{ padding:'12px 16px' }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:stat.color, background:stat.bg, border:`1px solid ${stat.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap' }}>
                                                {m.statut}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding:'12px 16px' }}>
                                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                                <button onClick={()=>openEdit(m)} title="Modifier"
                                                    style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                                </button>
                                                <button onClick={()=>del(m)} title="Supprimer"
                                                    style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#fef2f2';}}
                                                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                                                    <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid #f5f5f3' }}>
                    <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{medicaments.total}</span> médicament{medicaments.total>1?'s':''}
                    </p>
                    {medicaments.last_page > 1 && (
                        <div style={{ display:'flex', gap:4 }}>
                            {medicaments.links.map((link,i)=>(
                                <button key={i} disabled={!link.url} onClick={()=>link.url && router.get(link.url,{},{preserveState:true})}
                                    style={{ minWidth:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, fontSize:13, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <MedicamentModal editItem={editItem} categories={categories} fournisseurs={fournisseurs} onClose={()=>{ setShowModal(false); setEditItem(null); }}/>
            )}
        </DashboardLayout>
    );
}