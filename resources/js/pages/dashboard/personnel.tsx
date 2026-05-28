import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service { id: number; nom: string; }
interface Personnel {
    id: number; matricule: string; name: string; lastname: string; fonction: string;
    specialite: string|null; service_id: number|null; service: Service|null;
    telephone: string|null; email: string; date_embauche: string|null;
    statut: 'actif'|'conge'|'mission'|'inactif'; role: string|null; avatar: string|null; created_at: string;
}
interface Paginated { data: Personnel[]; current_page: number; last_page: number; per_page: number; total: number; links: Array<{ url: string|null; label: string; active: boolean }>; }
interface Stats { total: number; medecins: number; infirmiers: number; enService: number; enConge: number; }
interface Props { personnel: Paginated; stats: Stats; filters: { search?: string; fonction?: string; service_id?: string; statut?: string }; statuts: string[]; fonctions: string[]; roles: string[]; services: Service[]; }

// ─── Config ───────────────────────────────────────────────────────────────────

const FONCTION_CFG: Record<string, { color: string; bg: string; border: string }> = {
    'Médecin':        { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
    'Infirmière':     { color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8' },
    'Infirmière Chef':{ color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    'Sage-femme':     { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
    'Pharmacien(ne)': { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    'Technicien(ne)': { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    'Administratif':  { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
    'Admin':          { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
};
const DEF_FCT = { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' };

const STATUT_CFG: Record<string, { color: string; bg: string; border: string }> = {
    actif:   { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    conge:   { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    mission: { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
    inactif: { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
};

// Couleurs d'avatar par fonction
const AVATAR_GRAD: Record<string, string> = {
    'Médecin':        'linear-gradient(135deg,#2563eb,#1d4ed8)',
    'Infirmière':     'linear-gradient(135deg,#db2777,#be185d)',
    'Infirmière Chef':'linear-gradient(135deg,#7c3aed,#6d28d9)',
    'Sage-femme':     'linear-gradient(135deg,#dc2626,#b91c1c)',
    'Pharmacien(ne)': 'linear-gradient(135deg,#16a34a,#15803d)',
    'Technicien(ne)': 'linear-gradient(135deg,#d97706,#b45309)',
};
const DEF_GRAD = 'linear-gradient(135deg,#374151,#1f2937)';

const fmtDate = (d: string|null) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function FBadge({ f }: { f: string }) {
    const c = FONCTION_CFG[f] ?? DEF_FCT;
    return <span style={{ fontSize:11, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{f}</span>;
}
function SBadge({ s }: { s: string }) {
    const c = STATUT_CFG[s] ?? STATUT_CFG.inactif;
    const labels: Record<string,string> = { actif:'Actif', conge:'Congé', mission:'Mission', inactif:'Inactif' };
    return <span style={{ fontSize:11, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{labels[s]??s}</span>;
}
function Avatar({ agent, size=36 }: { agent: Personnel; size?: number }) {
    return (
        <div style={{ width:size, height:size, borderRadius:size/2.8, background:AVATAR_GRAD[agent.fonction]??DEF_GRAD, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.33, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {agent.lastname?.[0]}{agent.name?.[0]}
        </div>
    );
}
function SLabel({ label, color='#f53003' }: { label:string; color?:string }) {
    return <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><div style={{ width:3, height:14, borderRadius:100, background:color }}/><span style={{ fontSize:11, fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'system-ui,sans-serif' }}>{label}</span></div>;
}
function MModal({ children, onClose, maxW=680 }: { children:React.ReactNode; onClose:()=>void; maxW?: number }) {
    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:maxW, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {children}
            </div>
        </div>
    );
}
function InfoItem({ label, value }: { label:string; value?: string|null }) {
    return (
        <div style={{ borderRadius:10, background:'#fafaf9', padding:'10px 12px' }}>
            <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:3 }}>{label}</p>
            <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{value||'—'}</p>
        </div>
    );
}
function FL({ label, error, children }: { label:string; error?: string; children:React.ReactNode }) {
    return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>{children}{error&&<p style={{ marginTop:4, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>{error}</p>}</div>;
}

// ─── Formulaire Personnel ─────────────────────────────────────────────────────

function PersonnelFormModal({ title, subtitle, form, fonctions, services, statuts, roles, onSubmit, onClose, submitLabel, isEdit=false }: {
    title:string; subtitle:string; form:any; fonctions:string[]; services:Service[]; statuts:string[]; roles:string[];
    onSubmit:(e:React.FormEvent)=>void; onClose:()=>void; submitLabel:string; isEdit?:boolean;
}) {
    return (
        <MModal onClose={onClose} maxW={720}>
            <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f53003,#ff8c6a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👤</div>
                    <div>
                        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
                        <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{subtitle}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <form onSubmit={onSubmit} style={{ overflowY:'auto', flex:1, padding:'18px 22px' }}>

                {/* Identité */}
                <div style={{ marginBottom:24 }}>
                    <SLabel label="Informations personnelles" color="#3b82f6"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <FL label="Nom *" error={form.errors.name}>
                            <input type="text" value={form.data.name} onChange={e=>form.setData('name',e.target.value)} style={{ ...iSx, borderColor:form.errors.name?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Prénom *" error={form.errors.lastname}>
                            <input type="text" value={form.data.lastname} onChange={e=>form.setData('lastname',e.target.value)} style={{ ...iSx, borderColor:form.errors.lastname?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Email *" error={form.errors.email}>
                            <input type="email" value={form.data.email} onChange={e=>form.setData('email',e.target.value)} placeholder="prenom.nom@medicare.cm" style={{ ...iSx, borderColor:form.errors.email?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label={isEdit ? 'Mot de passe' : 'Mot de passe *'} error={form.errors.password}>
                            <input type="password" value={form.data.password} onChange={e=>form.setData('password',e.target.value)} placeholder={isEdit?'Laisser vide pour ne pas changer':'Minimum 8 caractères'} style={{ ...iSx, borderColor:form.errors.password?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Téléphone">
                            <input type="tel" value={form.data.telephone} onChange={e=>form.setData('telephone',e.target.value)} placeholder="+237 6XX XXX XXX" style={iSx} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                    </div>
                </div>

                {/* Professionnel */}
                <div style={{ marginBottom:20 }}>
                    <SLabel label="Informations professionnelles" color="#059669"/>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <FL label="Fonction *" error={form.errors.fonction}>
                            <select value={form.data.fonction} onChange={e=>form.setData('fonction',e.target.value)} style={{ ...iSx, borderColor:form.errors.fonction?'#ef4444':'#f0f0ee' }} onFocus={fIn} onBlur={fOut}>
                                <option value="">Sélectionner…</option>
                                {fonctions.map(f=><option key={f} value={f}>{f}</option>)}
                            </select>
                        </FL>
                        <FL label="Service">
                            <select value={form.data.service_id} onChange={e=>form.setData('service_id',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                <option value="">Sélectionner…</option>
                                {services.map(s=><option key={s.id} value={s.id}>{s.nom}</option>)}
                            </select>
                        </FL>
                        <FL label="Date d'embauche">
                            <input type="date" value={form.data.date_embauche} onChange={e=>form.setData('date_embauche',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}/>
                        </FL>
                        <FL label="Statut">
                            <select value={form.data.statut} onChange={e=>form.setData('statut',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                {statuts.map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                        </FL>
                    </div>
                </div>

                <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:16, borderTop:'1px solid #f0f0ee' }}>
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

export default function PersonnelPage({ personnel, stats, filters, statuts, fonctions, roles, services }: Props) {
    const [showNew,    setShowNew]    = useState(false);
    const [showView,   setShowView]   = useState(false);
    const [showEdit,   setShowEdit]   = useState(false);
    const [showStatut, setShowStatut] = useState(false);
    const [selected,   setSelected]   = useState<Personnel|null>(null);
    const [search,     setSearch]     = useState(filters.search     || '');
    const [fctFilter,  setFctFilter]  = useState(filters.fonction   || '');
    const [svcFilter,  setSvcFilter]  = useState(filters.service_id || '');
    const [statFilter, setStatFilter] = useState(filters.statut     || '');

    const createForm = useForm({ name:'', lastname:'', email:'', password:'', telephone:'', fonction:'', specialite:'', service_id:'', date_embauche:'', statut:'actif', role:'' });
    const editForm   = useForm({ name:'', lastname:'', email:'', password:'', telephone:'', fonction:'', specialite:'', service_id:'', date_embauche:'', statut:'actif', role:'' });
    const statutForm = useForm({ statut:'' });

    const doSearch = (e: React.FormEvent) => { e.preventDefault(); router.get('/personnel', { search, fonction:fctFilter, service_id:svcFilter, statut:statFilter }, { preserveState:true }); };
    const doFilter = (key: string, val: string) => {
        const p: any = { search, fonction:fctFilter, service_id:svcFilter, statut:statFilter }; p[key]=val;
        if(key==='fonction') setFctFilter(val); if(key==='service_id') setSvcFilter(val); if(key==='statut') setStatFilter(val);
        router.get('/personnel', p, { preserveState:true });
    };

    const openView   = (a: Personnel) => { setSelected(a); setShowView(true); };
    const openEdit   = (a: Personnel) => {
        setSelected(a);
        editForm.setData({ name:a.name||'', lastname:a.lastname||'', email:a.email||'', password:'', telephone:a.telephone||'', fonction:a.fonction||'', specialite:a.specialite||'', service_id:a.service_id?.toString()||'', date_embauche:a.date_embauche?.split('T')[0]||'', statut:a.statut||'actif', role:a.role||'' });
        setShowEdit(true);
    };
    const openStatut = (a: Personnel) => { setSelected(a); statutForm.setData('statut',a.statut); setShowStatut(true); };

    return (
        <DashboardLayout title="Personnel médical" subtitle="Gestion du personnel de l'établissement">

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total personnel', value:stats.total,      icon:'👥', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Médecins',        value:stats.medecins,   icon:'🩺', grad:'linear-gradient(135deg,#1e3a8a,#2563eb)', shadow:'rgba(37,99,235,0.35)' },
                    { label:'Infirmiers',      value:stats.infirmiers, icon:'💊', grad:'linear-gradient(135deg,#831843,#db2777)', shadow:'rgba(219,39,119,0.35)' },
                    { label:'En service',      value:stats.enService,  icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'En congé',        value:stats.enConge,    icon:'🏖️', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
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
                <form onSubmit={doSearch} style={{ position:'relative', flex:1, minWidth:240, maxWidth:380 }}>
                    <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, matricule, spécialité…"
                        style={{ width:'100%', height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' }}
                        onFocus={fIn} onBlur={fOut}/>
                </form>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[
                        { val:fctFilter,  key:'fonction',    opts:[['','Toutes fonctions'],...fonctions.map(f=>[f,f])] },
                        { val:svcFilter,  key:'service_id',  opts:[['','Tous services'],...services.map(s=>[String(s.id),s.nom])] },
                        { val:statFilter, key:'statut',      opts:[['','Tous statuts'],...statuts.map(s=>[s,s])] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>doFilter(f.key,e.target.value)}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                    <button onClick={()=>setShowNew(true)}
                        style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                        <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Ajouter personnel
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height:3, background:'linear-gradient(90deg,#2563eb,#db2777,#f53003)' }}/>
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                {['Personnel','Fonction','Spécialité','Service','Contact','Statut','Actions'].map((h,i)=>(
                                    <th key={i} style={{ padding:'12px 16px', textAlign:i===6?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {personnel.data.length===0 ? (
                                <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14 }}>
                                    <div style={{ fontSize:32, marginBottom:8 }}>👥</div>Aucun personnel trouvé
                                </td></tr>
                            ) : personnel.data.map((a,i)=>(
                                <tr key={a.id} style={{ borderBottom:i<personnel.data.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>

                                    <td style={{ padding:'12px 16px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <Avatar agent={a} size={36}/>
                                            <div>
                                                <p style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>
                                                    {a.fonction==='Médecin'?'Dr. ':''}{a.lastname} {a.name}
                                                </p>
                                                <p style={{ fontSize:11, fontFamily:'monospace', color:'#9ca3af', marginTop:1 }}>{a.matricule}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding:'12px 16px' }}><FBadge f={a.fonction}/></td>
                                    <td style={{ padding:'12px 16px', fontSize:13, color:a.specialite?'#374151':'#c0c0bc' }}>{a.specialite||'—'}</td>
                                    <td style={{ padding:'12px 16px', fontSize:13, color:'#9ca3af' }}>{a.service?.nom||'—'}</td>
                                    <td style={{ padding:'12px 16px' }}>
                                        <p style={{ fontSize:12, fontWeight:600, color:'#1a1a18' }}>{a.telephone||'—'}</p>
                                        <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{a.email}</p>
                                    </td>
                                    <td style={{ padding:'12px 16px' }}>
                                        <button onClick={()=>openStatut(a)} style={{ background:'none', border:'none', cursor:'pointer', padding:0 }}>
                                            <SBadge s={a.statut}/>
                                        </button>
                                    </td>
                                    <td style={{ padding:'12px 16px' }}>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:2 }}>
                                            <button onClick={()=>openView(a)} title="Voir profil"
                                                style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <button onClick={()=>openEdit(a)} title="Modifier"
                                                style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f0f0ee'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                            </button>
                                            <button onClick={()=>{ if(confirm(`Désactiver ${a.lastname} ${a.name} ?`)) router.delete(`/personnel/${a.id}`); }} title="Désactiver"
                                                style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fef2f2'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <svg style={{width:14,height:14,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={1.5}/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {personnel.last_page>1 && (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderTop:'1px solid #f5f5f3' }}>
                        <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                            <span style={{ fontWeight:600, color:'#1a1a18' }}>{(personnel.current_page-1)*personnel.per_page+1}</span> –{' '}
                            <span style={{ fontWeight:600, color:'#1a1a18' }}>{Math.min(personnel.current_page*personnel.per_page,personnel.total)}</span> sur{' '}
                            <span style={{ fontWeight:600, color:'#1a1a18' }}>{personnel.total.toLocaleString()}</span> agents
                        </p>
                        <div style={{ display:'flex', gap:4 }}>
                            {personnel.links.map((link,i)=>(
                                <Link key={i} href={link.url||'#'} preserveState
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
                    {/* Header coloré selon fonction */}
                    <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,${(FONCTION_CFG[selected.fonction]??DEF_FCT).bg},#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                            <Avatar agent={selected} size={52}/>
                            <div>
                                <h2 style={{ fontSize:17, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>
                                    {selected.fonction==='Médecin'?'Dr. ':''}{selected.lastname} {selected.name}
                                </h2>
                                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5 }}>
                                    <FBadge f={selected.fonction}/>
                                    <span style={{ fontFamily:'monospace', fontSize:11, color:'#9ca3af', fontWeight:600 }}>{selected.matricule}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <SBadge s={selected.statut}/>
                            <button onClick={()=>setShowView(false)} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowY:'auto', flex:1, padding:'18px 22px', display:'flex', flexDirection:'column', gap:20 }}>
                        <div>
                            <SLabel label="Informations professionnelles" color="#2563eb"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                <InfoItem label="Fonction" value={selected.fonction}/>
                                <InfoItem label="Spécialité" value={selected.specialite}/>
                                <InfoItem label="Service" value={selected.service?.nom}/>
                                <InfoItem label="Date d'embauche" value={fmtDate(selected.date_embauche)}/>
                                <InfoItem label="Rôle système" value={selected.role}/>
                            </div>
                        </div>
                        <div>
                            <SLabel label="Coordonnées" color="#059669"/>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                <InfoItem label="Email" value={selected.email}/>
                                <InfoItem label="Téléphone" value={selected.telephone}/>
                            </div>
                        </div>
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

            {/* ══════════════════════════════════════ MODAL STATUT */}
            {showStatut && selected && (
                <MModal onClose={()=>setShowStatut(false)} maxW={400}>
                    <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                        <div>
                            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18' }}>Changer le statut</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{selected.lastname} {selected.name}</p>
                        </div>
                        <button onClick={()=>setShowStatut(false)} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>
                    <form onSubmit={e=>{ e.preventDefault(); if(selected) statutForm.put(`/personnel/${selected.id}`,{onSuccess:()=>{setShowStatut(false);setSelected(null);}}); }} style={{ padding:'16px 22px' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {statuts.map(s=>{
                                const sc = STATUT_CFG[s] ?? STATUT_CFG.inactif;
                                const active = statutForm.data.statut===s;
                                const labels: Record<string,string> = { actif:'Actif', conge:'Congé', mission:'Mission', inactif:'Inactif' };
                                return (
                                    <label key={s} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, border:`1.5px solid ${active?sc.color:'#f0f0ee'}`, background:active?sc.bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                        <input type="radio" name="statut" value={s} checked={active} onChange={e=>statutForm.setData('statut',e.target.value)} style={{ accentColor:sc.color }}/>
                                        <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{labels[s]??s}</span>
                                        <SBadge s={s}/>
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:16, paddingTop:14, borderTop:'1px solid #f0f0ee' }}>
                            <button type="button" onClick={()=>setShowStatut(false)} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                            <button type="submit" disabled={statutForm.processing}
                                style={{ height:36, padding:'0 16px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:statutForm.processing?0.7:1, boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </MModal>
            )}

            {/* ══════════════════════════════════════ MODALS FORMULAIRE */}
            {showNew && (
                <PersonnelFormModal title="Ajouter un membre du personnel" subtitle="Enregistrement d'un nouveau collaborateur"
                    form={createForm} fonctions={fonctions} services={services} statuts={statuts} roles={roles}
                    onSubmit={e=>{ e.preventDefault(); createForm.post('/personnel',{onSuccess:()=>{createForm.reset();setShowNew(false);}}); }}
                    onClose={()=>setShowNew(false)} submitLabel="Enregistrer"/>
            )}
            {showEdit && selected && (
                <PersonnelFormModal title="Modifier le personnel" subtitle={`${selected.lastname} ${selected.name} · ${selected.matricule}`}
                    form={editForm} fonctions={fonctions} services={services} statuts={statuts} roles={roles}
                    onSubmit={e=>{ e.preventDefault(); editForm.put(`/personnel/${selected.id}`,{onSuccess:()=>{setShowEdit(false);setSelected(null);}}); }}
                    onClose={()=>{ setShowEdit(false); setSelected(null); }} submitLabel="Mettre à jour" isEdit/>
            )}

        </DashboardLayout>
    );
}