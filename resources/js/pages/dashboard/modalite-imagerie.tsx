import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Modalite {
    id: number; code: string; nom: string; description: string|null;
    disponible: boolean; actif: boolean;
    type_examens_count: number; examen_imageries_count: number;
}
interface Props {
    modalites: { data: Modalite[]; total: number; last_page: number; links: any[] };
    stats: { total: number; actives: number; disponibles: number; inactives: number };
    filters: { search?: string; actif?: string; disponible?: string };
}

// ─── Config modalités ─────────────────────────────────────────────────────────

const MOD_CFG: Record<string, { color: string; bg: string; border: string; icon: string; grad: string }> = {
    'Radiographie': { color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd', icon:'🩻', grad:'linear-gradient(135deg,#0c4a6e,#0284c7)' },
    'Scanner':      { color:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe', icon:'🔬', grad:'linear-gradient(135deg,#312e81,#4f46e5)' },
    'IRM':          { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', icon:'🧲', grad:'linear-gradient(135deg,#4c1d95,#7c3aed)' },
    'Échographie':  { color:'#0d9488', bg:'#f0fdfa', border:'#99f6e4', icon:'〰️', grad:'linear-gradient(135deg,#134e4a,#0d9488)' },
    'Mammographie': { color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8', icon:'🔍', grad:'linear-gradient(135deg,#831843,#db2777)' },
    'Panoramique':  { color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:'🦷', grad:'linear-gradient(135deg,#78350f,#d97706)' },
    'TEP-Scan':     { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:'⚛️', grad:'linear-gradient(135deg,#7f1d1d,#dc2626)' },
};
const DEF_CFG = { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', icon:'📷', grad:'linear-gradient(135deg,#374151,#6b7280)' };
const getCfg = (nom: string) => MOD_CFG[nom] ?? DEF_CFG;

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

const SUGGESTIONS = ['Radiographie','Scanner','IRM','Échographie','Mammographie','Panoramique','TEP-Scan'];

// ─── Modal ────────────────────────────────────────────────────────────────────

function ModaliteModal({ editItem, onClose }: { editItem: Modalite|null; onClose:()=>void }) {
    const [form, setForm] = useState({
        code: editItem?.code ?? '', nom: editItem?.nom ?? '',
        description: editItem?.description ?? '',
        disponible: editItem?.disponible ?? true, actif: editItem?.actif ?? true,
    });
    const [processing, setProcessing] = useState(false);
    const cfg = getCfg(form.nom);

    const submit = (e: React.FormEvent) => {
        e.preventDefault(); setProcessing(true);
        const opts = { onFinish:()=>setProcessing(false), onSuccess:onClose };
        editItem ? router.put(`/modalite-imagerie/${editItem.id}`, form as any, opts) : router.post('/modalite-imagerie', form as any, opts);
    };

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:520, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', overflow:'hidden' }}>

                {/* Header coloré */}
                <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,${cfg.bg},#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:44, height:44, borderRadius:14, background:cfg.bg, border:`1.5px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, transition:'all 0.2s' }}>
                            {cfg.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{editItem ? 'Modifier la modalité' : 'Nouvelle modalité'}</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>Modalité d'imagerie médicale</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:16 }}>

                    {/* Suggestions rapides */}
                    {!editItem && (
                        <div>
                            <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>Suggestions rapides</p>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                                {SUGGESTIONS.map(s=>{
                                    const sc = getCfg(s);
                                    const active = form.nom===s;
                                    return (
                                        <button key={s} type="button" onClick={()=>setForm(f=>({...f,nom:s,code:'MOD-'+s.toUpperCase().replace(/[^A-Z]/g,'').slice(0,4)}))}
                                            style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:100, border:`1.5px solid ${active?sc.color:'#f0f0ee'}`, background:active?sc.bg:'#fafaf9', fontSize:12, fontWeight:active?700:500, color:active?sc.color:'#9ca3af', cursor:'pointer', transition:'all 0.15s', fontFamily:'system-ui,sans-serif' }}
                                            onMouseEnter={e=>{if(!active){(e.currentTarget as HTMLElement).style.borderColor=sc.color;(e.currentTarget as HTMLElement).style.color=sc.color;}}}
                                            onMouseLeave={e=>{if(!active){(e.currentTarget as HTMLElement).style.borderColor='#f0f0ee';(e.currentTarget as HTMLElement).style.color='#9ca3af';}}}>
                                            {sc.icon} {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Code + Nom */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Code *</label>
                            <input type="text" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="MOD-RX" required maxLength={20} style={iSx} onFocus={fIn} onBlur={fOut}/>
                        </div>
                        <div>
                            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Nom *</label>
                            <input type="text" value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} placeholder="Radiographie" required maxLength={100} style={iSx} onFocus={fIn} onBlur={fOut}/>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Description</label>
                        <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Indications, équipements, conditions particulières…"
                            style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                    </div>

                    {/* Toggles */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        {[
                            { key:'disponible', label:'Disponible', sub:'Équipement opérationnel', active:form.disponible, color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', icon:'🟢' },
                            { key:'actif',      label:'Actif',      sub:'Visible dans le catalogue', active:form.actif, color:'#f53003', bg:'#fff5f5', border:'#ffd0c8', icon:'✅' },
                        ].map(opt=>(
                            <label key={opt.key} onClick={()=>setForm(f=>({...f,[opt.key]:!opt.active}))}
                                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12, border:`1.5px solid ${opt.active?opt.color:'#f0f0ee'}`, background:opt.active?opt.bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${opt.active?opt.color:'#d1d5db'}`, background:opt.active?opt.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }}>
                                    {opt.active && <svg style={{width:11,height:11,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                </div>
                                <div>
                                    <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{opt.label}</p>
                                    <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{opt.sub}</p>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                        <button type="button" onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                        <button type="submit" disabled={processing}
                            style={{ height:36, padding:'0 18px', borderRadius:9, background:`linear-gradient(135deg,${cfg.color},${cfg.color}cc)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', opacity:processing?0.7:1, boxShadow:`0 4px 14px ${cfg.color}40`, display:'flex', alignItems:'center', gap:7 }}>
                            ✓ {processing ? 'Enregistrement…' : editItem ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ModaliteImagerie({ modalites, stats, filters }: Props) {
    const { flash, errors: pageErrors }: any = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem,  setEditItem]  = useState<Modalite|null>(null);
    const [search,    setSearch]    = useState(filters.search     ?? '');
    const [actif,     setActif]     = useState(filters.actif      ?? '');
    const [dispo,     setDispo]     = useState(filters.disponible ?? '');

    const apply = (ov: object = {}) => router.get('/modalite-imagerie', { search, actif, disponible:dispo, ...ov }, { preserveState:true, replace:true });

    const handleDelete = (m: Modalite) => {
        const u = m.type_examens_count + m.examen_imageries_count;
        if (u>0) { alert(`Impossible de supprimer : "${m.nom}" est utilisée dans ${u} examen(s).`); return; }
        if (confirm(`Supprimer la modalité "${m.nom}" ?`)) router.delete(`/modalite-imagerie/${m.id}`);
    };

    return (
        <DashboardLayout title="Modalités d'imagerie" subtitle="Gestion des types d'équipements d'imagerie médicale">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}
            {pageErrors?.delete && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#fef2f2', border:'1px solid #fecaca', fontSize:13, color:'#dc2626', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>⚠️ {pageErrors.delete}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total',       value:stats.total,       icon:'📷', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Actives',     value:stats.actives,     icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'Disponibles', value:stats.disponibles, icon:'🟢', grad:'linear-gradient(135deg,#0c4a6e,#0284c7)', shadow:'rgba(2,132,199,0.35)' },
                    { label:'Inactives',   value:stats.inactives,   icon:'⭕', grad:'linear-gradient(135deg,#374151,#6b7280)', shadow:'rgba(107,114,128,0.2)' },
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
                    <div style={{ position:'relative' }}>
                        <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:'#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" value={search} onChange={e=>{ setSearch(e.target.value); apply({search:e.target.value}); }} placeholder="Code, nom…"
                            style={{ height:38, paddingLeft:30, paddingRight:12, borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', width:200 }}
                            onFocus={fIn} onBlur={fOut}/>
                    </div>
                    {[
                        { val:actif, set:setActif, key:'actif',      opts:[['','Tous statuts'],['1','Actives'],['0','Inactives']] },
                        { val:dispo, set:setDispo, key:'disponible',  opts:[['','Toute dispo'],['1','Disponibles'],['0','Indisponibles']] },
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
                    Nouvelle modalité
                </button>
            </div>

            {/* ══════════════════════════════════════ GRILLE */}
            {modalites.data.length > 0 ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                    {modalites.data.map(m=>{
                        const cfg = getCfg(m.nom);
                        const usages = m.type_examens_count + m.examen_imageries_count;
                        const pct = Math.min(usages*10, 100);
                        return (
                            <div key={m.id}
                                style={{ borderRadius:20, overflow:'hidden', border:`1.5px solid ${m.disponible?cfg.border:'#f0f0ee'}`, borderStyle:m.disponible?'solid':'dashed', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', opacity:m.actif?1:0.6, transition:'transform 0.2s,box-shadow 0.2s' }}
                                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 12px 32px ${cfg.color}22`; }}
                                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}>

                                {/* Barre couleur */}
                                <div style={{ height:4, background:cfg.grad }}/>

                                <div style={{ padding:'16px 18px' }}>
                                    {/* Header carte */}
                                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                        <div style={{ width:46, height:46, borderRadius:14, background:cfg.bg, border:`1.5px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                                            {cfg.icon}
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
                                            <span style={{ fontSize:10, fontWeight:700, color:m.actif?'#16a34a':'#6b7280', background:m.actif?'#f0fdf4':'#f9fafb', border:`1px solid ${m.actif?'#bbf7d0':'#e5e7eb'}`, borderRadius:100, padding:'2px 8px' }}>
                                                {m.actif ? '● Actif' : '● Inactif'}
                                            </span>
                                            <span style={{ fontSize:10, fontWeight:700, color:m.disponible?'#0284c7':'#d97706', background:m.disponible?'#f0f9ff':'#fffbeb', border:`1px solid ${m.disponible?'#bae6fd':'#fde68a'}`, borderRadius:100, padding:'2px 8px' }}>
                                                {m.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nom + Code */}
                                    <p style={{ fontSize:15, fontWeight:800, color:cfg.color, letterSpacing:'-0.2px', marginBottom:2 }}>{m.nom}</p>
                                    <p style={{ fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#9ca3af', marginBottom: m.description ? 8 : 12 }}>{m.code}</p>

                                    {m.description && (
                                        <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.6, fontFamily:'system-ui,sans-serif', marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                                            {m.description}
                                        </p>
                                    )}

                                    {/* Stats usages */}
                                    <div style={{ borderTop:'1px solid #f5f5f3', paddingTop:10, marginBottom:10 }}>
                                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>
                                            <span>{m.type_examens_count} type(s)</span>
                                            <span>{m.examen_imageries_count} examen(s)</span>
                                        </div>
                                        {usages > 0 && (
                                            <div style={{ height:5, borderRadius:100, background:'#f0f0ee', overflow:'hidden' }}>
                                                <div style={{ height:'100%', width:`${pct}%`, background:cfg.color, borderRadius:100, transition:'width 0.5s' }}/>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display:'flex', gap:6 }}>
                                        <button onClick={()=>{ setEditItem(m); setShowModal(true); }}
                                            style={{ flex:1, height:32, borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:5, transition:'all 0.15s' }}
                                            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=cfg.color; (e.currentTarget as HTMLElement).style.color=cfg.color; (e.currentTarget as HTMLElement).style.background=cfg.bg; }}
                                            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f0f0ee'; (e.currentTarget as HTMLElement).style.color='#374151'; (e.currentTarget as HTMLElement).style.background='#fafaf9'; }}>
                                            <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                            Modifier
                                        </button>
                                        <button onClick={()=>handleDelete(m)}
                                            style={{ width:32, height:32, borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s' }}
                                            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#fecaca'; (e.currentTarget as HTMLElement).style.background='#fef2f2'; }}
                                            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f0f0ee'; (e.currentTarget as HTMLElement).style.background='#fafaf9'; }}>
                                            <svg style={{width:12,height:12,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Carte ajouter */}
                    <button onClick={()=>{ setEditItem(null); setShowModal(true); }}
                        style={{ borderRadius:20, border:'2px dashed #e5e7eb', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer', minHeight:220, transition:'all 0.2s', fontFamily:'system-ui,sans-serif' }}
                        onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.background='#fff5f5'; }}
                        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'; (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                        <div style={{ width:44, height:44, borderRadius:14, background:'#f5f5f3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🩻</div>
                        <span style={{ fontSize:13, fontWeight:600, color:'#c0c0bc' }}>Nouvelle modalité</span>
                    </button>
                </div>
            ) : (
                <div style={{ borderRadius:20, border:'1px solid #eee', padding:'60px 40px', textAlign:'center', background:'#fff', fontFamily:'system-ui,sans-serif' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🩻</div>
                    <p style={{ fontSize:16, fontWeight:700, color:'#1a1a18', marginBottom:6 }}>Aucune modalité trouvée</p>
                    <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Créez votre première modalité d'imagerie.</p>
                    <button onClick={()=>{ setEditItem(null); setShowModal(true); }}
                        style={{ height:38, padding:'0 20px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,48,3,0.25)' }}>
                        Créer une modalité
                    </button>
                </div>
            )}

            {/* Pagination */}
            {modalites.last_page > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:20 }}>
                    <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                        <span style={{ fontWeight:600, color:'#1a1a18' }}>{modalites.total}</span> modalités
                    </p>
                    <div style={{ display:'flex', gap:4 }}>
                        {modalites.links.map((link,i)=>(
                            <button key={i} disabled={!link.url} onClick={()=>link.url&&router.get(link.url,{},{preserveState:true})}
                                style={{ minWidth:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:7, fontSize:12, fontFamily:'system-ui,sans-serif', fontWeight:link.active?700:400, background:link.active?'#f53003':'transparent', color:link.active?'#fff':'#706f6c', border:link.active?'none':'1px solid #f0f0ee', cursor:link.url?'pointer':'not-allowed', opacity:link.url?1:0.4, padding:'0 6px' }}
                                dangerouslySetInnerHTML={{ __html:link.label }}/>
                        ))}
                    </div>
                </div>
            )}

            {showModal && <ModaliteModal editItem={editItem} onClose={()=>{ setShowModal(false); setEditItem(null); }}/>}
        </DashboardLayout>
    );
}