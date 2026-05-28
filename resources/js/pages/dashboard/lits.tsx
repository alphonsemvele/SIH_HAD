import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Occupation { id: number; patient: string | null; diagnostic: string | null; date_entree: string | null; }
interface Lit { id: number; numero: string; chambre: string | null; type: string; statut: 'disponible'|'occupe'|'nettoyage'|'horsservice'; occupation: Occupation | null; }
interface Service { id: number; nom: string; etage: string; capacite: number; occupes: number; disponibles: number; enNettoyage: number; horsService: number; lits: Lit[]; }
interface Props { services: Service[]; }

// ─── Statut config ────────────────────────────────────────────────────────────

const SC = {
    disponible:  { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', label: 'Disponible',   grad: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' },
    occupe:      { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444', label: 'Occupé',       grad: 'linear-gradient(135deg,#fef2f2,#fee2e2)' },
    nettoyage:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b', label: 'Nettoyage',    grad: 'linear-gradient(135deg,#fffbeb,#fef3c7)' },
    horsservice: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af', label: 'Hors service', grad: 'linear-gradient(135deg,#f9fafb,#f3f4f6)' },
} as const;

type Statut = keyof typeof SC;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function recalc(s: Service): Service {
    return { ...s, capacite: s.lits.length, occupes: s.lits.filter(l=>l.statut==='occupe').length, disponibles: s.lits.filter(l=>l.statut==='disponible').length, enNettoyage: s.lits.filter(l=>l.statut==='nettoyage').length, horsService: s.lits.filter(l=>l.statut==='horsservice').length };
}
function changeStatut(services: Service[], svcId: number, litId: number, st: Statut, clearOcc = false): Service[] {
    return services.map(s => { if (s.id !== svcId) return s; const lits = s.lits.map(l => l.id !== litId ? l : { ...l, statut: st, occupation: clearOcc ? null : l.occupation }); return recalc({ ...s, lits }); });
}
function moveLit(services: Service[], srcId: number, litId: number, dstId: number): Service[] {
    let ref: Lit | null = null;
    const after = services.map(s => { if (s.id !== srcId) return s; const lits = s.lits.filter(l => { if (l.id===litId){ref=l;return false;} return true; }); return recalc({...s,lits}); });
    if (!ref) return services;
    return after.map(s => { if (s.id !== dstId) return s; return recalc({...s,lits:[...s.lits,{...ref!,statut:'disponible',occupation:null}]}); });
}

// ─── Inputs inline helpers ────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = { width:'100%', height:38, padding:'0 12px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, outline:'none', fontFamily:'system-ui,sans-serif', boxSizing:'border-box' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => { e.currentTarget.style.borderColor='#f53003'; e.currentTarget.style.background='#fff'; };
const focusOut = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => { e.currentTarget.style.borderColor='#f0f0ee'; e.currentTarget.style.background='#fafaf9'; };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LitsIndex({ services: init }: Props) {
    const { flash } = usePage<{ flash?: { success?:string; error?:string } }>().props;
    const [services,          setServices]          = useState(init);
    const [toast,             setToast]             = useState<{ok:boolean;msg:string}|null>(null);
    const [showAddService,    setShowAddService]    = useState(false);
    const [showAddLit,        setShowAddLit]        = useState<number|null>(null);
    const [showNettoyage,     setShowNettoyage]     = useState<{serviceId:number;lit:Lit}|null>(null);
    const [showDisponible,    setShowDisponible]    = useState<{serviceId:number;lit:Lit}|null>(null);
    const [showHorsService,   setShowHorsService]   = useState<{serviceId:number;lit:Lit}|null>(null);
    const [showTransferer,    setShowTransferer]    = useState<{serviceId:number;lit:Lit}|null>(null);
    const [showOccupation,    setShowOccupation]    = useState<{serviceId:number;lit:Lit}|null>(null);
    const [newService,        setNewService]        = useState({ nom:'', etage:'', code:'', description:'' });
    const [newLit,            setNewLit]            = useState({ numero:'', chambre:'', type:'standard', statut:'disponible', tarif_journalier:'' });
    const [transferSvcId,     setTransferSvcId]     = useState<number|''>('');
    const [horsRaison,        setHorsRaison]        = useState('');
    const [loading,           setLoading]           = useState(false);

    useEffect(() => { setServices(init); }, [init]);

    const toast$ = (ok:boolean, msg:string) => { setToast({ok,msg}); setTimeout(()=>setToast(null),3500); };

    const totalCap   = services.reduce((a,s)=>a+s.capacite,0);
    const totalOcc   = services.reduce((a,s)=>a+s.occupes,0);
    const totalDispo = services.reduce((a,s)=>a+s.disponibles,0);
    const totalNett  = services.reduce((a,s)=>a+s.enNettoyage,0);
    const taux       = totalCap > 0 ? Math.round((totalOcc/totalCap)*100) : 0;

    // ── Soumissions ─────────────────────────────────────────────────────

    const submitService = (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        router.post('/lits/services', newService, { preserveScroll:true, onSuccess: page => { const fresh=(page.props as any).services as Service[]; const last=fresh.at(-1); if(last) setServices(p=>[...p,last]); setShowAddService(false); setNewService({nom:'',etage:'',code:'',description:''}); toast$(true,`Service «${newService.nom}» créé.`); }, onError:()=>toast$(false,'Erreur lors de la création.'), onFinish:()=>setLoading(false) });
    };
    const submitLit = (e: React.FormEvent) => {
        e.preventDefault(); if(!showAddLit) return; const sid=showAddLit; setLoading(true);
        router.post('/lits', {...newLit, service_id:sid}, { preserveScroll:true, onSuccess: page => { const fresh=(page.props as any).services as Service[]; const sf=fresh.find(s=>s.id===sid); if(sf) setServices(p=>p.map(s=>s.id===sid?sf:s)); setShowAddLit(null); setNewLit({numero:'',chambre:'',type:'standard',statut:'disponible',tarif_journalier:''}); toast$(true,`Lit «${newLit.numero}» ajouté.`); }, onError:()=>toast$(false,'Numéro déjà utilisé ou données invalides.'), onFinish:()=>setLoading(false) });
    };
    const submitNettoyage = () => {
        if(!showNettoyage) return; const {serviceId,lit}=showNettoyage; const snap=services;
        setServices(p=>changeStatut(p,serviceId,lit.id,'nettoyage',true)); setShowNettoyage(null); toast$(true,`Lit ${lit.numero} → nettoyage.`);
        router.post(`/lits/${lit.id}/nettoyage`,{},{preserveScroll:true,onError:()=>{setServices(snap);toast$(false,'Erreur. Annulé.');}});
    };
    const submitDisponible = () => {
        if(!showDisponible) return; const {serviceId,lit}=showDisponible; const snap=services;
        setServices(p=>changeStatut(p,serviceId,lit.id,'disponible')); setShowDisponible(null); toast$(true,`Lit ${lit.numero} → disponible.`);
        router.post(`/lits/${lit.id}/disponible`,{},{preserveScroll:true,onError:()=>{setServices(snap);toast$(false,'Erreur. Annulé.');}});
    };
    const submitHorsService = () => {
        if(!showHorsService) return; const {serviceId,lit}=showHorsService; const snap=services; const r=horsRaison;
        setServices(p=>changeStatut(p,serviceId,lit.id,'horsservice')); setShowHorsService(null); setHorsRaison(''); toast$(true,`Lit ${lit.numero} → hors service.`);
        router.post(`/lits/${lit.id}/hors-service`,{raison:r},{preserveScroll:true,onError:()=>{setServices(snap);toast$(false,'Erreur. Annulé.');}});
    };
    const submitTransferer = (e: React.FormEvent) => {
        e.preventDefault(); if(!showTransferer||transferSvcId==='') return; const {serviceId,lit}=showTransferer; const dstId=transferSvcId as number; const dstNom=services.find(s=>s.id===dstId)?.nom??'service'; const snap=services;
        setServices(p=>moveLit(p,serviceId,lit.id,dstId)); setShowTransferer(null); setTransferSvcId(''); toast$(true,`Lit ${lit.numero} → ${dstNom}.`);
        router.post(`/lits/${lit.id}/transferer`,{service_destination_id:dstId},{preserveScroll:true,onError:()=>{setServices(snap);toast$(false,'Erreur. Transfert annulé.');}});
    };

    return (
        <DashboardLayout title="Lits & Occupation" subtitle="Gestion des lits et taux d'occupation par service">

            {/* Toast */}
            {(toast||flash?.success||flash?.error) && (
                <div style={{ marginBottom:16, display:'flex', alignItems:'center', gap:10, borderRadius:14, padding:'12px 16px', fontSize:13, fontFamily:'system-ui,sans-serif', background: (!toast?.ok||flash?.error) ? '#fef2f2' : '#f0fdf4', border: `1px solid ${(!toast?.ok||flash?.error)?'#fecaca':'#bbf7d0'}`, color: (!toast?.ok||flash?.error)?'#dc2626':'#16a34a' }}>
                    <span style={{ fontSize:16 }}>{(!toast?.ok||flash?.error)?'⚠️':'✅'}</span>
                    {toast?.msg ?? flash?.success ?? flash?.error}
                </div>
            )}

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
                {[
                    { label:'Capacité totale', value:`${totalCap} lits`, icon:'🏥', grad:'linear-gradient(135deg,#1a1a18,#2d2d2a)', shadow:'rgba(0,0,0,0.25)' },
                    { label:'Occupés',         value:totalOcc,           icon:'🛏️', grad:'linear-gradient(135deg,#991b1b,#ef4444)', shadow:'rgba(239,68,68,0.35)' },
                    { label:'Disponibles',     value:totalDispo,         icon:'✅', grad:'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(16,185,129,0.35)' },
                    { label:'En nettoyage',    value:totalNett,          icon:'🧹', grad:'linear-gradient(135deg,#b45309,#f59e0b)', shadow:'rgba(245,158,11,0.35)' },
                    { label:'Taux occupation', value:`${taux}%`,         icon:'📊', grad: taux>=90?'linear-gradient(135deg,#991b1b,#ef4444)':taux>=70?'linear-gradient(135deg,#b45309,#f59e0b)':'linear-gradient(135deg,#065f46,#10b981)', shadow:'rgba(59,130,246,0.3)' },
                ].map((k,i)=>(
                    <div key={i} style={{ borderRadius:18, padding:'20px', background:k.grad, color:'#fff', position:'relative', overflow:'hidden', boxShadow:`0 8px 24px ${k.shadow}` }}>
                        <div style={{ position:'absolute', top:-14, right:-14, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize:22, marginBottom:8 }}>{k.icon}</div>
                        <div style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.5px', lineHeight:1 }}>{k.value}</div>
                        <div style={{ fontSize:11, fontWeight:500, opacity:0.8, marginTop:4, fontFamily:'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Légende + Actions */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, marginBottom:20, flexWrap:'wrap' }}>
                {/* Légende */}
                <div style={{ display:'flex', alignItems:'center', gap:16, background:'#fff', border:'1px solid #eee', borderRadius:14, padding:'10px 18px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#9ca3af', fontFamily:'system-ui,sans-serif', textTransform:'uppercase', letterSpacing:'0.05em' }}>Légende</span>
                    {Object.entries(SC).map(([k,cfg])=>(
                        <div key={k} style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:10, height:10, borderRadius:3, background:cfg.dot }}/>
                            <span style={{ fontSize:12, color:'#374151', fontFamily:'system-ui,sans-serif' }}>{cfg.label}</span>
                        </div>
                    ))}
                </div>
                {/* Actions */}
                <div style={{ display:'flex', gap:8 }}>
                    <button onClick={()=>setShowAddService(true)}
                        style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:'linear-gradient(135deg,#f53003,#e02a00)', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif', boxShadow:'0 4px 14px rgba(245,48,3,0.3)' }}>
                        <svg style={{width:14,height:14}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Nouveau service
                    </button>
                    {[{href:'/lits/occupations',icon:'👥',label:'Occupations'},{href:'/lits/historique',icon:'🕐',label:'Historique'}].map(btn=>(
                        <Link key={btn.href} href={btn.href}
                            style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 14px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fafaf9', fontSize:13, fontWeight:600, color:'#374151', textDecoration:'none', fontFamily:'system-ui,sans-serif', transition:'all 0.15s' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#f53003';(e.currentTarget as HTMLElement).style.background='#fff5f5';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#f0f0ee';(e.currentTarget as HTMLElement).style.background='#fafaf9';}}>
                            {btn.icon} {btn.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════ GRILLE SERVICES */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                {services.map(service=>(
                    <ServiceCard key={service.id} service={service}
                        onAddLit={()=>setShowAddLit(service.id)}
                        onNettoyage={lit=>setShowNettoyage({serviceId:service.id,lit})}
                        onDisponible={lit=>setShowDisponible({serviceId:service.id,lit})}
                        onHorsService={lit=>setShowHorsService({serviceId:service.id,lit})}
                        onTransferer={lit=>setShowTransferer({serviceId:service.id,lit})}
                        onVoirOccupation={lit=>setShowOccupation({serviceId:service.id,lit})}/>
                ))}
            </div>

            {/* ══════════════════════════════════════ MODALS */}

            {/* Nouveau service */}
            {showAddService && (
                <MModal title="Nouveau service" subtitle="Ajoutez un nouveau service hospitalier" onClose={()=>setShowAddService(false)}>
                    <form onSubmit={submitService} style={{display:'flex',flexDirection:'column',gap:14}}>
                        <MField label="Nom du service *"><input value={newService.nom} onChange={e=>setNewService(p=>({...p,nom:e.target.value}))} placeholder="ex : Réanimation…" required style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MField label="Code"><input value={newService.code} onChange={e=>setNewService(p=>({...p,code:e.target.value}))} placeholder="ex : CARD, PNEUMO…" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MField label="Étage / Localisation *"><input value={newService.etage} onChange={e=>setNewService(p=>({...p,etage:e.target.value}))} placeholder="ex : 2ème étage…" required style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MField label="Description"><textarea value={newService.description} onChange={e=>setNewService(p=>({...p,description:e.target.value}))} rows={2} placeholder="Description optionnelle…" style={{...inputStyle,height:'auto',padding:'8px 12px',resize:'vertical'}} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MFooter onCancel={()=>setShowAddService(false)} label="Créer le service" loading={loading}/>
                    </form>
                </MModal>
            )}

            {/* Ajouter lit */}
            {showAddLit !== null && (
                <MModal title="Ajouter un lit" subtitle={services.find(s=>s.id===showAddLit)?.nom} onClose={()=>setShowAddLit(null)}>
                    <form onSubmit={submitLit} style={{display:'flex',flexDirection:'column',gap:14}}>
                        <MField label="Numéro du lit *"><input value={newLit.numero} onChange={e=>setNewLit(p=>({...p,numero:e.target.value}))} placeholder="ex : 405A, M12…" required style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MField label="Chambre"><input value={newLit.chambre} onChange={e=>setNewLit(p=>({...p,chambre:e.target.value}))} placeholder="ex : Chambre 4…" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                            <MField label="Type"><select value={newLit.type} onChange={e=>setNewLit(p=>({...p,type:e.target.value}))} style={inputStyle} onFocus={focusIn} onBlur={focusOut}><option value="standard">Standard</option><option value="vip">VIP</option><option value="reanimation">Réanimation</option><option value="isolement">Isolement</option><option value="maternite">Maternité</option></select></MField>
                            <MField label="Statut initial"><select value={newLit.statut} onChange={e=>setNewLit(p=>({...p,statut:e.target.value}))} style={inputStyle} onFocus={focusIn} onBlur={focusOut}><option value="disponible">Disponible</option><option value="nettoyage">En nettoyage</option><option value="horsservice">Hors service</option></select></MField>
                        </div>
                        <MField label="Tarif journalier (FCFA)"><input type="number" value={newLit.tarif_journalier} onChange={e=>setNewLit(p=>({...p,tarif_journalier:e.target.value}))} placeholder="ex : 15000" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MFooter onCancel={()=>setShowAddLit(null)} label="Ajouter le lit" loading={loading}/>
                    </form>
                </MModal>
            )}

            {/* Nettoyage */}
            {showNettoyage && (
                <MModal title="Marquer en nettoyage" onClose={()=>setShowNettoyage(null)} size={400}>
                    <div style={{display:'flex',flexDirection:'column',gap:16}}>
                        <div style={{borderRadius:12,background:'#fffbeb',border:'1px solid #fde68a',padding:'12px 16px',display:'flex',gap:10,alignItems:'flex-start'}}>
                            <span style={{fontSize:18}}>🧹</span>
                            <div style={{fontSize:13,color:'#92400e',fontFamily:'system-ui,sans-serif'}}>
                                Le lit <strong>{showNettoyage.lit.numero}</strong> passera en nettoyage.
                                {showNettoyage.lit.occupation?.patient && <span style={{display:'block',marginTop:4}}>Patient <strong>{showNettoyage.lit.occupation.patient}</strong> sera dissocié.</span>}
                            </div>
                        </div>
                        <MFooter onCancel={()=>setShowNettoyage(null)} onConfirm={submitNettoyage} label="Confirmer" color="#d97706"/>
                    </div>
                </MModal>
            )}

            {/* Disponible */}
            {showDisponible && (
                <MModal title="Marquer comme disponible" onClose={()=>setShowDisponible(null)} size={400}>
                    <div style={{display:'flex',flexDirection:'column',gap:16}}>
                        <div style={{borderRadius:12,background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'12px 16px',display:'flex',gap:10,alignItems:'center'}}>
                            <span style={{fontSize:18}}>✅</span>
                            <span style={{fontSize:13,color:'#15803d',fontFamily:'system-ui,sans-serif'}}>Confirmer que le lit <strong>{showDisponible.lit.numero}</strong> est prêt ?</span>
                        </div>
                        <MFooter onCancel={()=>setShowDisponible(null)} onConfirm={submitDisponible} label="Confirmer" color="#16a34a"/>
                    </div>
                </MModal>
            )}

            {/* Hors service */}
            {showHorsService && (
                <MModal title="Mettre hors service" onClose={()=>setShowHorsService(null)} size={400}>
                    <div style={{display:'flex',flexDirection:'column',gap:14}}>
                        <div style={{borderRadius:12,background:'#f9fafb',border:'1px solid #e5e7eb',padding:'12px 16px',display:'flex',gap:10,alignItems:'center'}}>
                            <span style={{fontSize:18}}>⚠️</span>
                            <span style={{fontSize:13,color:'#374151',fontFamily:'system-ui,sans-serif'}}>Le lit <strong>{showHorsService.lit.numero}</strong> sera mis hors service.</span>
                        </div>
                        <MField label="Raison (optionnelle)"><input value={horsRaison} onChange={e=>setHorsRaison(e.target.value)} placeholder="ex : Maintenance…" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/></MField>
                        <MFooter onCancel={()=>setShowHorsService(null)} onConfirm={submitHorsService} label="Mettre hors service" color="#6b7280"/>
                    </div>
                </MModal>
            )}

            {/* Transférer */}
            {showTransferer && (
                <MModal title="Transférer le lit" subtitle={`Lit ${showTransferer.lit.numero}`} onClose={()=>{setShowTransferer(null);setTransferSvcId('');}}>
                    <form onSubmit={submitTransferer} style={{display:'flex',flexDirection:'column',gap:14}}>
                        <MField label="Service destination">
                            <select value={String(transferSvcId)} onChange={e=>setTransferSvcId(e.target.value?Number(e.target.value):'')} required style={inputStyle} onFocus={focusIn} onBlur={focusOut}>
                                <option value="">Sélectionner un service…</option>
                                {services.filter(s=>s.id!==showTransferer.serviceId).map(s=>(
                                    <option key={s.id} value={s.id}>{s.nom} — {s.etage} ({s.disponibles} libres)</option>
                                ))}
                            </select>
                        </MField>
                        <MFooter onCancel={()=>{setShowTransferer(null);setTransferSvcId('');}} label="Transférer" disabled={transferSvcId===''} color="#2563eb"/>
                    </form>
                </MModal>
            )}

            {/* Occupation */}
            {showOccupation?.lit.occupation && (
                <MModal title="Occupation actuelle" subtitle={`Lit ${showOccupation.lit.numero}`} onClose={()=>setShowOccupation(null)} size={480}>
                    <div style={{display:'flex',flexDirection:'column',gap:16}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                            {[['Patient',showOccupation.lit.occupation.patient??'—'],['Diagnostic',showOccupation.lit.occupation.diagnostic??'—'],['Date d\'entrée',showOccupation.lit.occupation.date_entree??'—']].map(([l,v])=>(
                                <div key={l} style={{background:'#fafaf9',borderRadius:10,padding:'10px 14px'}}>
                                    <div style={{fontSize:11,color:'#9ca3af',fontFamily:'system-ui,sans-serif',marginBottom:4}}>{l}</div>
                                    <div style={{fontSize:13,fontWeight:600,color:'#1a1a18'}}>{v}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{display:'flex',gap:10,paddingTop:12,borderTop:'1px solid #f0f0ee'}}>
                            <Link href={`/lits/occupations/${showOccupation.lit.occupation.id}`}
                                style={{flex:1,display:'block',textAlign:'center',padding:'10px',borderRadius:10,background:'linear-gradient(135deg,#f53003,#e02a00)',color:'#fff',fontSize:13,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 14px rgba(245,48,3,0.25)'}}>
                                Voir le dossier
                            </Link>
                            <button onClick={()=>setShowOccupation(null)}
                                style={{flex:1,height:40,borderRadius:10,border:'1.5px solid #f0f0ee',background:'#fafaf9',fontSize:13,fontWeight:600,color:'#706f6c',cursor:'pointer',fontFamily:'system-ui,sans-serif'}}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </MModal>
            )}

        </DashboardLayout>
    );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

function ServiceCard({ service, onAddLit, onNettoyage, onDisponible, onHorsService, onTransferer, onVoirOccupation }: {
    service: Service; onAddLit:()=>void; onNettoyage:(l:Lit)=>void; onDisponible:(l:Lit)=>void; onHorsService:(l:Lit)=>void; onTransferer:(l:Lit)=>void; onVoirOccupation:(l:Lit)=>void;
}) {
    const taux = service.capacite > 0 ? Math.round((service.occupes/service.capacite)*100) : 0;
    const cap  = Math.max(service.capacite,1);
    const tauxColor = taux>=90?'#ef4444':taux>=70?'#f59e0b':'#10b981';

    return (
        <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #eee', background:'#fff', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            {/* Barre accent colorée */}
            <div style={{ height:3, background: taux>=90?'linear-gradient(90deg,#ef4444,#f87171)':taux>=70?'linear-gradient(90deg,#f59e0b,#fbbf24)':'linear-gradient(90deg,#10b981,#34d399)' }}/>

            {/* Header service */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #f5f5f3' }}>
                <div>
                    <h3 style={{ fontSize:15, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.2px' }}>{service.nom}</h3>
                    <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{service.etage}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:20, fontWeight:800, color:'#1a1a18', letterSpacing:'-0.5px', lineHeight:1 }}>{service.occupes}/{service.capacite}</div>
                        <div style={{ fontSize:11, color:tauxColor, fontFamily:'system-ui,sans-serif', fontWeight:700, marginTop:2 }}>{taux}% occupé</div>
                    </div>
                    <div style={{ width:44, height:44, borderRadius:'50%', background: service.disponibles===0?'#fef2f2':service.disponibles<=2?'#fffbeb':'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color: service.disponibles===0?'#dc2626':service.disponibles<=2?'#d97706':'#16a34a', border:`2px solid ${service.disponibles===0?'#fecaca':service.disponibles<=2?'#fde68a':'#bbf7d0'}` }}>
                        {service.disponibles}
                    </div>
                </div>
            </div>

            {/* Barre progression segmentée */}
            <div style={{ padding:'10px 20px 14px' }}>
                <div style={{ height:8, width:'100%', borderRadius:100, background:'#f5f5f3', overflow:'hidden', display:'flex' }}>
                    <div style={{ width:`${(service.occupes/cap)*100}%`,     background:'#ef4444', transition:'width 0.5s' }}/>
                    <div style={{ width:`${(service.enNettoyage/cap)*100}%`, background:'#f59e0b', transition:'width 0.5s' }}/>
                    <div style={{ width:`${(service.disponibles/cap)*100}%`, background:'#10b981', transition:'width 0.5s' }}/>
                </div>
            </div>

            {/* Grille lits */}
            <div style={{ padding:'0 20px 16px', display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
                {service.lits.map(lit=>(
                    <LitCell key={lit.id} lit={lit}
                        onNettoyage={()=>onNettoyage(lit)} onDisponible={()=>onDisponible(lit)}
                        onHorsService={()=>onHorsService(lit)} onTransferer={()=>onTransferer(lit)}
                        onVoirOccupation={()=>onVoirOccupation(lit)}/>
                ))}
                {/* Bouton ajouter lit */}
                <button onClick={onAddLit}
                    style={{ height:72, borderRadius:12, border:'2px dashed #e5e7eb', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', gap:3, transition:'all 0.15s', fontFamily:'system-ui,sans-serif' }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='#f53003';(e.currentTarget as HTMLElement).style.background='#fff5f5';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='#e5e7eb';(e.currentTarget as HTMLElement).style.background='transparent';}}>
                    <svg style={{width:18,height:18,color:'#c0c0bc'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14"/></svg>
                    <span style={{fontSize:10,color:'#c0c0bc',fontWeight:600}}>Ajouter</span>
                </button>
            </div>

            {/* Footer stats */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', borderTop:'1px solid #f5f5f3' }}>
                <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                    {[
                        {dot:'#ef4444',val:service.occupes,label:'occupés'},
                        {dot:'#10b981',val:service.disponibles,label:'libres'},
                        ...(service.enNettoyage>0?[{dot:'#f59e0b',val:service.enNettoyage,label:'nettoyage'}]:[]),
                        ...(service.horsService>0?[{dot:'#9ca3af',val:service.horsService,label:'hors svc'}]:[]),
                    ].map((s,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
                            <div style={{width:8,height:8,borderRadius:2,background:s.dot}}/>
                            <span style={{fontSize:12,color:'#706f6c',fontFamily:'system-ui,sans-serif'}}>{s.val} {s.label}</span>
                        </div>
                    ))}
                </div>
                <div style={{display:'flex',gap:12}}>
                    <Link href={`/lits/service/${service.id}/chambres`} style={{fontSize:12,color:'#9ca3af',textDecoration:'none',fontFamily:'system-ui,sans-serif'}}>Chambres</Link>
                    <Link href={`/lits/occupations?service_id=${service.id}`} style={{fontSize:12,fontWeight:700,color:'#f53003',textDecoration:'none',fontFamily:'system-ui,sans-serif'}}>Détails →</Link>
                </div>
            </div>
        </div>
    );
}

// ─── LitCell ──────────────────────────────────────────────────────────────────

function LitCell({ lit, onNettoyage, onDisponible, onHorsService, onTransferer, onVoirOccupation }: {
    lit: Lit; onNettoyage:()=>void; onDisponible:()=>void; onHorsService:()=>void; onTransferer:()=>void; onVoirOccupation:()=>void;
}) {
    const [hovered, setHovered] = useState(false);
    const cfg = SC[lit.statut] ?? SC.horsservice;

    return (
        <div style={{ position:'relative', height:72, borderRadius:12, border:`1.5px solid ${cfg.border}`, background: hovered ? 'rgba(0,0,0,0.7)' : cfg.grad, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s', overflow:'hidden' }}
            onMouseEnter={()=>setHovered(true)}
            onMouseLeave={()=>setHovered(false)}>

            {!hovered ? (
                <>
                    <span style={{ fontSize:12, fontWeight:800, color:cfg.color, lineHeight:1 }}>{lit.numero}</span>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:cfg.dot, marginTop:5 }}/>
                    {lit.chambre && <span style={{ fontSize:9, color:cfg.color, opacity:0.65, marginTop:2, fontFamily:'system-ui,sans-serif' }}>{lit.chambre}</span>}
                </>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:3, width:'100%', padding:'4px 6px' }}>
                    {lit.statut==='occupe' && <>
                        <CtxBtn onClick={onVoirOccupation} color="#fff" bg="rgba(255,255,255,0.2)">👁 Patient</CtxBtn>
                        <CtxBtn onClick={onNettoyage}      color="#fff" bg="rgba(245,158,11,0.8)">🧹 Nettoyage</CtxBtn>
                    </>}
                    {lit.statut==='nettoyage' && <CtxBtn onClick={onDisponible} color="#fff" bg="rgba(16,185,129,0.8)">✅ Dispo</CtxBtn>}
                    {lit.statut==='disponible' && <>
                        <Link href={`/lits/occupations/create?lit_id=${lit.id}`} style={{display:'block',textAlign:'center',borderRadius:6,padding:'3px 2px',fontSize:9,fontWeight:700,color:'#fff',background:'rgba(245,48,3,0.85)',textDecoration:'none'}}>+ Admettre</Link>
                        <CtxBtn onClick={onHorsService} color="#fff" bg="rgba(107,114,128,0.8)">⚠ Hors svc</CtxBtn>
                    </>}
                    {lit.statut==='horsservice' && <CtxBtn onClick={onDisponible} color="#fff" bg="rgba(37,99,235,0.8)">🔄 Activer</CtxBtn>}
                    <CtxBtn onClick={onTransferer} color="#fff" bg="rgba(37,99,235,0.7)">↗ Transférer</CtxBtn>
                </div>
            )}

            {/* Tooltip patient */}
            {lit.occupation?.patient && !hovered && (
                <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)', width:180, borderRadius:10, background:'#fff', border:'1px solid #eee', padding:'10px 12px', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', pointerEvents:'none', zIndex:20, display:'none' }} className="lit-tooltip">
                    <div style={{ fontSize:12, fontWeight:700, color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lit.occupation.patient}</div>
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:3, fontFamily:'system-ui,sans-serif' }}>{lit.occupation.diagnostic}</div>
                </div>
            )}
        </div>
    );
}

function CtxBtn({ onClick, children, color, bg }: { onClick:()=>void; children:React.ReactNode; color:string; bg:string }) {
    return (
        <button onClick={onClick} style={{ width:'100%', borderRadius:5, padding:'3px 2px', fontSize:9, fontWeight:700, color, background:bg, border:'none', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
            {children}
        </button>
    );
}

// ─── Modal primitives ─────────────────────────────────────────────────────────

function MModal({ title, subtitle, children, onClose, size=520 }: { title:string; subtitle?:string; children:React.ReactNode; onClose:()=>void; size?:number }) {
    return (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(10,10,8,0.6)', backdropFilter:'blur(10px)' }}>
            <div style={{ width:'100%', maxWidth:size, borderRadius:22, background:'#fff', boxShadow:'0 32px 80px rgba(0,0,0,0.2)', overflow:'hidden' }}>
                <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #f0f0ee', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                    <div>
                        <h2 style={{ fontSize:16, fontWeight:700, color:'#1a1a18', letterSpacing:'-0.3px' }}>{title}</h2>
                        {subtitle && <p style={{ fontSize:12, color:'#9ca3af', fontFamily:'system-ui,sans-serif', marginTop:2 }}>{subtitle}</p>}
                    </div>
                    <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid #f0f0ee', background:'#fafaf9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg style={{width:13,height:13,color:'#9ca3af'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
                <div style={{ padding:'18px 22px' }}>{children}</div>
            </div>
        </div>
    );
}

function MField({ label, children }: { label:string; children:React.ReactNode }) {
    return <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#374151', fontFamily:'system-ui,sans-serif', marginBottom:6 }}>{label}</label>{children}</div>;
}

function MFooter({ onCancel, onConfirm, label, color='#f53003', disabled=false, loading=false }: { onCancel:()=>void; onConfirm?:()=>void; label:string; color?:string; disabled?:boolean; loading?:boolean }) {
    return (
        <div style={{ display:'flex', justifyContent:'flex-end', gap:10, paddingTop:8 }}>
            <button type="button" onClick={onCancel} style={{ height:38, padding:'0 18px', borderRadius:10, border:'1.5px solid #f0f0ee', background:'#fff', fontSize:13, fontWeight:600, color:'#706f6c', cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Annuler</button>
            <button type={onConfirm?'button':'submit'} onClick={onConfirm} disabled={disabled||loading}
                style={{ height:38, padding:'0 20px', borderRadius:10, border:'none', background:color, color:'#fff', fontSize:13, fontWeight:700, cursor:disabled?'not-allowed':'pointer', fontFamily:'system-ui,sans-serif', opacity:(disabled||loading)?0.5:1, display:'flex', alignItems:'center', gap:7, boxShadow:`0 4px 14px ${color}40` }}>
                {loading && <svg style={{width:14,height:14,animation:'spin 1s linear infinite'}} viewBox="0 0 24 24" fill="none"><circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
                {label}
            </button>
        </div>
    );
}