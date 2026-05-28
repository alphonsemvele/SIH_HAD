import { Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

type Statut        = 'planifiee'|'en_cours'|'terminee'|'annulee';
type Priorite      = 'normal'|'surveillance'|'critique';
type TypeTournee   = 'complete'|'cas_critiques'|'chambre_specifique';
type RecurrenceType = 'unique'|'quotidienne'|'hebdomadaire'|'personnalisee';
type Frequence     = 1|2|3;

interface VisiteHad { id: number; patient_id: number; ordre: number; priorite: Priorite; chambre: string; lit: string; diagnostic: string; jours_hospitalisation: number; observations: string; visite_at: string|null; notes_soignant: string; temperature: string; tension: string; pouls: string; saturation: string; patient: { id: number; nom: string; prenom: string; sexe: 'M'|'F'; age: number; }; }
interface Tournee  { id: number; soignant_id: number; service_id: number; date: string; vehicule: string|null; heure_debut_prevue: string; heure_fin_prevue: string|null; heure_debut_effective: string|null; heure_fin_effective: string|null; kilometres: string|null; type: TypeTournee; notes: string; statut: Statut; patients_total: number; patients_vus: number; recurrence?: RecurrenceType; jours_actifs?: number[]; frequence_journaliere?: Frequence; heure_debut_2?: string; heure_debut_3?: string; date_fin_recurrence?: string; soignant: { id: number; name: string }; service: { id: number; nom: string; etage: string }; visite_hads: VisiteHad[]; }
interface Service  { id: number; nom: string; etage: string; patients_actuels: number; }
interface Soignant { id: number; name: string; }
interface Props    { tournees: Tournee[]; services: Service[]; soignants: Soignant[]; stats: { tournees_jour: number; en_cours: number; terminees: number; patients_a_visiter: number; patients_vus: number }; filters: { service_id?: string; soignant_id?: string; statut?: string }; }

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUT_CFG: Record<Statut, { label: string; color: string; bg: string; border: string; btnGrad: string }> = {
    planifiee: { label:'Planifiée', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', btnGrad:'linear-gradient(135deg,#f53003,#e02a00)' },
    en_cours:  { label:'En cours',  color:'#d97706', bg:'#fffbeb', border:'#fde68a', btnGrad:'linear-gradient(135deg,#f97316,#ea580c)' },
    terminee:  { label:'Terminée',  color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', btnGrad:'transparent' },
    annulee:   { label:'Annulée',   color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb', btnGrad:'transparent' },
};
const PRIO_CFG: Record<Priorite, { color: string; bg: string; border: string }> = {
    normal:       { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
    surveillance: { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
    critique:     { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};
const PRIO_LABEL: Record<Priorite, string> = { normal:'Normal', surveillance:'Surveillance', critique:'Critique' };
const JOURS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const recurrenceOpts: { value: RecurrenceType; label: string; desc: string }[] = [
    { value:'unique',        label:'Unique',        desc:'Une seule fois' },
    { value:'quotidienne',   label:'Quotidienne',   desc:'Tous les jours' },
    { value:'hebdomadaire',  label:'Hebdomadaire',  desc:'Mêmes jours/sem' },
    { value:'personnalisee', label:'Personnalisée', desc:'Jours au choix' },
];
const defaultStats = { tournees_jour:0, en_cours:0, terminees:0, patients_a_visiter:0, patients_vus:0 };

const iSx: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

function Badge({ label, cfg }: { label:string; cfg: { color:string; bg:string; border:string } }) {
    return <span style={{ fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:100, padding:'3px 10px', whiteSpace:'nowrap', fontFamily:'system-ui,sans-serif' }}>{label}</span>;
}
function FL({ label, children }: { label:string; children:React.ReactNode }) {
    return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>{children}</div>;
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Tournees({
    tournees=[], services=[], soignants=[],
    stats=defaultStats, filters={},
}: Partial<Props>) {
    const { flash, errors } = usePage<{ flash?: { success?:string; error?:string }; errors?: Record<string,string> }>().props;

    const [activeTab,   setActiveTab]   = useState<'aujourdhui'|'planning'|'historique'>('aujourdhui');
    const [showNew,     setShowNew]     = useState(false);
    const [selTournee,  setSelTournee]  = useState<Tournee|null>(null);
    const [selVisite,   setSelVisite]   = useState<VisiteHad|null>(null);
    const [filterForm,  setFilterForm]  = useState(filters);
    const [weekOffset,  setWeekOffset]  = useState(0);

    const [newForm, setNewForm] = useState({ soignant_id:'', service_id:'', date:new Date().toISOString().slice(0,10), heure_debut_prevue:'', heure_fin_prevue:'', vehicule:'', type:'complete' as TypeTournee, notes:'', recurrence:'unique' as RecurrenceType, jours_actifs:[1,2,3,4,5] as number[], frequence_journaliere:1 as Frequence, heure_debut_2:'', heure_debut_3:'', date_fin_recurrence:'' });
    const [obsForm, setObsForm] = useState({ observations:'', temperature:'', tension:'', pouls:'', saturation:'', notes_soignant:'' });

    // ── Planning semaine ──────────────────────────────────────────────────────
    const weekDays = useMemo(() => {
        const today = new Date();
        const mon = new Date(today); mon.setDate(today.getDate()-today.getDay()+1+weekOffset*7);
        return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
    }, [weekOffset]);

    const tourneesByDay = useMemo(() => {
        const map: Record<string,Tournee[]> = {};
        weekDays.forEach(d=>{ map[d.toISOString().slice(0,10)]=[]; });
        tournees.forEach(t=>{ if(map[t.date]) map[t.date].push(t); });
        return map;
    }, [tournees,weekDays]);

    const recurrenceSummary = useMemo(() => {
        const { recurrence, jours_actifs, frequence_journaliere, date_fin_recurrence } = newForm;
        const joursL = [...jours_actifs].sort().map(j=>JOURS[j]).join(', ');
        const freq   = frequence_journaliere>1 ? ` · ${frequence_journaliere}×/jour` : '';
        const fin    = date_fin_recurrence ? ` · jusqu'au ${new Date(date_fin_recurrence).toLocaleDateString('fr-FR')}` : '';
        if (recurrence==='unique')       return 'Une seule occurrence';
        if (recurrence==='quotidienne')  return `Tous les jours${freq}${fin}`;
        if (recurrence==='hebdomadaire') return `Chaque semaine · ${joursL}${freq}${fin}`;
        return `Jours sélectionnés : ${joursL}${freq}${fin}`;
    }, [newForm]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const applyFilters  = () => router.get('/tournees', filterForm, { preserveScroll:true, replace:true });
    const submitNew     = (e: React.FormEvent) => { e.preventDefault(); router.post('/tournees', newForm, { preserveScroll:true, onSuccess:()=>setShowNew(false) }); };
    const demarrer      = (t: Tournee) => router.post(`/tournees/${t.id}/demarrer`,{},{preserveScroll:true,onSuccess:()=>setSelTournee(p=>p?{...p,statut:'en_cours',heure_debut_effective:new Date().toTimeString().slice(0,5)}:p)});
    const terminer      = () => { if(!selTournee) return; router.post(`/tournees/${selTournee.id}/terminer`,{},{preserveScroll:true,onSuccess:()=>{setSelTournee(null);setSelVisite(null);}}); };
    const suspendre     = () => { if(!selTournee) return; router.post(`/tournees/${selTournee.id}/suspendre`,{},{preserveScroll:true,onSuccess:()=>setSelTournee(null)}); };
    const validerVisite = () => {
        if(!selVisite||!selTournee) return;
        router.post(`/tournees/${selTournee.id}/visites/${selVisite.id}/valider`, obsForm, { preserveScroll:true, onSuccess:()=>{
            setSelTournee(prev=>{ if(!prev) return prev; const vh=prev.visite_hads.map(v=>v.id===selVisite.id?{...v,visite_at:new Date().toISOString(),observations:obsForm.observations}:v); return {...prev,visite_hads:vh,patients_vus:vh.filter(v=>v.visite_at!==null).length}; });
            setObsForm({observations:'',temperature:'',tension:'',pouls:'',saturation:'',notes_soignant:''});
            const next = selTournee.visite_hads.find(v=>v.id!==selVisite.id&&v.visite_at===null);
            setSelVisite(next??null);
        }});
    };
    const ouvrirVisite  = (v: VisiteHad) => { setSelVisite(v); setObsForm({observations:'',temperature:v.temperature??'',tension:v.tension??'',pouls:v.pouls??'',saturation:v.saturation??'',notes_soignant:''}); };
    const ouvrirTournee = (t: Tournee) => {
        setSelTournee(t);
        const premier = [...t.visite_hads].sort((a,b)=>a.ordre-b.ordre).find(v=>v.visite_at===null);
        if (premier) ouvrirVisite(premier); else setSelVisite(null);
        if (t.statut==='planifiee') demarrer(t);
    };
    const toggleJour = (j: number) => setNewForm(p=>({...p,jours_actifs:p.jours_actifs.includes(j)?p.jours_actifs.filter(x=>x!==j):[...p.jours_actifs,j]}));

    return (
        <DashboardLayout title="Tournées médicales" subtitle="Visites des soignants dans les services">

            {/* Flash */}
            {(flash?.success||flash?.error) && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:flash.error?'#fef2f2':'#f0fdf4', border:`1px solid ${flash.error?'#fecaca':'#bbf7d0'}`, fontSize:13, color:flash.error?'#dc2626':'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>
                    {flash.error?'⚠️':'✅'} {flash.success??flash.error}
                </div>
            )}
            {errors && Object.keys(errors).length>0 && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#fef2f2', border:'1px solid #fecaca', fontSize:13, fontFamily:'system-ui,sans-serif' }}>
                    <p style={{ fontWeight:700, color:'#dc2626', marginBottom:8 }}>Erreurs :</p>
                    {Object.entries(errors).map(([f,m])=><p key={f} style={{ color:'#b91c1c' }}><strong>{f}</strong> : {m}</p>)}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:"Tournées du jour", value:stats.tournees_jour, icon:'📋', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:"En cours",          value:stats.en_cours,      icon:'🔄', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
                    { label:"Terminées",         value:stats.terminees,     icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:"À visiter",         value:stats.patients_a_visiter, icon:'👥', grad:'linear-gradient(135deg,#4c1d95,#7c3aed)', shadow:'rgba(124,58,237,0.35)' },
                    { label:"Patients vus",      value:stats.patients_vus,  icon:'👁️', grad:'linear-gradient(135deg,#0c4a6e,#0284c7)', shadow:'rgba(2,132,199,0.35)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize:28, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.85, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TABS */}
            <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:20, background:'#f5f5f3', borderRadius:12, padding:4 }}>
                {(['aujourdhui','planning','historique'] as const).map(tab=>(
                    <button key={tab} onClick={()=>setActiveTab(tab)}
                        style={{ flex:1, height:36, borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'system-ui,sans-serif', transition:'all 0.15s', background:activeTab===tab?'#fff':'transparent', color:activeTab===tab?'#1a1a18':'#9ca3af', boxShadow:activeTab===tab?'0 1px 4px rgba(0,0,0,0.08)':'none' }}>
                        {tab==='aujourdhui'?"Aujourd'hui":tab==='planning'?'Planning semaine':'Historique'}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {[
                        { val:filterForm.service_id??'',  key:'service_id',  opts:[['','Tous les services'], ...services.map(s=>[String(s.id),s.nom])] },
                        { val:filterForm.soignant_id??'', key:'soignant_id', opts:[['','Tous les soignants'],...soignants.map(s=>[String(s.id),s.name])] },
                        { val:filterForm.statut??'',      key:'statut',      opts:[['','Tous les statuts'],...Object.entries(STATUT_CFG).map(([k,v])=>[k,v.label])] },
                    ].map((f,i)=>(
                        <select key={i} value={f.val} onChange={e=>setFilterForm(p=>({...p,[f.key]:e.target.value}))} onBlur={applyFilters}
                            style={{ height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', cursor:'pointer' }}>
                            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
                        </select>
                    ))}
                </div>
                <button onClick={()=>setShowNew(true)}
                    style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)', transition:'transform 0.15s' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                    Planifier une tournée
                </button>
            </div>

            {/* ══════════════════════════════════════ VUE PLANNING SEMAINE */}
            {activeTab==='planning' && (
                <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            {[{fn:()=>setWeekOffset(p=>p-1),icon:'‹'},{fn:()=>setWeekOffset(p=>p+1),icon:'›'}].map((btn,i)=>(
                                <button key={i} onClick={btn.fn} style={{ width:32, height:32, borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', fontSize:18, color:'#706f6c', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif' }}>{btn.icon}</button>
                            ))}
                            <span style={{ fontSize:14, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>
                                {weekDays[0].toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} — {weekDays[6].toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
                            </span>
                            {weekOffset!==0 && <button onClick={()=>setWeekOffset(0)} style={{ height:28, padding:'0 10px', borderRadius:8, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Aujourd'hui</button>}
                        </div>
                        <div style={{ display:'flex', gap:14 }}>
                            {[{color:'#3b82f6',label:'Planifiée'},{color:'#f97316',label:'En cours'},{color:'#10b981',label:'Terminée'}].map(({color,label})=>(
                                <div key={label} style={{ display:'flex', alignItems:'center', gap:5 }}>
                                    <div style={{ width:8, height:8, borderRadius:2, background:color }}/>
                                    <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10 }}>
                        {weekDays.map(day=>{
                            const iso      = day.toISOString().slice(0,10);
                            const isToday  = iso===new Date().toISOString().slice(0,10);
                            const dayT     = tourneesByDay[iso]??[];
                            const isWeekend= day.getDay()===0||day.getDay()===6;
                            return (
                                <div key={iso} style={{ borderRadius:16, border:`1.5px solid ${isToday?'#f53003':'#f0f0ee'}`, background:isWeekend?'#fafaf9':'#fff', padding:12, minHeight:140 }}>
                                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                                        <div>
                                            <p style={{ fontSize:11, fontWeight:600, color:isWeekend?'#c0c0bc':'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{JOURS[day.getDay()]}</p>
                                            <p style={{ fontSize:17, fontWeight:800, color:isToday?'#f53003':'#1a1a18', lineHeight:1.2 }}>{day.getDate()}</p>
                                        </div>
                                        {dayT.length>0 && <span style={{ width:20, height:20, borderRadius:'50%', background:'#f5f5f3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#706f6c' }}>{dayT.length}</span>}
                                    </div>
                                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                        {dayT.length===0 ? (
                                            <button onClick={()=>{ setShowNew(true); setNewForm(p=>({...p,date:iso})); }}
                                                style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px dashed #e5e7eb', background:'transparent', cursor:'pointer', color:'#c0c0bc', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                                                onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.color='#f53003'; }}
                                                onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#e5e7eb'; (e.currentTarget as HTMLElement).style.color='#c0c0bc'; }}>
                                                +
                                            </button>
                                        ) : (<>
                                            {dayT.map(t=>{
                                                const sc = STATUT_CFG[t.statut];
                                                const dotColor = t.statut==='planifiee'?'#3b82f6':t.statut==='en_cours'?'#f97316':t.statut==='terminee'?'#10b981':'#9ca3af';
                                                const pct = t.patients_total>0?(t.patients_vus/t.patients_total)*100:0;
                                                return (
                                                    <button key={t.id} onClick={()=>ouvrirTournee(t)}
                                                        style={{ width:'100%', padding:'8px 10px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
                                                        onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f53003'; (e.currentTarget as HTMLElement).style.background='#fff'; }}
                                                        onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f0f0ee'; (e.currentTarget as HTMLElement).style.background='#fafaf9'; }}>
                                                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                                                            <div style={{ width:6, height:6, borderRadius:2, background:dotColor, flexShrink:0 }}/>
                                                            <p style={{ fontSize:11, fontWeight:700, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{t.service.nom}</p>
                                                        </div>
                                                        <p style={{ fontSize:10, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:5 }}>{t.heure_debut_prevue} · {t.soignant.name.split(' ')[0]}</p>
                                                        <div style={{ height:3, borderRadius:100, background:'#f0f0ee', overflow:'hidden' }}>
                                                            <div style={{ height:'100%', width:`${pct}%`, background:t.statut==='terminee'?'#10b981':'#f53003', borderRadius:100 }}/>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            <button onClick={()=>{ setShowNew(true); setNewForm(p=>({...p,date:iso})); }} style={{ width:'100%', padding:'4px 0', border:'none', background:'transparent', cursor:'pointer', fontSize:11, color:'#c0c0bc', fontFamily:'system-ui,sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:3 }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#f53003'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#c0c0bc'}>
                                                + Ajouter
                                            </button>
                                        </>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:16 }}>
                        {[
                            { label:'Tournées planifiées cette semaine', value:Object.values(tourneesByDay).flat().length,                       color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
                            { label:'Jours avec tournées',               value:Object.values(tourneesByDay).filter(v=>v.length>0).length,        color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
                            { label:'Jours sans tournée',                value:Object.values(tourneesByDay).filter(v=>v.length===0).length,       color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
                        ].map(({label,value,color,bg,border})=>(
                            <div key={label} style={{ borderRadius:14, background:bg, border:`1px solid ${border}`, padding:'14px 18px' }}>
                                <p style={{ fontSize:26, fontWeight:800, color, letterSpacing:'-0.5px', lineHeight:1, marginBottom:4 }}>{value}</p>
                                <p style={{ fontSize:12, color, opacity:0.8, fontFamily:'system-ui,sans-serif' }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════ VUE LISTE */}
            {activeTab!=='planning' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {tournees.length===0 ? (
                        <div style={{ borderRadius:20, border:'1px solid #eee', background:'#fff', padding:'48px', textAlign:'center', color:'#c0c0bc', fontSize:14, fontFamily:'system-ui,sans-serif' }}>
                            <div style={{ fontSize:36, marginBottom:8 }}>🚑</div>
                            Aucune tournée pour ces filtres.
                        </div>
                    ) : tournees.map(t=>{
                        const sc  = STATUT_CFG[t.statut];
                        const pct = t.patients_total>0?(t.patients_vus/t.patients_total)*100:0;
                        const barColor = t.statut==='terminee'?'#10b981':t.statut==='en_cours'?'#f97316':'#3b82f6';
                        return (
                            <div key={t.id} style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16, padding:'16px 20px' }}>
                                    {/* Infos gauche */}
                                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                        <div style={{ width:48, height:48, borderRadius:14, background:sc.bg, border:`1.5px solid ${sc.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>🚑</div>
                                        <div>
                                            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                                                <h3 style={{ fontSize:15, fontWeight:700, color:'#1a1a18' }}>{t.service.nom}</h3>
                                                <Badge label={sc.label} cfg={sc}/>
                                                {t.vehicule && <span style={{ fontSize:11, color:'#9ca3af', background:'#fafaf9', border:'1px solid #f0f0ee', borderRadius:100, padding:'2px 8px' }}>🚗 {t.vehicule}</span>}
                                                {t.recurrence && t.recurrence!=='unique' && <span style={{ fontSize:11, color:'#9ca3af', background:'#fafaf9', border:'1px solid #f0f0ee', borderRadius:100, padding:'2px 8px' }}>🔄 {t.recurrence==='quotidienne'?'Quotidienne':t.recurrence==='hebdomadaire'?'Hebdo':'Personnalisée'}</span>}
                                                {(t.frequence_journaliere??1)>1 && <span style={{ fontSize:11, fontWeight:700, color:'#7c3aed', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:100, padding:'2px 8px' }}>{t.frequence_journaliere}×/jour</span>}
                                            </div>
                                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                                                {t.soignant.name} · {t.service.etage}
                                                {t.jours_actifs&&t.jours_actifs.length>0 && <span style={{ marginLeft:8 }}>{[...t.jours_actifs].sort().map(j=>JOURS[j]).join(' · ')}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Métriques droite */}
                                    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                                        <div style={{ textAlign:'center' }}>
                                            <div style={{ fontSize:22, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.5px', lineHeight:1 }}>{t.patients_vus}<span style={{ fontSize:14, fontWeight:500, color:'#9ca3af' }}>/{t.patients_total}</span></div>
                                            <div style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>Patients vus</div>
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            <div style={{ fontSize:14, fontWeight:700, color:'#1a1a18' }}>{t.heure_debut_prevue}</div>
                                            <div style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>{t.heure_fin_effective?`→ ${t.heure_fin_effective}`:t.heure_debut_effective?'En cours':'Prévu'}</div>
                                        </div>
                                        {t.kilometres && (
                                            <div style={{ textAlign:'center' }}>
                                                <div style={{ fontSize:14, fontWeight:700, color:'#1a1a18' }}>{t.kilometres} km</div>
                                                <div style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:1 }}>Parcourus</div>
                                            </div>
                                        )}
                                        <button onClick={()=>ouvrirTournee(t)}
                                            style={{ height:36, padding:'0 18px', borderRadius:10, border: t.statut==='terminee'||t.statut==='annulee'?'1.5px solid #f0f0ee':'none', background:t.statut==='terminee'||t.statut==='annulee'?'#fafaf9':sc.btnGrad, color:t.statut==='terminee'||t.statut==='annulee'?'#706f6c':'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:t.statut==='planifiee'?'0 4px 14px rgba(245,48,3,0.25)':t.statut==='en_cours'?'0 4px 14px rgba(249,115,22,0.25)':'none', transition:'transform 0.15s' }}
                                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'}
                                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.transform='none'}>
                                            {t.statut==='planifiee'?'Démarrer':t.statut==='en_cours'?'Continuer':'Voir'}
                                        </button>
                                    </div>
                                </div>
                                {/* Barre de progression */}
                                <div style={{ height:3, background:'#f5f5f3' }}>
                                    <div style={{ height:'100%', width:`${pct}%`, background:barColor, transition:'width 0.5s' }}/>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════ MODAL NOUVELLE TOURNÉE */}
            {showNew && (
                <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
                    <div style={{ width:'100%', maxWidth:740, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                        <div style={{ padding:'18px 24px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#f53003,#ff8c6a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🚑</div>
                                <div>
                                    <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18' }}>Planifier une tournée</h2>
                                    <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>Programmation et récurrence</p>
                                </div>
                            </div>
                            <button onClick={()=>setShowNew(false)} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <form onSubmit={submitNew} style={{ overflowY:'auto', flex:1, padding:'18px 24px', display:'flex', flexDirection:'column', gap:18 }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <FL label="Soignant *">
                                    <select value={newForm.soignant_id} onChange={e=>setNewForm(p=>({...p,soignant_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value="">Sélectionner…</option>
                                        {soignants.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </FL>
                                <FL label="Service *">
                                    <select value={newForm.service_id} onChange={e=>setNewForm(p=>({...p,service_id:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value="">Sélectionner…</option>
                                        {services.map(s=><option key={s.id} value={s.id}>{s.nom} ({s.patients_actuels} patients)</option>)}
                                    </select>
                                </FL>
                            </div>

                            {/* Récurrence */}
                            <div style={{ borderRadius:16, border:'1.5px solid #f0f0ee', padding:'14px 16px' }}>
                                <p style={{ fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:12 }}>🔄 Récurrence</p>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
                                    {recurrenceOpts.map(({value,label,desc})=>{
                                        const active=newForm.recurrence===value;
                                        return (
                                            <button key={value} type="button" onClick={()=>setNewForm(p=>({...p,recurrence:value}))}
                                                style={{ padding:'10px 8px', borderRadius:12, border:`1.5px solid ${active?'#f53003':'#f0f0ee'}`, background:active?'#fff5f5':'#fafaf9', cursor:'pointer', textAlign:'center', transition:'all 0.15s' }}>
                                                <p style={{ fontSize:12, fontWeight:700, color:active?'#f53003':'#374151', fontFamily:'system-ui,sans-serif' }}>{label}</p>
                                                <p style={{ fontSize:10, color:active?'#f53003':'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:3, opacity:0.8 }}>{desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                {(newForm.recurrence==='hebdomadaire'||newForm.recurrence==='personnalisee') && (
                                    <div style={{ marginBottom:12 }}>
                                        <p style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>Jours actifs</p>
                                        <div style={{ display:'flex', gap:8 }}>
                                            {JOURS.map((j,idx)=>{
                                                const active=newForm.jours_actifs.includes(idx);
                                                return (
                                                    <button key={idx} type="button" onClick={()=>toggleJour(idx)}
                                                        style={{ width:36, height:36, borderRadius:'50%', border:`1.5px solid ${active?'#f53003':'#f0f0ee'}`, background:active?'#f53003':'#fafaf9', color:active?'#fff':'#9ca3af', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', flexShrink:0 }}>
                                                        {j}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {newForm.jours_actifs.length===0 && <p style={{ marginTop:6, fontSize:11, color:'#ef4444', fontFamily:'system-ui,sans-serif' }}>Sélectionnez au moins un jour.</p>}
                                    </div>
                                )}

                                <div style={{ marginBottom:12 }}>
                                    <p style={{ fontSize:11, fontWeight:600, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>Fréquence journalière</p>
                                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                        {([1,2,3] as Frequence[]).map(f=>{
                                            const active=newForm.frequence_journaliere===f;
                                            return (
                                                <button key={f} type="button" onClick={()=>setNewForm(p=>({...p,frequence_journaliere:f}))}
                                                    style={{ height:34, padding:'0 14px', borderRadius:9, border:`1.5px solid ${active?'#f53003':'#f0f0ee'}`, background:active?'#fff5f5':'#fafaf9', color:active?'#f53003':'#9ca3af', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                                                    {f}×
                                                </button>
                                            );
                                        })}
                                        <span style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>tournée{newForm.frequence_journaliere>1?'s':''}/jour</span>
                                    </div>
                                </div>

                                {newForm.recurrence!=='unique' && (
                                    <FL label="Date de fin de récurrence">
                                        <input type="date" value={newForm.date_fin_recurrence} onChange={e=>setNewForm(p=>({...p,date_fin_recurrence:e.target.value}))} min={newForm.date} style={iSx} onFocus={fIn} onBlur={fOut}/>
                                    </FL>
                                )}

                                <div style={{ marginTop:12, borderRadius:10, background:'#fafaf9', padding:'10px 12px', display:'flex', gap:8, alignItems:'flex-start' }}>
                                    <span style={{ fontSize:14, flexShrink:0 }}>ℹ️</span>
                                    <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{recurrenceSummary}</p>
                                </div>
                            </div>

                            {/* Horaires */}
                            <div style={{ borderRadius:16, border:'1.5px solid #f0f0ee', padding:'14px 16px' }}>
                                <p style={{ fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:12 }}>🕐 Horaires</p>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                                    <FL label="Date de début *"><input type="date" value={newForm.date} onChange={e=>setNewForm(p=>({...p,date:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                                    <FL label="1ère tournée *"><input type="time" value={newForm.heure_debut_prevue} onChange={e=>setNewForm(p=>({...p,heure_debut_prevue:e.target.value}))} required style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                                    <FL label="Fin prévue"><input type="time" value={newForm.heure_fin_prevue} onChange={e=>setNewForm(p=>({...p,heure_fin_prevue:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                                </div>
                                {newForm.frequence_journaliere>=2 && (
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginTop:12 }}>
                                        <FL label="2e tournée"><input type="time" value={newForm.heure_debut_2} onChange={e=>setNewForm(p=>({...p,heure_debut_2:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                                        {newForm.frequence_journaliere>=3 && <FL label="3e tournée"><input type="time" value={newForm.heure_debut_3} onChange={e=>setNewForm(p=>({...p,heure_debut_3:e.target.value}))} style={iSx} onFocus={fIn} onBlur={fOut}/></FL>}
                                    </div>
                                )}
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <FL label="Véhicule (HAD)"><input type="text" value={newForm.vehicule} onChange={e=>setNewForm(p=>({...p,vehicule:e.target.value}))} placeholder="ex : AA 123 CM" style={iSx} onFocus={fIn} onBlur={fOut}/></FL>
                                <FL label="Type de tournée">
                                    <select value={newForm.type} onChange={e=>setNewForm(p=>({...p,type:e.target.value as TypeTournee}))} style={iSx} onFocus={fIn} onBlur={fOut}>
                                        <option value="complete">Visite complète</option>
                                        <option value="cas_critiques">Cas critiques</option>
                                        <option value="chambre_specifique">Chambre spécifique</option>
                                    </select>
                                </FL>
                            </div>

                            <FL label="Notes">
                                <textarea value={newForm.notes} onChange={e=>setNewForm(p=>({...p,notes:e.target.value}))} rows={2} placeholder="Instructions particulières, patients prioritaires…"
                                    style={{ ...iSx, height:'auto', padding:'8px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                            </FL>

                            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                                <button type="button" onClick={()=>setShowNew(false)} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                                <button type="submit" style={{ height:36, padding:'0 18px', borderRadius:9, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                                    ✓ Planifier
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════ MODAL DÉROULEMENT TOURNÉE */}
            {selTournee && (
                <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(10,10,8,0.7)', padding:16 }}>
                    <div style={{ width:'100%', maxWidth:960, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.25)', maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>

                        {/* Header modal tournée */}
                        <div style={{ padding:'16px 22px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                            <div>
                                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                                    <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18' }}>Tournée — {selTournee.service.nom}</h2>
                                    <Badge label={STATUT_CFG[selTournee.statut].label} cfg={STATUT_CFG[selTournee.statut]}/>
                                </div>
                                <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>
                                    {selTournee.soignant.name} · {selTournee.date} à {selTournee.heure_debut_prevue}
                                    {selTournee.vehicule && ` · 🚗 ${selTournee.vehicule}`}
                                </p>
                            </div>
                            <button onClick={()=>{ setSelTournee(null); setSelVisite(null); }} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <div style={{ display:'flex', minHeight:0, flex:1 }}>
                            {/* Colonne patients */}
                            <div style={{ width:280, flexShrink:0, overflowY:'auto', borderRight:'1px solid #f0f0ee' }}>
                                <div style={{ position:'sticky', top:0, zIndex:10, borderBottom:'1px solid #f0f0ee', background:'#fff', padding:'12px 16px' }}>
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                        <span style={{ fontSize:13, fontWeight:700, color:'#1a1a18' }}>Patients ({selTournee.patients_vus}/{selTournee.patients_total})</span>
                                        <div style={{ width:80, height:5, borderRadius:100, background:'#f0f0ee', overflow:'hidden' }}>
                                            <div style={{ height:'100%', width:`${selTournee.patients_total>0?(selTournee.patients_vus/selTournee.patients_total)*100:0}%`, background:'#f53003', borderRadius:100, transition:'width 0.5s' }}/>
                                        </div>
                                    </div>
                                </div>
                                {[...selTournee.visite_hads].sort((a,b)=>a.ordre-b.ordre).map(v=>(
                                    <button key={v.id} onClick={()=>ouvrirVisite(v)}
                                        style={{ width:'100%', borderBottom:'1px solid #f5f5f3', padding:'12px 16px', textAlign:'left', background:selVisite?.id===v.id?'#fafaf9':'transparent', border:'none', cursor:'pointer', transition:'background 0.15s' }}
                                        onMouseEnter={e=>{ if(selVisite?.id!==v.id)(e.currentTarget as HTMLElement).style.background='#fafaf9'; }}
                                        onMouseLeave={e=>{ if(selVisite?.id!==v.id)(e.currentTarget as HTMLElement).style.background='transparent'; }}>
                                        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                                            <div style={{ width:36, height:36, borderRadius:10, background:v.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                                {v.patient.prenom[0]}{v.patient.nom[0]}
                                            </div>
                                            <div style={{ flex:1, minWidth:0 }}>
                                                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                                                    <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{v.patient.prenom} {v.patient.nom}</p>
                                                    {v.visite_at && <span style={{ fontSize:14 }}>✅</span>}
                                                </div>
                                                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>Ch.{v.chambre} – Lit {v.lit}</p>
                                                <Badge label={PRIO_LABEL[v.priorite]} cfg={PRIO_CFG[v.priorite]}/>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Détail visite */}
                            <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>
                                {selVisite ? (
                                    <>
                                        {/* Patient header */}
                                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
                                            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                                                <div style={{ width:56, height:56, borderRadius:16, background:selVisite.patient.sexe==='M'?'linear-gradient(135deg,#3b82f6,#2563eb)':'linear-gradient(135deg,#ec4899,#db2777)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
                                                    {selVisite.patient.prenom[0]}{selVisite.patient.nom[0]}
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize:18, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>{selVisite.patient.prenom} {selVisite.patient.nom}</h3>
                                                    <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:3 }}>{selVisite.patient.age} ans · {selVisite.patient.sexe==='M'?'Homme':'Femme'} · Chambre {selVisite.chambre} – Lit {selVisite.lit} · J{selVisite.jours_hospitalisation}</p>
                                                </div>
                                            </div>
                                            <Badge label={PRIO_LABEL[selVisite.priorite]} cfg={PRIO_CFG[selVisite.priorite]}/>
                                        </div>

                                        {/* Diagnostic */}
                                        <div style={{ borderRadius:12, background:'#fafaf9', padding:'12px 14px', marginBottom:18 }}>
                                            <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:5 }}>Diagnostic</p>
                                            <p style={{ fontSize:15, fontWeight:700, color:'#1a1a18' }}>{selVisite.diagnostic}</p>
                                        </div>

                                        {/* Constantes vitales */}
                                        <div style={{ marginBottom:18 }}>
                                            <p style={{ fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:10 }}>Constantes vitales</p>
                                            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                                                {[
                                                    { label:'Température', field:'temperature' as const, icon:'🌡️', color:'#ef4444', ph:'36.5' },
                                                    { label:'Tension',     field:'tension'     as const, icon:'❤️', color:'#ec4899', ph:'120/80' },
                                                    { label:'Pouls',       field:'pouls'       as const, icon:'💓', color:'#f97316', ph:'72' },
                                                    { label:'SpO2',        field:'saturation'  as const, icon:'💨', color:'#3b82f6', ph:'98%' },
                                                ].map(({label,field,icon,color,ph})=>(
                                                    <div key={field} style={{ borderRadius:12, border:'1.5px solid #f0f0ee', padding:'12px 14px' }}>
                                                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
                                                            <span style={{ fontSize:14 }}>{icon}</span>
                                                            <span style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{label}</span>
                                                        </div>
                                                        <input type="text" value={obsForm[field]} onChange={e=>setObsForm(p=>({...p,[field]:e.target.value}))} placeholder={ph}
                                                            style={{ width:'100%', border:'none', background:'transparent', fontSize:18, fontWeight:800, color, outline:'none', fontFamily:'system-ui,sans-serif' }}/>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dernière observation */}
                                        {selVisite.observations && (
                                            <div style={{ marginBottom:16, borderRadius:12, background:'#fafaf9', border:'1px solid #f0f0ee', padding:'12px 14px' }}>
                                                <p style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>Dernière observation</p>
                                                <p style={{ fontSize:13, color:'#1a1a18', lineHeight:1.6 }}>{selVisite.observations}</p>
                                                {selVisite.visite_at && <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:6 }}>{selVisite.visite_at}</p>}
                                            </div>
                                        )}

                                        {/* Saisie observations */}
                                        <div style={{ marginBottom:18 }}>
                                            <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:8 }}>Observations de cette visite</label>
                                            <textarea value={obsForm.observations} onChange={e=>setObsForm(p=>({...p,observations:e.target.value}))} rows={4} placeholder="Saisissez vos observations…"
                                                style={{ ...iSx, height:'auto', padding:'10px 12px', resize:'vertical' }} onFocus={fIn} onBlur={fOut}/>
                                        </div>

                                        {/* Boutons action */}
                                        <div style={{ display:'flex', gap:8 }}>
                                            {[
                                                { href:`/prescription?patient_id=${selVisite.patient_id}`, label:'💊 Prescrire', color:'#059669', bg:'#f0fdf4', border:'#bbf7d0' },
                                                { href:`/laboratoire?patient_id=${selVisite.patient_id}`,  label:'🧪 Labo',      color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd' },
                                                { href:`/imagerie?patient_id=${selVisite.patient_id}`,     label:'🩻 Imagerie',  color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
                                            ].map(btn=>(
                                                <Link key={btn.href} href={btn.href}
                                                    style={{ height:34, padding:'0 12px', borderRadius:9, border:`1.5px solid ${btn.border}`, background:btn.bg, fontSize:12, fontWeight:700, color:btn.color, textDecoration:'none', display:'flex', alignItems:'center', fontFamily:'system-ui,sans-serif' }}>
                                                    {btn.label}
                                                </Link>
                                            ))}
                                            <button onClick={validerVisite} disabled={!!selVisite.visite_at}
                                                style={{ flex:1, height:36, borderRadius:9, background:selVisite.visite_at?'#f5f5f3':'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:selVisite.visite_at?'#9ca3af':'#fff', fontSize:13, fontWeight:700, cursor:selVisite.visite_at?'not-allowed':'pointer', fontFamily:'system-ui,sans-serif', boxShadow:selVisite.visite_at?'none':'0 4px 14px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                                                {selVisite.visite_at ? '✅ Visite validée' : '✓ Valider la visite'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#c0c0bc', fontSize:14, fontFamily:'system-ui,sans-serif' }}>
                                        Sélectionnez un patient pour voir ses détails
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer modal tournée */}
                        <div style={{ padding:'12px 22px', borderTop:'1px solid #f0f0ee', background:'#fafaf9', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                            <p style={{ fontSize:13, color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>Progression : <strong style={{ color:'#1a1a18' }}>{selTournee.patients_vus}/{selTournee.patients_total}</strong> patients</p>
                            <div style={{ display:'flex', gap:10 }}>
                                {selTournee.statut==='en_cours' && (
                                    <button onClick={suspendre} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Suspendre</button>
                                )}
                                {selTournee.statut!=='terminee' && selTournee.statut!=='annulee' && (
                                    <button onClick={terminer}
                                        style={{ height:36, padding:'0 16px', borderRadius:9, background:'linear-gradient(135deg,#059669,#16a34a)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(22,163,74,0.25)', display:'flex', alignItems:'center', gap:7 }}>
                                        ✓ Terminer la tournée
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}