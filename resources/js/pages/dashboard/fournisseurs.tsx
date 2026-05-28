import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fournisseur {
    id: number; code: string; nom: string; type: 'laboratoire'|'grossiste'|'importateur';
    adresse: string|null; ville: string|null; pays: string;
    telephone: string|null; email: string|null; site_web: string|null;
    contact_nom: string|null; contact_telephone: string|null;
    delai_livraison_jours: number; conditions_paiement: string|null;
    actif: boolean; medicaments_count: number;
}
interface Paginated<T> { data: T[]; current_page: number; last_page: number; total: number; links: { url: string|null; label: string; active: boolean }[]; }
interface Props {
    fournisseurs: Paginated<Fournisseur>;
    stats: { total: number; actifs: number; total_commandes: number; montant_total: number };
    villes: string[];
    filters: { search?: string; ville?: string; statut?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delaiLabel = (j: number) => j<=1?'24h':j<=2?'48h':j<=3?'72h':`${j}j`;
const fmt = (m: number) => new Intl.NumberFormat('fr-CM',{style:'currency',currency:'XAF',maximumFractionDigits:0}).format(m);

const TYPE_CFG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
    laboratoire: { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', icon:'🔬' },
    grossiste:   { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', icon:'🏭' },
    importateur: { color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:'🚢' },
};

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function TypeBadge({ type }: { type: string }) {
    const s = TYPE_CFG[type] ?? TYPE_CFG.grossiste;
    return <span style={{ fontSize:11, fontWeight:700, color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{s.icon} {type.charAt(0).toUpperCase()+type.slice(1)}</span>;
}

function MModal({ children, onClose, maxW=540 }: { children: React.ReactNode; onClose:()=>void; maxW?: number }) {
    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:maxW, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {children}
            </div>
        </div>
    );
}
function MHead({ title, sub, onClose }: { title: string; sub?: string; onClose:()=>void }) {
    return (
        <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexShrink:0 }}>
            <div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
                {sub && <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{sub}</p>}
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
    );
}
function FL({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>
            {children}
        </div>
    );
}
function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <div style={{ width:3, height:14, borderRadius:100, background:color }}/>
            <span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span>
        </div>
    );
}

// ─── Modal Formulaire ─────────────────────────────────────────────────────────

function FournisseurModal({ editItem, onClose }: { editItem: Fournisseur|null; onClose:()=>void }) {
    const { data, setData, processing, errors, reset } = useForm({
        code: editItem?.code ?? '', nom: editItem?.nom ?? '', type: editItem?.type ?? 'grossiste',
        adresse: editItem?.adresse ?? '', ville: editItem?.ville ?? '', pays: editItem?.pays ?? 'Cameroun',
        telephone: editItem?.telephone ?? '', email: editItem?.email ?? '', site_web: editItem?.site_web ?? '',
        contact_nom: editItem?.contact_nom ?? '', contact_telephone: editItem?.contact_telephone ?? '',
        delai_livraison_jours: editItem?.delai_livraison_jours ?? 2,
        conditions_paiement: editItem?.conditions_paiement ?? '', actif: editItem?.actif ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const opts = { onSuccess:()=>{ reset(); onClose(); } };
        editItem ? router.put(`/fournisseurs/${editItem.id}`, data, opts) : router.post('/fournisseurs', data, opts);
    };

    return (
        <MModal onClose={onClose} maxW={560}>
            <MHead title={editItem ? 'Modifier le fournisseur' : 'Nouveau fournisseur'} sub={editItem ? `Modification de ${editItem.nom}` : 'Ajouter un nouveau fournisseur'} onClose={onClose}/>
            <div style={{ overflowY:'auto', flex:1 }}>
                <form onSubmit={submit} style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                    {/* Identification */}
                    <div>
                        <SLabel label="Identification" color="#3b82f6"/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                            <FL label="Code *">
                                <input type="text" value={data.code} onChange={e=>setData('code',e.target.value)} placeholder="FOUR-006" required style={{ ...iSx, borderColor:errors.code?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                                {errors.code && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{errors.code}</p>}
                            </FL>
                            <FL label="Type *">
                                <select value={data.type} onChange={e=>setData('type',e.target.value as any)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                    <option value="laboratoire">🔬 Laboratoire</option>
                                    <option value="grossiste">🏭 Grossiste</option>
                                    <option value="importateur">🚢 Importateur</option>
                                </select>
                            </FL>
                        </div>
                        <FL label="Nom du fournisseur *">
                            <input type="text" value={data.nom} onChange={e=>setData('nom',e.target.value)} placeholder="Ex: Pharma Cam Distribution" required style={{ ...iSx, borderColor:errors.nom?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                            {errors.nom && <p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{errors.nom}</p>}
                        </FL>
                    </div>

                    {/* Contact */}
                    <div>
                        <SLabel label="Contact" color="#10b981"/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                            <FL label="Nom du contact"><input type="text" value={data.contact_nom} onChange={e=>setData('contact_nom',e.target.value)} placeholder="M. Jean Mbarga" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                            <FL label="Tél. contact"><input type="tel" value={data.contact_telephone} onChange={e=>setData('contact_telephone',e.target.value)} placeholder="+237 677 000 000" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                            <FL label="Téléphone"><input type="tel" value={data.telephone} onChange={e=>setData('telephone',e.target.value)} placeholder="+237 222 000 000" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                            <FL label="Email"><input type="email" value={data.email} onChange={e=>setData('email',e.target.value)} placeholder="contact@fournisseur.cm" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                        </div>
                    </div>

                    {/* Localisation */}
                    <div>
                        <SLabel label="Localisation" color="#8b5cf6"/>
                        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                            <FL label="Adresse"><input type="text" value={data.adresse} onChange={e=>setData('adresse',e.target.value)} placeholder="Adresse complète" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <FL label="Ville">
                                    <select value={data.ville} onChange={e=>setData('ville',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value="">Choisir…</option>
                                        {['Yaoundé','Douala','Bafoussam','Garoua','Maroua','Bamenda'].map(v=><option key={v}>{v}</option>)}
                                    </select>
                                </FL>
                                <FL label="Délai livraison">
                                    <select value={data.delai_livraison_jours} onChange={e=>setData('delai_livraison_jours',parseInt(e.target.value))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value={1}>24h (1 jour)</option>
                                        <option value={2}>48h (2 jours)</option>
                                        <option value={3}>72h (3 jours)</option>
                                        <option value={5}>5 jours</option>
                                        <option value={7}>7 jours</option>
                                    </select>
                                </FL>
                            </div>
                        </div>
                    </div>

                    {/* Statut */}
                    <div>
                        <SLabel label="Statut" color="#f59e0b"/>
                        <div style={{ display:'flex', gap:8 }}>
                            {[{v:true,l:'Actif'},{v:false,l:'Inactif'}].map(({v,l})=>(
                                <button key={l} type="button" onClick={()=>setData('actif',v)}
                                    style={{ flex:1, height:36, borderRadius:10, border:`1.5px solid ${data.actif===v?(v?'#16a34a':'#dc2626'):'#f0f0ee'}`, background:data.actif===v?(v?'#f0fdf4':'#fef2f2'):'#fafaf9', fontSize:13, fontWeight:600, color:data.actif===v?(v?'#16a34a':'#dc2626'):'#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}>
                                    {v?'✅':'❌'} {l}
                                </button>
                            ))}
                        </div>
                    </div>

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
        </MModal>
    );
}

// ─── Modal Détails ────────────────────────────────────────────────────────────

function DetailModal({ item, onClose, onEdit }: { item: Fournisseur; onClose:()=>void; onEdit:()=>void }) {
    const tc = TYPE_CFG[item.type] ?? TYPE_CFG.grossiste;
    return (
        <MModal onClose={onClose} maxW={520}>
            {/* Header coloré */}
            <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,${tc.bg},#fff)`, borderBottom:'1px solid #f0f0ee', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:44, height:44, borderRadius:14, background:tc.bg, border:`1.5px solid ${tc.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                            {tc.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>{item.nom}</h2>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                                <TypeBadge type={item.type}/>
                                <span style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', fontWeight:600 }}>{item.code}</span>
                                {item.ville && <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>· {item.ville}</span>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>

            <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:16 }}>
                {/* Stats rapides */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ borderRadius:14, background: item.actif?'#f0fdf4':'#fef2f2', border:`1px solid ${item.actif?'#bbf7d0':'#fecaca'}`, padding:'14px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:24, fontWeight:800, color:item.actif?'#16a34a':'#dc2626', letterSpacing:'-0.5px', lineHeight:1 }}>{item.medicaments_count}</div>
                        <div style={{ fontSize:11, color:item.actif?'#16a34a':'#dc2626', fontFamily:'system-ui,sans-serif', marginTop:4 }}>Médicaments référencés</div>
                    </div>
                    <div style={{ borderRadius:14, background:'#eff6ff', border:'1px solid #bfdbfe', padding:'14px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:24, fontWeight:800, color:'#2563eb', letterSpacing:'-0.5px', lineHeight:1 }}>{delaiLabel(item.delai_livraison_jours)}</div>
                        <div style={{ fontSize:11, color:'#2563eb', fontFamily:'system-ui,sans-serif', marginTop:4 }}>Délai de livraison</div>
                    </div>
                </div>

                {/* Infos */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                        ['Contact',       item.contact_nom],
                        ['Tél. contact',  item.contact_telephone],
                        ['Téléphone',     item.telephone],
                        ['Email',         item.email],
                        ['Statut',        item.actif ? '✅ Actif' : '❌ Inactif'],
                        ['Pays',          item.pays],
                    ].map(([l,v])=>(
                        <div key={l} style={{ borderRadius:10, background:'#fafaf9', padding:'10px 12px' }}>
                            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:3 }}>{l}</p>
                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{v||'—'}</p>
                        </div>
                    ))}
                    {item.adresse && (
                        <div style={{ borderRadius:10, background:'#fafaf9', padding:'10px 12px', gridColumn:'1/-1' }}>
                            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:3 }}>Adresse</p>
                            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{item.adresse}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding:'14px 22px', borderTop:'1px solid #f0f0ee', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
                <button onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Fermer</button>
                <button onClick={onEdit} style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>✏️ Modifier</button>
            </div>
        </MModal>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Fournisseurs({ fournisseurs, stats, villes, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showModal,  setShowModal]  = useState(false);
    const [editItem,   setEditItem]   = useState<Fournisseur|null>(null);
    const [detailItem, setDetailItem] = useState<Fournisseur|null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [ville,  setVille]  = useState(filters.ville  ?? 'Toutes');
    const [statut, setStatut] = useState(filters.statut ?? 'Tous');

    const apply = (ov: object = {}) => router.get('/fournisseurs', { search, ville, statut, ...ov }, { preserveState:true, replace:true });
    const del   = (f: Fournisseur) => {
        if (f.medicaments_count>0) { alert('Impossible de supprimer un fournisseur lié à des médicaments.'); return; }
        if (confirm(`Supprimer "${f.nom}" ?`)) router.delete(`/fournisseurs/${f.id}`);
    };

    return (
        <DashboardLayout title="Fournisseurs" subtitle="Gestion des fournisseurs de médicaments">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>
                    ✅ {flash.success}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total fournisseurs', value:String(stats.total),              icon:'🏭', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Actifs',             value:String(stats.actifs),             icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)',  shadow:'rgba(16,185,129,0.35)' },
                    { label:'Total commandes',    value:String(stats.total_commandes),    icon:'📦', grad:'linear-gradient(135deg,#1e3a8a,#3b82f6)',  shadow:'rgba(59,130,246,0.35)' },
                    { label:'Montant total',      value:fmt(stats.montant_total),         icon:'💰', grad:'linear-gradient(135deg,#b45309,#f59e0b)',  shadow:'rgba(245,158,11,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize: k.label==='Montant total'?18:28, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.85, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:18, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="Rechercher un fournisseur…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:240 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>
                    {[
                        { val:ville, set:setVille, key:'ville', opts:[['Toutes','Toutes les villes'],...villes.map(v=>[v,v])] },
                        { val:statut, set:setStatut, key:'statut', opts:[['Tous','Tous'],['Actif','Actif'],['Inactif','Inactif']] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>{ f.set(e.target.value); apply({[f.key]:e.target.value}); }}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                </div>
                <button onClick={()=>{ setEditItem(null); setShowModal(true); }}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Nouveau fournisseur
                </button>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', minWidth:760, borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['Fournisseur','Type','Contact','Délai','Médicaments','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 14px', textAlign:i===6?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {fournisseurs.data.length===0 ? (
                                <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:32, marginBottom:8 }}>🏭</div>
                                    Aucun fournisseur trouvé
                                </td></tr>
                            ) : fournisseurs.data.map((f,i)=>(
                                <tr key={f.id} style={{ borderBottom:i<fournisseurs.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                    <td style={{ padding:'12px 14px' }}>
                                        <p style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>{f.nom}</p>
                                        <p style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>
                                            <span style={{ fontFamily:'monospace', color:'#f53003', fontWeight:700 }}>{f.code}</span>
                                            {f.ville ? ` · ${f.ville}` : ''}
                                        </p>
                                    </td>
                                    <td style={{ padding:'12px 14px' }}><TypeBadge type={f.type}/></td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <p style={{ fontSize:13, color:'#374151' }}>{f.contact_nom || '—'}</p>
                                        {f.telephone && <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{f.telephone}</p>}
                                    </td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#2563eb', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:100, padding:'3px 10px' }}>
                                            ⏱ {delaiLabel(f.delai_livraison_jours)}
                                        </span>
                                    </td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <span style={{ fontSize:13, fontWeight:800, color:'#1a1a18' }}>{f.medicaments_count}</span>
                                    </td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <span style={{ fontSize:11, fontWeight:700, color:f.actif?'#16a34a':'#dc2626', background:f.actif?'#f0fdf4':'#fef2f2', border:`1px solid ${f.actif?'#bbf7d0':'#fecaca'}`, borderRadius:100, padding:'3px 10px' }}>
                                            {f.actif ? '● Actif' : '● Inactif'}
                                        </span>
                                    </td>
                                    <td style={{ padding:'12px 14px' }}>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                            {[
                                                { title:'Voir', icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', onClick:()=>setDetailItem(f) },
                                                { title:'Modifier', icon:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', onClick:()=>{ setEditItem(f); setShowModal(true); } },
                                            ].map((btn,j)=>(
                                                <button key={j} onClick={btn.onClick} title={btn.title}
                                                    style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                                </button>
                                            ))}
                                            <button onClick={()=>del(f)} title="Supprimer"
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

                {/* Pagination */}
                {fournisseurs.last_page>1 && (
                    <div style={{ display:'flex', justifyContent:'center', gap:4, padding:'14px 20px', borderTop:'1px solid #f5f5f3' }}>
                        {fournisseurs.links.map((link,i)=>(
                            <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                dangerouslySetInnerHTML={{ __html:link.label }}/>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {detailItem && <DetailModal item={detailItem} onClose={()=>setDetailItem(null)} onEdit={()=>{ setEditItem(detailItem); setDetailItem(null); setShowModal(true); }}/>}
            {showModal  && <FournisseurModal editItem={editItem} onClose={()=>{ setShowModal(false); setEditItem(null); }}/>}
        </DashboardLayout>
    );
}