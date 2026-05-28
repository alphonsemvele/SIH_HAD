import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RapportHistorique {
    id: number;
    titre: string;
    type: string;
    format: 'pdf'|'xlsx'|'csv';
    taille: string;
    genere_le: string;
    genere_par: string;
    statut: 'disponible'|'generation'|'erreur';
    url: string|null;
}

interface Props {
    historique?: RapportHistorique[];
    stats?: { total_generes: number; ce_mois: number; telecharges: number; en_cours: number };
    services?: { id: number; nom: string }[];
}

// ─── Config rapports disponibles ─────────────────────────────────────────────

interface RapportDef {
    id: string;
    titre: string;
    description: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
    formats: ('pdf'|'xlsx'|'csv')[];
    champs: ChampFiltre[];
}

interface ChampFiltre {
    key: string;
    label: string;
    type: 'date'|'date_range'|'select'|'checkbox';
    options?: string[];
}

const RAPPORTS: RapportDef[] = [
    {
        id:'patients',
        titre:'Rapport Patients',
        description:"Liste des patients hospitalisés, statistiques d'admission et de sortie.",
        icon:'👥', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe',
        formats:['pdf','xlsx','csv'],
        champs:[
            { key:'periode', label:'Période', type:'date_range' },
            { key:'statut',  label:'Statut',  type:'select', options:['Tous','Hospitalisé','Sorti','En attente'] },
        ],
    },
    {
        id:'dossiers',
        titre:'Rapport Dossiers médicaux',
        description:'Synthèse des dossiers médicaux par service et par période.',
        icon:'📋', color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe',
        formats:['pdf','xlsx'],
        champs:[
            { key:'periode',    label:'Période',  type:'date_range' },
            { key:'service_id', label:'Service',  type:'select', options:[] },
        ],
    },
    {
        id:'pharmacie',
        titre:'Rapport Pharmacie',
        description:'Consommation des médicaments, stocks, prescriptions et anomalies.',
        icon:'💊', color:'#059669', bg:'#f0fdf4', border:'#bbf7d0',
        formats:['pdf','xlsx','csv'],
        champs:[
            { key:'periode', label:'Période',  type:'date_range' },
            { key:'type',    label:'Type',     type:'select', options:['Tous','Prescriptions','Stock','Anomalies'] },
        ],
    },
    {
        id:'laboratoire',
        titre:'Rapport Laboratoire',
        description:'Analyses biologiques réalisées, résultats et délais de traitement.',
        icon:'🧪', color:'#0d9488', bg:'#f0fdfa', border:'#99f6e4',
        formats:['pdf','xlsx','csv'],
        champs:[
            { key:'periode',   label:'Période',    type:'date_range' },
            { key:'categorie', label:'Catégorie',  type:'select', options:['Toutes','Hématologie','Biochimie','Microbiologie','Immunologie'] },
            { key:'urgents',   label:'Urgents seulement', type:'checkbox' },
        ],
    },
    {
        id:'imagerie',
        titre:'Rapport Imagerie',
        description:"Examens radiologiques, modalités utilisées, taux d'occupation.",
        icon:'🩻', color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd',
        formats:['pdf','xlsx'],
        champs:[
            { key:'periode',  label:'Période',   type:'date_range' },
            { key:'modalite', label:'Modalité',  type:'select', options:['Toutes','Radiographie','Scanner','IRM','Échographie','Mammographie'] },
        ],
    },
    {
        id:'had',
        titre:'Rapport HAD — Tournées',
        description:'Activité des tournées, patients visités, kilométrage et constantes.',
        icon:'🚑', color:'#f97316', bg:'#fff7ed', border:'#fed7aa',
        formats:['pdf','xlsx'],
        champs:[
            { key:'periode',    label:'Période',  type:'date_range' },
            { key:'service_id', label:'Service',  type:'select', options:[] },
        ],
    },
    {
        id:'personnel',
        titre:'Rapport Personnel',
        description:'Effectifs par fonction et service, présences, congés et missions.',
        icon:'👨‍⚕️', color:'#db2777', bg:'#fdf2f8', border:'#fbcfe8',
        formats:['pdf','xlsx','csv'],
        champs:[
            { key:'periode',  label:'Période',  type:'date_range' },
            { key:'fonction', label:'Fonction', type:'select', options:['Toutes','Médecin','Infirmière','Pharmacien(ne)','Technicien(ne)','Administratif'] },
        ],
    },
    {
        id:'activite',
        titre:'Rapport d\'activité global',
        description:'Synthèse complète de l\'activité de l\'établissement sur la période.',
        icon:'📊', color:'#f53003', bg:'#fff5f5', border:'#fecaca',
        formats:['pdf','xlsx'],
        champs:[
            { key:'periode', label:'Période', type:'date_range' },
        ],
    },
];

const FORMAT_CFG = {
    pdf:  { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'PDF',  icon:'📄' },
    xlsx: { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', label:'Excel','icon':'📊' },
    csv:  { color:'#0284c7', bg:'#f0f9ff', border:'#bae6fd', label:'CSV',  icon:'📑' },
};

const iSx: React.CSSProperties = { width:'100%', height:36, padding:'0 10px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:12, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const fIn  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const fOut = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

// ─── Modal génération ─────────────────────────────────────────────────────────

function GenModal({ rapport, services, onClose }: { rapport: RapportDef; services: { id: number; nom: string }[]; onClose:()=>void }) {
    const [format,    setFormat]    = useState<'pdf'|'xlsx'|'csv'>(rapport.formats[0]);
    const [fields,    setFields]    = useState<Record<string,string>>({ periode_debut: '', periode_fin: '', ...Object.fromEntries(rapport.champs.map(c=>[c.key,''])) });
    const [loading,   setLoading]   = useState(false);

    const setF = (k: string, v: string) => setFields(p=>({...p,[k]:v}));

    const generate = () => {
        setLoading(true);
        // Construire l'URL de téléchargement
        const params = new URLSearchParams({ ...fields, format, rapport_id: rapport.id });
        window.location.href = `/rapports/telecharger?${params.toString()}`;
        setTimeout(()=>{ setLoading(false); onClose(); }, 1500);
    };

    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:560, borderRadius:24, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', overflow:'hidden', display:'flex', flexDirection:'column' }}>

                {/* Header coloré */}
                <div style={{ padding:'20px 22px 16px', background:`linear-gradient(135deg,${rapport.bg},#fff)`, borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${rapport.color}22,${rapport.bg})`, border:`1.5px solid ${rapport.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                            {rapport.icon}
                        </div>
                        <div>
                            <h2 style={{ fontSize:16, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.3px' }}>{rapport.titre}</h2>
                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{rapport.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:18 }}>

                    {/* Format de téléchargement */}
                    <div>
                        <p style={{ fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:10 }}>Format de téléchargement</p>
                        <div style={{ display:'flex', gap:10 }}>
                            {rapport.formats.map(f=>{
                                const fc = FORMAT_CFG[f];
                                const active = format===f;
                                return (
                                    <button key={f} onClick={()=>setFormat(f)}
                                        style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'12px 0', borderRadius:12, border:`1.5px solid ${active?fc.color:'#f0f0ee'}`, background:active?fc.bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                        <span style={{ fontSize:22 }}>{fc.icon}</span>
                                        <span style={{ fontSize:12, fontWeight:700, color:active?fc.color:'#9ca3af', fontFamily:'system-ui,sans-serif' }}>{fc.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filtres */}
                    <div>
                        <p style={{ fontSize:12, fontWeight:700, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:10 }}>Paramètres du rapport</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                            {rapport.champs.map(champ=>{
                                if (champ.type==='date_range') return (
                                    <div key={champ.key}>
                                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{champ.label}</label>
                                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                                            <div>
                                                <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Du</label>
                                                <input type="date" value={fields.periode_debut} onChange={e=>setF('periode_debut',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}/>
                                            </div>
                                            <div>
                                                <label style={{ display:'block', fontSize:11, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:4 }}>Au</label>
                                                <input type="date" value={fields.periode_fin} onChange={e=>setF('periode_fin',e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}/>
                                            </div>
                                        </div>
                                    </div>
                                );
                                if (champ.type==='select') {
                                    const opts = champ.key==='service_id' ? ['Tous les services',...services.map(s=>s.nom)] : (champ.options ?? []);
                                    return (
                                        <div key={champ.key}>
                                            <label style={{ display:'block', fontSize:11, fontWeight:600, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>{champ.label}</label>
                                            <select value={fields[champ.key]} onChange={e=>setF(champ.key,e.target.value)} style={iSx} onFocus={fIn} onBlur={fOut}>
                                                {opts.map(o=><option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                if (champ.type==='checkbox') return (
                                    <label key={champ.key} onClick={()=>setF(champ.key, fields[champ.key]==='1'?'0':'1')}
                                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:`1.5px solid ${fields[champ.key]==='1'?rapport.color:'#f0f0ee'}`, background:fields[champ.key]==='1'?rapport.bg:'#fafaf9', cursor:'pointer', transition:'all 0.15s' }}>
                                        <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${fields[champ.key]==='1'?rapport.color:'#d1d5db'}`, background:fields[champ.key]==='1'?rapport.color:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            {fields[champ.key]==='1' && <svg style={{width:10,height:10,color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                                        </div>
                                        <span style={{ fontSize:13, fontWeight:600, color:'#1a1a18', fontFamily:'system-ui,sans-serif' }}>{champ.label}</span>
                                    </label>
                                );
                                return null;
                            })}
                        </div>
                    </div>

                    {/* Raccourcis période */}
                    <div>
                        <p style={{ fontSize:11, fontWeight:600, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Raccourcis</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {[
                                { label:"Aujourd'hui",   fn:()=>{ const t=new Date().toISOString().slice(0,10); setFields(p=>({...p,periode_debut:t,periode_fin:t})); }},
                                { label:"Cette semaine", fn:()=>{ const t=new Date(), mon=new Date(t); mon.setDate(t.getDate()-t.getDay()+1); const sun=new Date(mon); sun.setDate(mon.getDate()+6); setFields(p=>({...p,periode_debut:mon.toISOString().slice(0,10),periode_fin:sun.toISOString().slice(0,10)})); }},
                                { label:"Ce mois",       fn:()=>{ const t=new Date(); const d=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}`; const last=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(); setFields(p=>({...p,periode_debut:`${d}-01`,periode_fin:`${d}-${last}`})); }},
                                { label:"Cette année",   fn:()=>{ const y=new Date().getFullYear(); setFields(p=>({...p,periode_debut:`${y}-01-01`,periode_fin:`${y}-12-31`})); }},
                            ].map(({label,fn})=>(
                                <button key={label} onClick={fn}
                                    style={{ height:28, padding:'0 12px', borderRadius:100, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:11, fontWeight:600, color:'#9ca3af', cursor:'pointer', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}
                                    onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.borderColor=rapport.color; (e.currentTarget as HTMLElement).style.color=rapport.color; (e.currentTarget as HTMLElement).style.background=rapport.bg; }}
                                    onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.borderColor='#f0f0ee'; (e.currentTarget as HTMLElement).style.color='#9ca3af'; (e.currentTarget as HTMLElement).style.background='#fafaf9'; }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Boutons */}
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8, borderTop:'1px solid #f0f0ee' }}>
                        <button onClick={onClose} style={{ height:36, padding:'0 16px', borderRadius:9, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
                        <button onClick={generate} disabled={loading}
                            style={{ height:36, padding:'0 20px', borderRadius:9, background:`linear-gradient(135deg,${rapport.color},${rapport.color}cc)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'system-ui,sans-serif', opacity:loading?0.7:1, boxShadow:`0 4px 14px ${rapport.color}40`, display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}>
                            {loading ? (
                                <>
                                    <svg style={{width:14,height:14,animation:'spin 1s linear infinite'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    Génération…
                                </>
                            ) : (
                                <>{FORMAT_CFG[format].icon} Télécharger {FORMAT_CFG[format].label}</>
                            )}
                        </button>
                    </div>
                </div>

                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Rapports({ historique=[], stats, services=[] }: Partial<Props>) {
    const { flash }: any = usePage().props;
    const [selected, setSelected] = useState<RapportDef|null>(null);
    const [activeTab, setActiveTab] = useState<'catalogue'|'historique'>('catalogue');

    const kpi = stats ?? { total_generes:0, ce_mois:0, telecharges:0, en_cours:0 };

    const handleDownload = (r: RapportHistorique) => {
        if (r.url) window.open(r.url, '_blank');
        else window.location.href = `/rapports/${r.id}/retelecharger`;
    };

    return (
        <DashboardLayout title="Rapports" subtitle="Génération et téléchargement des rapports">

            {flash?.success && (
                <div style={{ marginBottom:16, padding:'12px 16px', borderRadius:14, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:13, color:'#16a34a', fontFamily:'system-ui,sans-serif', display:'flex', gap:8, alignItems:'center' }}>✅ {flash.success}</div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Total générés',    value:kpi.total_generes, icon:'📊', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Ce mois',          value:kpi.ce_mois,       icon:'📅', grad:'linear-gradient(135deg,#1e3a8a,#2563eb)', shadow:'rgba(37,99,235,0.35)' },
                    { label:'Téléchargés',       value:kpi.telecharges,   icon:'⬇️', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'En cours',          value:kpi.en_cours,      icon:'⏳', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
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
            <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:22, background:'#f5f5f3', borderRadius:12, padding:4, maxWidth:360 }}>
                {[{k:'catalogue',l:'Catalogue de rapports'},{k:'historique',l:'Historique'}].map(({k,l})=>(
                    <button key={k} onClick={()=>setActiveTab(k as any)}
                        style={{ flex:1, height:34, borderRadius:9, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'system-ui,sans-serif', transition:'all 0.15s', background:activeTab===k?'#fff':'transparent', color:activeTab===k?'#1a1a18':'#9ca3af', boxShadow:activeTab===k?'0 1px 4px rgba(0,0,0,0.08)':'none', whiteSpace:'nowrap' }}>
                        {l}
                    </button>
                ))}
            </div>

            {/* ══════════════════════════════════════ CATALOGUE */}
            {activeTab==='catalogue' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                    {RAPPORTS.map(r=>(
                        <div key={r.id}
                            style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'transform 0.2s,box-shadow 0.2s' }}
                            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow=`0 12px 30px ${r.color}18`; }}
                            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.04)'; }}>

                            <div style={{ height:3, background:`linear-gradient(90deg,${r.color},${r.color}88)` }}/>
                            <div style={{ padding:'16px 18px' }}>
                                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                        <div style={{ width:46, height:46, borderRadius:14, background:r.bg, border:`1.5px solid ${r.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                                            {r.icon}
                                        </div>
                                        <div>
                                            <p style={{ fontSize:14, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.2px' }}>{r.titre}</p>
                                            <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2, lineHeight:1.5 }}>{r.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Formats disponibles */}
                                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14 }}>
                                    <span style={{ fontSize:10, fontWeight:600, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:'system-ui,sans-serif' }}>Formats :</span>
                                    {r.formats.map(f=>{
                                        const fc = FORMAT_CFG[f];
                                        return (
                                            <span key={f} style={{ fontSize:11, fontWeight:700, color:fc.color, background:fc.bg, border:`1px solid ${fc.border}`, borderRadius:100, padding:'2px 8px', fontFamily:'system-ui,sans-serif' }}>
                                                {fc.icon} {fc.label}
                                            </span>
                                        );
                                    })}
                                </div>

                                {/* Bouton générer */}
                                <button onClick={()=>setSelected(r)}
                                    style={{ width:'100%', height:38, borderRadius:11, background:`linear-gradient(135deg,${r.color},${r.color}bb)`, border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:`0 4px 14px ${r.color}30`, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.15s' }}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity='0.9'}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity='1'}>
                                    <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    Générer &amp; télécharger
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══════════════════════════════════════ HISTORIQUE */}
            {activeTab==='historique' && (
                <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                    <div style={{ height:3, background:'linear-gradient(90deg,#f53003,#3b82f6,#10b981)' }}/>
                    {historique.length===0 ? (
                        <div style={{ padding:'60px 40px', textAlign:'center', fontFamily:'system-ui,sans-serif' }}>
                            <div style={{ fontSize:44, marginBottom:12 }}>📊</div>
                            <p style={{ fontSize:15, fontWeight:700, color:'#1a1a18', marginBottom:6 }}>Aucun rapport généré</p>
                            <p style={{ fontSize:13, color:'#9ca3af', marginBottom:20 }}>Les rapports téléchargés apparaîtront ici.</p>
                            <button onClick={()=>setActiveTab('catalogue')}
                                style={{ height:38, padding:'0 20px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(245,48,3,0.25)', fontFamily:'system-ui,sans-serif' }}>
                                Générer un rapport
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX:'auto' }}>
                            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'system-ui,sans-serif' }}>
                                <thead>
                                    <tr style={{ borderBottom:'1px solid #f5f5f3' }}>
                                        {['Rapport','Format','Taille','Généré le','Par','Statut','Action'].map((h,i)=>(
                                            <th key={i} style={{ padding:'12px 14px', textAlign:i===6?'right':'left', fontSize:11, fontWeight:700, color:'#c0c0bc', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {historique.map((r,i)=>{
                                        const fc = FORMAT_CFG[r.format] ?? FORMAT_CFG.pdf;
                                        const statCfg = r.statut==='disponible' ? { color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', label:'Disponible' }
                                                      : r.statut==='generation'  ? { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'En cours…' }
                                                      :                            { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'Erreur' };
                                        return (
                                            <tr key={r.id}
                                                style={{ borderBottom:i<historique.length-1?'1px solid #f5f5f3':'none', transition:'background 0.15s' }}
                                                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#fafaf9'}
                                                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                                                <td style={{ padding:'12px 14px' }}>
                                                    <p style={{ fontSize:13, fontWeight:600, color:'#1a1a18' }}>{r.titre}</p>
                                                    <p style={{ fontSize:11, color:'#9ca3af', marginTop:1 }}>{r.type}</p>
                                                </td>
                                                <td style={{ padding:'12px 14px' }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:fc.color, background:fc.bg, border:`1px solid ${fc.border}`, borderRadius:100, padding:'3px 9px' }}>{fc.icon} {fc.label}</span>
                                                </td>
                                                <td style={{ padding:'12px 14px', fontSize:12, color:'#9ca3af' }}>{r.taille}</td>
                                                <td style={{ padding:'12px 14px', fontSize:12, color:'#374151', whiteSpace:'nowrap' }}>{r.genere_le}</td>
                                                <td style={{ padding:'12px 14px', fontSize:12, color:'#374151' }}>{r.genere_par}</td>
                                                <td style={{ padding:'12px 14px' }}>
                                                    <span style={{ fontSize:11, fontWeight:700, color:statCfg.color, background:statCfg.bg, border:`1px solid ${statCfg.border}`, borderRadius:100, padding:'3px 10px' }}>{statCfg.label}</span>
                                                </td>
                                                <td style={{ padding:'12px 14px' }}>
                                                    <div style={{ display:'flex', justifyContent:'flex-end', gap:4 }}>
                                                        {r.statut==='disponible' && (
                                                            <button onClick={()=>handleDownload(r)} title="Télécharger"
                                                                style={{ height:30, padding:'0 12px', borderRadius:8, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 2px 8px rgba(245,48,3,0.25)', display:'flex', alignItems:'center', gap:5 }}>
                                                                <svg style={{width:12,height:12}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                                                Télécharger
                                                            </button>
                                                        )}
                                                        <button onClick={()=>{ if(confirm('Supprimer ce rapport ?')) router.delete(`/rapports/${r.id}`); }} title="Supprimer"
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
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════ MODAL GÉNÉRATION */}
            {selected && <GenModal rapport={selected} services={services} onClose={()=>setSelected(null)}/>}
        </DashboardLayout>
    );
}