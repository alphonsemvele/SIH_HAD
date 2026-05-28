import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User { id: number; name: string; lastname: string; matricule: string; }
interface Lit  { id: number; numero: string; }
interface Service {
    id: number; code: string; nom: string; description: string|null;
    chef_service_id: number|null; chef_service: User|null;
    etage: string|null; batiment: string|null; telephone: string|null; email: string|null;
    capacite_lits: number|null; actif: boolean; users: User[]; lits: Lit[];
    created_at: string; updated_at: string;
}
interface Paginated { data: Service[]; current_page: number; last_page: number; per_page: number; total: number; links: Array<{ url: string|null; label: string; active: boolean }>; }
interface Stats { total: number; actifs: number; totalLits: number; totalPersonnel: number; }
interface Props { services: Paginated; stats: Stats; filters: { search?: string; actif?: string; batiment?: string }; batiments: string[]; medecins: User[]; }

// ─── Palette de couleurs services ─────────────────────────────────────────────
const SVC_GRADS = [
    'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    'linear-gradient(135deg,#065f46,#10b981)',
    'linear-gradient(135deg,#4c1d95,#8b5cf6)',
    'linear-gradient(135deg,#9a3412,#f97316)',
    'linear-gradient(135deg,#831843,#ec4899)',
    'linear-gradient(135deg,#134e4a,#0d9488)',
    'linear-gradient(135deg,#312e81,#6366f1)',
    'linear-gradient(135deg,#7f1d1d,#ef4444)',
    'linear-gradient(135deg,#78350f,#f59e0b)',
    'linear-gradient(135deg,#164e63,#06b6d4)',
];
const getSvcGrad = (id: number) => SVC_GRADS[id % SVC_GRADS.length];

// shadow teintée selon la couleur du service
const SVC_SHADOWS = [
    'rgba(59,130,246,0.3)','rgba(16,185,129,0.3)','rgba(139,92,246,0.3)',
    'rgba(249,115,22,0.3)','rgba(236,72,153,0.3)','rgba(13,148,136,0.3)',
    'rgba(99,102,241,0.3)','rgba(239,68,68,0.3)','rgba(245,158,11,0.3)','rgba(6,182,212,0.3)',
];
const getSvcShadow = (id: number) => SVC_SHADOWS[id % SVC_SHADOWS.length];

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><div style={{ width:3, height:14, borderRadius:100, background:color }}/><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span></div>;
}
function FL({ label, error, children }: { label:string; error?: string; children:React.ReactNode }) {
    return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>{children}{error&&<p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{error}</p>}</div>;
}
function InfoCard({ label, value }: { label:string; value?: string|number|null }) {
    return (
        <div style={{ borderRadius:10, background:'#fafaf9', padding:'10px 12px' }}>
            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:3 }}>{label}</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{value??'—'}</p>
        </div>
    );
}
function MModal({ children, onClose, maxW=680 }: { children:React.ReactNode; onClose:()=>void; maxW?:number }) {
    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:maxW, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {children}
            </div>
        </div>
    );
}

// ─── Modal Formulaire Service ─────────────────────────────────────────────────

function ServiceFormModal({ title, subtitle, form, medecins, onSubmit, onClose, submitLabel }: {
    title:string; subtitle:string; form:any; medecins:User[]; onSubmit:(e:React.FormEvent)=>void; onClose:()=>void; submitLabel:string;
}) {
    return (
        <MModal onClose={onClose} maxW={700}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f53003,#ff8c6a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🏥</div>
                    <div>
                        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
                        <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{subtitle}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <form onSubmit={onSubmit} style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:20 }}>
                {/* Général */}
                <div>
                    <SLabel label="Informations générales" color="#3b82f6"/>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        <FL label="Nom du service *" error={form.errors.nom}>
                            <input type="text" value={form.data.nom} onChange={e=>form.setData('nom',e.target.value)} placeholder="ex: Cardiologie, Urgences, Maternité" required style={{ ...iSx, borderColor:form.errors.nom?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Description">
                            <textarea rows={3} value={form.data.description} onChange={e=>form.setData('description',e.target.value)} placeholder="Description des activités et spécialités du service…"
                                style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Chef de service">
                            <select value={form.data.chef_service_id} onChange={e=>form.setData('chef_service_id',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">Sélectionner un médecin…</option>
                                {medecins.map(m=><option key={m.id} value={m.id}>Dr. {m.name} {m.lastname} ({m.matricule})</option>)}
                            </select>
                        </FL>
                    </div>
                </div>

                {/* Localisation */}
                <div>
                    <SLabel label="Localisation" color="#059669"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <FL label="Bâtiment"><input type="text" value={form.data.batiment} onChange={e=>form.setData('batiment',e.target.value)} placeholder="ex: Bâtiment A, Aile Nord" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                        <FL label="Étage"><input type="text" value={form.data.etage} onChange={e=>form.setData('etage',e.target.value)} placeholder="ex: RDC, 1er étage" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                    </div>
                </div>

                {/* Contact & Capacité */}
                <div>
                    <SLabel label="Contact & Capacité" color="#7c3aed"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <FL label="Téléphone"><input type="tel" value={form.data.telephone} onChange={e=>form.setData('telephone',e.target.value)} placeholder="+237 XXX XXX XXX" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                        <FL label="Email" error={form.errors.email}>
                            <input type="email" value={form.data.email} onChange={e=>form.setData('email',e.target.value)} placeholder="service@medicare.cm" style={{ ...iSx, borderColor:form.errors.email?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Capacité (lits)"><input type="number" min="0" value={form.data.capacite_lits} onChange={e=>form.setData('capacite_lits',e.target.value)} placeholder="0" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                        <FL label="Statut">
                            <div style={{ display:'flex', gap:8 }}>
                                {[{v:true,l:'Actif',color:'#16a34a',bg:'#f0fdf4',border:'#bbf7d0'},{v:false,l:'Inactif',color:'#6b7280',bg:'#f9fafb',border:'#e5e7eb'}].map(({v,l,color,bg,border})=>(
                                    <button key={l} type="button" onClick={()=>form.setData('actif',v)}
                                        style={{ flex:1, height:36, borderRadius:10, border:`1.5px solid ${form.data.actif===v?color:'#f0f0ee'}`, background:form.data.actif===v?bg:'#fafaf9', fontSize:13, fontWeight:600, color:form.data.actif===v?color:'#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </FL>
                    </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                    <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                    <button type="submit" disabled={form.processing}
                        style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:form.processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                        ✓ {form.processing ? 'Enregistrement…' : submitLabel}
                    </button>
                </div>
            </form>
        </MModal>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ServicesPage({ services, stats, filters, batiments, medecins }: Props) {
    const [showNew,    setShowNew]    = useState(false);
    const [showView,   setShowView]   = useState(false);
    const [showEdit,   setShowEdit]   = useState(false);
    const [selected,   setSelected]   = useState<Service|null>(null);
    const [search,     setSearch]     = useState(filters.search    || '');
    const [actifFilter,setActifFilter]= useState(filters.actif     || '');
    const [batFilter,  setBatFilter]  = useState(filters.batiment  || '');

    const createForm = useForm({ nom:'', description:'', chef_service_id:'', etage:'', batiment:'', telephone:'', email:'', capacite_lits:'', actif:true });
    const editForm   = useForm({ nom:'', description:'', chef_service_id:'', etage:'', batiment:'', telephone:'', email:'', capacite_lits:'', actif:true });

    const doSearch = (e: React.FormEvent) => { e.preventDefault(); router.get('/services',{search,actif:actifFilter,batiment:batFilter},{preserveState:true}); };
    const doFilter = (key: string, val: string) => {
        const p: any = {search,actif:actifFilter,batiment:batFilter}; p[key]=val;
        if(key==='actif') setActifFilter(val); if(key==='batiment') setBatFilter(val);
        router.get('/services',p,{preserveState:true});
    };
    const openView = (s: Service) => { setSelected(s); setShowView(true); };
    const openEdit = (s: Service) => {
        setSelected(s);
        editForm.setData({ nom:s.nom||'', description:s.description||'', chef_service_id:s.chef_service_id?.toString()||'', etage:s.etage||'', batiment:s.batiment||'', telephone:s.telephone||'', email:s.email||'', capacite_lits:s.capacite_lits?.toString()||'', actif:s.actif });
        setShowEdit(true);
    };

    return (
        <DashboardLayout title="Services" subtitle="Gestion des services de l'établissement">

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total services',   value:stats.total,          icon:'🏥', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Services actifs',  value:stats.actifs,         icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'Capacité totale',  value:`${stats.totalLits} lits`, icon:'🛏️', grad:'linear-gradient(135deg,#1e3a8a,#3b82f6)', shadow:'rgba(59,130,246,0.35)' },
                    { label:'Personnel affecté',value:stats.totalPersonnel, icon:'👥', grad:'linear-gradient(135deg,#4c1d95,#8b5cf6)', shadow:'rgba(139,92,246,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.85, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                <form onSubmit={doSearch} style={{ position:'relative', flex:1, minWidth:240, maxWidth:360 }}>
                    <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un service…"
                        style={{ width:'100%', height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}
                        onFocus={fIn} onBlur={fOut}/>
                </form>
                <div style={{ display:'flex', gap:8 }}>
                    <select value={actifFilter} onChange={e=>doFilter('actif',e.target.value)}
                        style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                        <option value="">Tous les statuts</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>
                    {batiments.length>0 && (
                        <select value={batFilter} onChange={e=>doFilter('batiment',e.target.value)}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            <option value="">Tous les bâtiments</option>
                            {batiments.map(b=><option key={b} value={b}>{b}</option>)}
                        </select>
                    )}
                    <button onClick={()=>setShowNew(true)}
                        style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                        <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Nouveau service
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════ GRILLE SERVICES */}
            {services.data.length===0 ? (
                <div style={{ borderRadius:20, border:'1px solid #eee', background:'#fff', padding:'60px 40px', textAlign:'center', fontFamily:'system-ui,sans-serif' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🏥</div>
                    <p style={{ fontSize:16, fontWeight:700, color:'#1a1a18', marginBottom:6 }}>Aucun service trouvé</p>
                    <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Modifiez vos filtres ou créez un nouveau service.</p>
                    <button onClick={()=>setShowNew(true)} style={{ height:38, padding:'0 20px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>
                        Créer un service
                    </button>
                </div>
            ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
                    {services.data.map(s=>{
                        const grad   = getSvcGrad(s.id);
                        const shadow = getSvcShadow(s.id);
                        return (
                            <div key={s.id}
                                style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'transform 0.2s,box-shadow 0.2s' }}
                                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 14px 36px ${shadow}`; }}
                                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}>

                                {/* Barre top colorée */}
                                <div style={{ height:4, background:grad }}/>

                                <div style={{ padding:'16px 18px' }}>
                                    {/* Header carte */}
                                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                            <div style={{ width:44, height:44, borderRadius:13, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:'#fff', flexShrink:0, letterSpacing:'-0.3px', boxShadow:`0 4px 12px ${shadow}` }}>
                                                {s.nom.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ fontSize:14, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.2px' }}>{s.nom}</p>
                                                <p style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', fontWeight:600, marginTop:1 }}>{s.code}</p>
                                            </div>
                                        </div>
                                        {/* Badge statut cliquable */}
                                        <button onClick={()=>router.patch(`/services/${s.id}/toggle-status`)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                                            <span style={{ fontSize:11, fontWeight:700, color:s.actif?'#16a34a':'#6b7280', background:s.actif?'#f0fdf4':'#f9fafb', border:`1px solid ${s.actif?'#bbf7d0':'#e5e7eb'}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>
                                                {s.actif ? '● Actif' : '● Inactif'}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Description */}
                                    {s.description && (
                                        <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.6, fontFamily:'system-ui,sans-serif', marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                            {s.description}
                                        </p>
                                    )}

                                    {/* Stats rapides */}
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                                        {[
                                            { icon:'📍', val: [s.batiment,s.etage].filter(Boolean).join(', ')||'Non défini' },
                                            { icon:'🛏️', val: `${s.capacite_lits||0} lits` },
                                            { icon:'👥', val: `${s.users?.length||0} personnel` },
                                            { icon:'📞', val: s.telephone||'—' },
                                        ].map(({icon,val},i)=>(
                                            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                                                <span style={{ fontSize:13, flexShrink:0 }}>{icon}</span>
                                                <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chef de service */}
                                    {s.chef_service && (
                                        <div style={{ marginBottom:12, borderRadius:10, background:'#fafaf9', padding:'10px 12px', display:'flex', alignItems:'center', gap:10 }}>
                                            <div style={{ width:28, height:28, borderRadius:8, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                {s.chef_service.name[0]}{s.chef_service.lastname[0]}
                                            </div>
                                            <div>
                                                <p style={{ fontSize:10, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>Chef de service</p>
                                                <p style={{ fontSize:12, fontWeight:600, color:'#1a1a18' }}>Dr. {s.chef_service.name} {s.chef_service.lastname}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, paddingTop:10, borderTop:'1px solid #f5f5f3' }}>
                                        {[
                                            { title:'Voir', onClick:()=>openView(s), hBg:'#f0f0ee', icon:'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                                            { title:'Modifier', onClick:()=>openEdit(s), hBg:'#f0f0ee', icon:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                                            { title:'Supprimer', onClick:()=>{ if(confirm(`Supprimer "${s.nom}" ?`)) router.delete(`/services/${s.id}`); }, hBg:'#fef2f2', icon:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
                                        ].map((btn,i)=>(
                                            <button key={i} onClick={btn.onClick} title={btn.title}
                                                style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=btn.hBg}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Carte ajouter */}
                    <button onClick={()=>setShowNew(true)}
                        style={{ borderRadius:20, border:'2px dashed #e5e7eb', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', minHeight:200, transition:'all 0.2s', fontFamily:'system-ui,sans-serif' }}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.background='#fff5f5'; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'; (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                        <div style={{ width:44, height:44, borderRadius:13, background:'#f5f5f3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏥</div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#c0c0bc' }}>Nouveau service</span>
                    </button>
                </div>
            )}

            {/* Pagination */}
            {services.last_page>1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20 }}>
                    <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{(services.current_page-1)*services.per_page+1}</span> –{' '}
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{Math.min(services.current_page*services.per_page,services.total)}</span> sur{' '}
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{services.total}</span> services
                    </p>
                    <div style={{ display:'flex', gap:4 }}>
                        {services.links.map((link,i)=>(
                            <Link key={i} href={link.url||'#'} preserveState
                                style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', textDecoration:'none', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':link.url?'#706f6c':'#d1d5db', border:link.active?'none':'1px solid #f0f0ee', pointerEvents:link.url?'auto':'none', opacity:link.url?1:0.4, padding:'0 6px' }}
                                dangerouslySetInnerHTML={{ __html:link.label }}/>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════ MODAL VOIR */}
            {showView && selected && (
                <MModal onClose={()=>setShowView(false)} maxW={620}>
                    <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,rgba(0,0,0,0.04),#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <div style={{ width:52, height:52, borderRadius:16, background:getSvcGrad(selected.id), display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:800, color:'#fff', letterSpacing:'-0.3px', boxShadow:`0 6px 16px ${getSvcShadow(selected.id)}` }}>
                                {selected.nom.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>{selected.nom}</h2>
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                                    <span style={{ fontFamily:'monospace', fontSize:11, color:'#9ca3af', fontWeight:600 }}>{selected.code}</span>
                                    <span style={{ fontSize:11, fontWeight:700, color:selected.actif?'#16a34a':'#6b7280', background:selected.actif?'#f0fdf4':'#f9fafb', border:`1px solid ${selected.actif?'#bbf7d0':'#e5e7eb'}`, borderRadius:100, padding:'2px 8px' }}>
                                        {selected.actif ? '● Actif' : '● Inactif'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={()=>setShowView(false)} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>
                        {selected.description && (
                            <div style={{ borderRadius:12, background:'#fafaf9', padding:'12px 14px' }}>
                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Description</p>
                                <p style={{ fontSize:13, color:'#1a1a18', lineHeight:1.7 }}>{selected.description}</p>
                            </div>
                        )}
                        <div>
                            <SLabel label="Localisation" color="#3b82f6"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                <InfoCard label="Bâtiment" value={selected.batiment}/>
                                <InfoCard label="Étage" value={selected.etage}/>
                            </div>
                        </div>
                        <div>
                            <SLabel label="Capacité" color="#7c3aed"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                <InfoCard label="Capacité lits" value={selected.capacite_lits}/>
                                <InfoCard label="Personnel affecté" value={selected.users?.length||0}/>
                            </div>
                        </div>
                        <div>
                            <SLabel label="Contact" color="#059669"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                <InfoCard label="Téléphone" value={selected.telephone}/>
                                <InfoCard label="Email" value={selected.email}/>
                            </div>
                        </div>
                        {selected.chef_service ? (
                            <div>
                                <SLabel label="Chef de service" color="#f53003"/>
                                <div style={{ borderRadius:12, border:'1px solid #f0f0ee', padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                                    <div style={{ width:38, height:38, borderRadius:11, background:getSvcGrad(selected.id), display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                        {selected.chef_service.name[0]}{selected.chef_service.lastname[0]}
                                    </div>
                                    <div>
                                        <p style={{ fontSize:14, fontWeight:700, color:'#1a1a18' }}>Dr. {selected.chef_service.name} {selected.chef_service.lastname}</p>
                                        <p style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', marginTop:2 }}>{selected.chef_service.matricule}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize:13, color:'#c0c0bc', fontStyle:'italic', fontFamily:'system-ui,sans-serif' }}>Aucun chef de service assigné</p>
                        )}
                    </div>
                    <div style={{ padding:'12px 22px', borderTop:'1px solid #f0f0ee', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
                        <button onClick={()=>setShowView(false)} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Fermer</button>
                        <button onClick={()=>{ setShowView(false); openEdit(selected); }}
                            style={{ height:36, padding:'0 16px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>
                            ✏️ Modifier
                        </button>
                    </div>
                </MModal>
            )}

            {/* ══════════════════════════════════════ MODALS FORMULAIRE */}
            {showNew && (
                <ServiceFormModal title="Nouveau service" subtitle="Création d'un nouveau service"
                    form={createForm} medecins={medecins}
                    onSubmit={e=>{ e.preventDefault(); createForm.post('/services',{onSuccess:()=>{createForm.reset();setShowNew(false);}}); }}
                    onClose={()=>setShowNew(false)} submitLabel="Créer le service"/>
            )}
            {showEdit && selected && (
                <ServiceFormModal title="Modifier le service" subtitle={`${selected.nom} · ${selected.code}`}
                    form={editForm} medecins={medecins}
                    onSubmit={e=>{ e.preventDefault(); editForm.put(`/services/${selected.id}`,{onSuccess:()=>{setShowEdit(false);setSelected(null);}}); }}
                    onClose={()=>{ setShowEdit(false); setSelected(null); }} submitLabel="Mettre à jour"/>
            )}
        </DashboardLayout>
    );
}