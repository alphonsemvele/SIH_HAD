import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Patient {
    id: number; numero_dossier: string; nom: string; prenom: string;
    date_naissance: string; sexe: 'M' | 'F';
    lieu_naissance: string | null; nationalite: string | null; cni: string | null;
    telephone: string | null; telephone_urgence: string | null; email: string | null;
    adresse: string | null; ville: string | null; quartier: string | null;
    profession: string | null; situation_matrimoniale: string | null;
    groupe_sanguin: string | null; allergies: string[] | null;
    antecedents_medicaux: string[] | null;
    personne_contact_nom: string | null; personne_contact_telephone: string | null;
    personne_contact_lien: string | null; notes: string | null;
    statut: 'Hospitalisé' | 'Consultation' | 'Urgence' | 'Sortie';
    created_at: string; updated_at: string;
}

interface PaginatedData {
    data: Patient[]; current_page: number; last_page: number;
    per_page: number; total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats { total: number; hospitalises: number; consultations: number; urgences: number; }

interface Props {
    patients: PaginatedData; stats: Stats;
    filters: { search?: string; statut?: string };
    statuts: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const calcAge = (d: string) => {
    if (!d) return '—';
    const today = new Date(); const b = new Date(d);
    let age = today.getFullYear() - b.getFullYear();
    if (today.getMonth() - b.getMonth() < 0 || (today.getMonth() - b.getMonth() === 0 && today.getDate() < b.getDate())) age--;
    return `${age} ans`;
};

const STATUT_CFG: Record<string, { color: string; bg: string; border: string }> = {
    Hospitalisé:  { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    Consultation: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    Urgence:      { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    Sortie:       { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const S = (v: string | null | undefined) => v || '—';

// ─── Input style helper ───────────────────────────────────────────────────────
const inputSx: React.CSSProperties = {
    width: '100%', height: 38, padding: '0 12px', borderRadius: 10,
    border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13,
    outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' as const,
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const s = STATUT_CFG[status] ?? STATUT_CFG.Sortie;
    return (
        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' as const }}>
            {status}
        </span>
    );
}

// ─── InfoItem ─────────────────────────────────────────────────────────────────
function InfoItem({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{S(value)}</p>
        </div>
    );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label, color = '#f53003' }: { label: string; color?: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 3, height: 16, borderRadius: 100, background: color }}/>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: 'system-ui,sans-serif' }}>{label}</span>
        </div>
    );
}

// ─── ModalWrapper ─────────────────────────────────────────────────────────────
function ModalWrapper({ children, maxWidth = 720 }: { children: React.ReactNode; maxWidth?: number }) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(10,10,8,0.6)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '100%', maxWidth, borderRadius: 24, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {children}
            </div>
        </div>
    );
}

// ─── ModalHeader ─────────────────────────────────────────────────────────────
function ModalHeader({ icon, title, subtitle, onClose, extra }: { icon?: React.ReactNode; title: string; subtitle?: string; onClose: () => void; extra?: React.ReactNode }) {
    return (
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {icon}
                <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.3px' }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', marginTop: 2 }}>{subtitle}</p>}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {extra}
                <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
    );
}

// ─── FormField ───────────────────────────────────────────────────────────────
function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>{label}</label>
            {children}
            {error && <p style={{ marginTop: 4, fontSize: 11, color: '#ef4444', fontFamily: 'system-ui,sans-serif' }}>{error}</p>}
        </div>
    );
}

// ─── PatientFormModal ─────────────────────────────────────────────────────────
function PatientFormModal({ title, subtitle, form, statuts, onSubmit, onClose, submitLabel }: {
    title: string; subtitle: string; form: any; statuts: string[];
    onSubmit: (e: React.FormEvent) => void; onClose: () => void; submitLabel: string;
}) {
    const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = '#f53003';
        e.currentTarget.style.background = '#fff';
    };
    const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        e.currentTarget.style.borderColor = '#f0f0ee';
        e.currentTarget.style.background = '#fafaf9';
    };

    const avatarBg = form.data.sexe === 'M' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#ec4899,#db2777)';

    return (
        <ModalWrapper maxWidth={780}>
            <ModalHeader
                icon={
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: 18, height: 18, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                }
                title={title} subtitle={subtitle} onClose={onClose}
            />

            <div style={{ overflowY: 'auto', flex: 1 }}>
                <form onSubmit={onSubmit} style={{ padding: '20px 24px' }}>

                    {/* Identité */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionLabel label="Informations personnelles" color="#3b82f6"/>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                            <FormField label="Nom *" error={form.errors.nom}>
                                <input type="text" value={form.data.nom} onChange={e => form.setData('nom', e.target.value)} onFocus={focusOn} onBlur={focusOff} required
                                    style={{ ...inputSx, borderColor: form.errors.nom ? '#ef4444' : '#f0f0ee' }}/>
                            </FormField>
                            <FormField label="Prénom *" error={form.errors.prenom}>
                                <input type="text" value={form.data.prenom} onChange={e => form.setData('prenom', e.target.value)} onFocus={focusOn} onBlur={focusOff} required
                                    style={{ ...inputSx, borderColor: form.errors.prenom ? '#ef4444' : '#f0f0ee' }}/>
                            </FormField>
                            {/* Sexe toggle */}
                            <FormField label="Sexe *">
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {(['M','F'] as const).map(s => (
                                        <button key={s} type="button" onClick={() => form.setData('sexe', s)}
                                            style={{ flex: 1, height: 38, borderRadius: 10, border: `1.5px solid ${form.data.sexe === s ? (s === 'M' ? '#3b82f6' : '#ec4899') : '#f0f0ee'}`, background: form.data.sexe === s ? (s === 'M' ? '#eff6ff' : '#fdf2f8') : '#fafaf9', fontSize: 13, fontWeight: 600, color: form.data.sexe === s ? (s === 'M' ? '#2563eb' : '#db2777') : '#9ca3af', cursor: 'pointer', fontFamily: 'system-ui,sans-serif', transition: 'all 0.15s' }}>
                                            {s === 'M' ? '♂ M' : '♀ F'}
                                        </button>
                                    ))}
                                </div>
                            </FormField>
                            <FormField label="Date de naissance *" error={form.errors.date_naissance}>
                                <input type="date" value={form.data.date_naissance} onChange={e => form.setData('date_naissance', e.target.value)} onFocus={focusOn} onBlur={focusOff} required
                                    style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Lieu de naissance">
                                <input type="text" value={form.data.lieu_naissance} onChange={e => form.setData('lieu_naissance', e.target.value)} onFocus={focusOn} onBlur={focusOff}
                                    style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Nationalité">
                                <input type="text" value={form.data.nationalite} onChange={e => form.setData('nationalite', e.target.value)} placeholder="Camerounaise" onFocus={focusOn} onBlur={focusOff}
                                    style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="N° CNI">
                                <input type="text" value={form.data.cni} onChange={e => form.setData('cni', e.target.value)} onFocus={focusOn} onBlur={focusOff}
                                    style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Profession">
                                <input type="text" value={form.data.profession} onChange={e => form.setData('profession', e.target.value)} onFocus={focusOn} onBlur={focusOff}
                                    style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Situation matrimoniale">
                                <select value={form.data.situation_matrimoniale} onChange={e => form.setData('situation_matrimoniale', e.target.value)} onFocus={focusOn} onBlur={focusOff}
                                    style={{ ...inputSx }}>
                                    <option value="">Non renseigné</option>
                                    <option value="celibataire">Célibataire</option>
                                    <option value="marie">Marié(e)</option>
                                    <option value="divorce">Divorcé(e)</option>
                                    <option value="veuf">Veuf(ve)</option>
                                </select>
                            </FormField>
                        </div>
                    </div>

                    {/* Coordonnées */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionLabel label="Coordonnées" color="#10b981"/>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                            <FormField label="Téléphone">
                                <input type="tel" value={form.data.telephone} onChange={e => form.setData('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Téléphone urgence">
                                <input type="tel" value={form.data.telephone_urgence} onChange={e => form.setData('telephone_urgence', e.target.value)} placeholder="+237 6XX XXX XXX" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Email">
                                <input type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} placeholder="patient@email.com" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Ville">
                                <input type="text" value={form.data.ville} onChange={e => form.setData('ville', e.target.value)} placeholder="Douala" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Quartier">
                                <input type="text" value={form.data.quartier} onChange={e => form.setData('quartier', e.target.value)} placeholder="Akwa" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormField label="Adresse complète">
                                    <input type="text" value={form.data.adresse} onChange={e => form.setData('adresse', e.target.value)} placeholder="Rue 1.234, face pharmacie" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Médical */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionLabel label="Informations médicales" color="#ef4444"/>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                            <FormField label="Groupe sanguin">
                                <select value={form.data.groupe_sanguin} onChange={e => form.setData('groupe_sanguin', e.target.value)} onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}>
                                    <option value="">Non renseigné</option>
                                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Statut">
                                <select value={form.data.statut} onChange={e => form.setData('statut', e.target.value)} onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}>
                                    {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </FormField>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <FormField label="Allergies connues">
                                    <input type="text" value={form.data.allergies} onChange={e => form.setData('allergies', e.target.value)} placeholder="Pénicilline, arachides (séparez par des virgules)" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* Contact urgence */}
                    <div style={{ marginBottom: 28 }}>
                        <SectionLabel label="Personne à contacter en cas d'urgence" color="#f59e0b"/>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                            <FormField label="Nom complet">
                                <input type="text" value={form.data.personne_contact_nom} onChange={e => form.setData('personne_contact_nom', e.target.value)} onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Téléphone">
                                <input type="tel" value={form.data.personne_contact_telephone} onChange={e => form.setData('personne_contact_telephone', e.target.value)} placeholder="+237 6XX XXX XXX" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                            <FormField label="Lien de parenté">
                                <input type="text" value={form.data.personne_contact_lien} onChange={e => form.setData('personne_contact_lien', e.target.value)} placeholder="Époux, Parent…" onFocus={focusOn} onBlur={focusOff} style={{ ...inputSx }}/>
                            </FormField>
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: 20 }}>
                        <SectionLabel label="Notes" color="#8b5cf6"/>
                        <textarea rows={3} value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                            placeholder="Observations, antécédents médicaux, remarques…"
                            style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }}/>
                    </div>

                    {/* Footer form */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #f0f0ee' }}>
                        <button type="button" onClick={onClose} style={{ height: 38, padding: '0 18px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fff', fontSize: 13, fontWeight: 600, color: '#706f6c', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={form.processing}
                            style={{ height: 38, padding: '0 22px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', opacity: form.processing ? 0.7 : 1, boxShadow: '0 4px 14px rgba(245,48,3,0.25)', display: 'flex', alignItems: 'center', gap: 7 }}>
                            {form.processing ? 'Enregistrement…' : `✓ ${submitLabel}`}
                        </button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Patients({ patients, stats, filters, statuts }: Props) {
    const [showCreate,  setShowCreate]  = useState(false);
    const [showView,    setShowView]    = useState(false);
    const [showEdit,    setShowEdit]    = useState(false);
    const [showStatut,  setShowStatut]  = useState(false);
    const [selected,    setSelected]    = useState<Patient | null>(null);
    const [search,      setSearch]      = useState(filters.search || '');
    const [statutFilter,setStatutFilter]= useState(filters.statut || '');

    const createForm = useForm({ nom:'', prenom:'', sexe:'M' as 'M'|'F', date_naissance:'', lieu_naissance:'', nationalite:'', cni:'', telephone:'', telephone_urgence:'', email:'', adresse:'', ville:'', quartier:'', profession:'', situation_matrimoniale:'', groupe_sanguin:'', allergies:'', personne_contact_nom:'', personne_contact_telephone:'', personne_contact_lien:'', notes:'', statut:'Consultation' });
    const editForm   = useForm({ nom:'', prenom:'', sexe:'M' as 'M'|'F', date_naissance:'', lieu_naissance:'', nationalite:'', cni:'', telephone:'', telephone_urgence:'', email:'', adresse:'', ville:'', quartier:'', profession:'', situation_matrimoniale:'', groupe_sanguin:'', allergies:'', personne_contact_nom:'', personne_contact_telephone:'', personne_contact_lien:'', notes:'', statut:'Consultation' });
    const statutForm = useForm({ statut: '' });

    const doSearch = (e: React.FormEvent) => { e.preventDefault(); router.get('/patients', { search, statut: statutFilter }, { preserveState: true }); };
    const doStatutFilter = (v: string) => { setStatutFilter(v); router.get('/patients', { search, statut: v }, { preserveState: true }); };

    const openView = (p: Patient) => { setSelected(p); setShowView(true); };
    const openEdit = (p: Patient) => {
        setSelected(p);
        editForm.setData({ nom: p.nom, prenom: p.prenom, sexe: p.sexe, date_naissance: p.date_naissance?.split('T')[0] || '', lieu_naissance: p.lieu_naissance || '', nationalite: p.nationalite || '', cni: p.cni || '', telephone: p.telephone || '', telephone_urgence: p.telephone_urgence || '', email: p.email || '', adresse: p.adresse || '', ville: p.ville || '', quartier: p.quartier || '', profession: p.profession || '', situation_matrimoniale: p.situation_matrimoniale || '', groupe_sanguin: p.groupe_sanguin || '', allergies: p.allergies?.join(', ') || '', personne_contact_nom: p.personne_contact_nom || '', personne_contact_telephone: p.personne_contact_telephone || '', personne_contact_lien: p.personne_contact_lien || '', notes: p.notes || '', statut: p.statut });
        setShowEdit(true);
    };
    const openStatut = (p: Patient) => { setSelected(p); statutForm.setData('statut', p.statut); setShowStatut(true); };

    return (
        <DashboardLayout title="Patients" subtitle="Gestion des patients de l'établissement">

            {/* ══════════════════════════════════════ KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total patients',  value: stats.total,         icon: '👥', grad: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
                    { label: 'Hospitalisés',    value: stats.hospitalises,  icon: '🛏️', grad: 'linear-gradient(135deg,#0c4a6e,#0284c7)', shadow: 'rgba(2,132,199,0.35)' },
                    { label: 'Consultations',   value: stats.consultations, icon: '📋', grad: 'linear-gradient(135deg,#065f46,#10b981)', shadow: 'rgba(16,185,129,0.35)' },
                    { label: 'Urgences',        value: stats.urgences,      icon: '🚨', grad: 'linear-gradient(135deg,#991b1b,#ef4444)', shadow: 'rgba(239,68,68,0.35)' },
                ].map((k, i) => (
                    <div key={i} style={{ borderRadius: 18, padding: '20px', background: k.grad, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 24px ${k.shadow}` }}>
                        <div style={{ position: 'absolute', top: -14, right: -14, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{k.value.toLocaleString()}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                <form onSubmit={doSearch} style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 380 }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, prénom, dossier…"
                        style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 12, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }}/>
                </form>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={statutFilter} onChange={e => doStatutFilter(e.target.value)}
                        style={{ height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', cursor: 'pointer' }}>
                        <option value="">Tous les statuts</option>
                        {statuts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setShowCreate(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', boxShadow: '0 4px 14px rgba(245,48,3,0.3)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
                        <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Nouveau patient
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #eee', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ height: 3, background: 'linear-gradient(90deg,#3b82f6,#10b981)' }}/>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f5f5f3' }}>
                                {['Patient','N° Dossier','Naissance','Téléphone','Ville','Statut','Actions'].map((h, i) => (
                                    <th key={i} style={{ padding: '13px 16px', textAlign: i === 6 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#c0c0bc', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {patients.data.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#c0c0bc', fontSize: 14 }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                                    Aucun patient trouvé
                                </td></tr>
                            ) : patients.data.map((p, i) => (
                                <tr key={p.id} style={{ borderBottom: i < patients.data.length - 1 ? '1px solid #f5f5f3' : 'none', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: p.sexe === 'M' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#ec4899,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                {p.prenom[0]}{p.nom[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{p.nom} {p.prenom}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{p.email || p.adresse || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#f53003' }}>{p.numero_dossier}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontSize: 12, color: '#1a1a18' }}>{formatDate(p.date_naissance)}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{calcAge(p.date_naissance)}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: p.telephone ? '#1a1a18' : '#c0c0bc' }}>{p.telephone || '—'}</td>
                                    <td style={{ padding: '12px 16px', fontSize: 13, color: p.ville ? '#1a1a18' : '#c0c0bc' }}>{p.ville || '—'}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button onClick={() => openStatut(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                            <StatusBadge status={p.statut}/>
                                        </button>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                                            {[
                                                { title: 'Voir', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', action: () => openView(p) },
                                                { title: 'Modifier', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', action: () => openEdit(p) },
                                                { title: 'Dossier', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', href: `/patients/${p.id}/dossier-medical` },
                                            ].map((btn, j) => (
                                                btn.href
                                                    ? <Link key={j} href={btn.href} title={btn.title}
                                                        style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                        <svg style={{ width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                                    </Link>
                                                    : <button key={j} onClick={btn.action} title={btn.title}
                                                        style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                        <svg style={{ width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                                    </button>
                                            ))}
                                            <button onClick={() => { if (confirm(`Supprimer ${p.prenom} ${p.nom} ?`)) router.delete(`/patients/${p.id}`); }} title="Supprimer"
                                                style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                                <svg style={{ width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {patients.last_page > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f5f5f3' }}>
                        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'system-ui,sans-serif' }}>
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{(patients.current_page - 1) * patients.per_page + 1}</span> –{' '}
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{Math.min(patients.current_page * patients.per_page, patients.total)}</span> sur{' '}
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{patients.total.toLocaleString()}</span> patients
                        </p>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {patients.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    style={{ minWidth: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13, fontFamily: 'system-ui,sans-serif', textDecoration: 'none', fontWeight: link.active ? 700 : 400, background: link.active ? '#f53003' : 'transparent', color: link.active ? '#fff' : link.url ? '#706f6c' : '#d1d5db', border: link.active ? 'none' : '1px solid #f0f0ee', pointerEvents: link.url ? 'auto' : 'none', opacity: link.url ? 1 : 0.4, padding: '0 6px' }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════ MODAL VOIR */}
            {showView && selected && (
                <ModalWrapper maxWidth={760}>
                    <ModalHeader
                        icon={
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: selected.sexe === 'M' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#ec4899,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                                {selected.prenom[0]}{selected.nom[0]}
                            </div>
                        }
                        title={`${selected.prenom} ${selected.nom}`}
                        subtitle={`${selected.numero_dossier} · ${calcAge(selected.date_naissance)}`}
                        onClose={() => setShowView(false)}
                        extra={<StatusBadge status={selected.statut}/>}
                    />
                    <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                        {/* Alertes médicales */}
                        {selected.allergies && selected.allergies.length > 0 && (
                            <div style={{ marginBottom: 24, borderRadius: 14, background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 18 }}>⚠️</span>
                                <div>
                                    <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>ALLERGIES CONNUES</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {selected.allergies.map((a, i) => (
                                            <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fff', border: '1px solid #fca5a5', borderRadius: 100, padding: '2px 10px' }}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Identité */}
                            <div>
                                <SectionLabel label="Informations personnelles" color="#3b82f6"/>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                    <InfoItem label="Date de naissance" value={formatDate(selected.date_naissance)}/>
                                    <InfoItem label="Âge" value={calcAge(selected.date_naissance)}/>
                                    <InfoItem label="Sexe" value={selected.sexe === 'M' ? 'Masculin' : 'Féminin'}/>
                                    <InfoItem label="Lieu de naissance" value={selected.lieu_naissance}/>
                                    <InfoItem label="Nationalité" value={selected.nationalite}/>
                                    <InfoItem label="N° CNI" value={selected.cni}/>
                                    <InfoItem label="Profession" value={selected.profession}/>
                                    <InfoItem label="Situation matrimoniale" value={selected.situation_matrimoniale}/>
                                    <InfoItem label="Groupe sanguin" value={selected.groupe_sanguin}/>
                                </div>
                            </div>
                            {/* Coordonnées */}
                            <div>
                                <SectionLabel label="Coordonnées" color="#10b981"/>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                    <InfoItem label="Téléphone" value={selected.telephone}/>
                                    <InfoItem label="Téléphone urgence" value={selected.telephone_urgence}/>
                                    <InfoItem label="Email" value={selected.email}/>
                                    <InfoItem label="Ville" value={selected.ville}/>
                                    <InfoItem label="Quartier" value={selected.quartier}/>
                                    <InfoItem label="Adresse" value={selected.adresse}/>
                                </div>
                            </div>
                            {/* Contact urgence */}
                            <div>
                                <SectionLabel label="Personne à contacter" color="#f59e0b"/>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                                    <InfoItem label="Nom" value={selected.personne_contact_nom}/>
                                    <InfoItem label="Téléphone" value={selected.personne_contact_telephone}/>
                                    <InfoItem label="Lien" value={selected.personne_contact_lien}/>
                                </div>
                            </div>
                            {selected.notes && (
                                <div>
                                    <SectionLabel label="Notes" color="#8b5cf6"/>
                                    <p style={{ fontSize: 13, color: '#1a1a18', lineHeight: 1.7, fontFamily: 'system-ui,sans-serif', whiteSpace: 'pre-wrap' }}>{selected.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ padding: '14px 24px', borderTop: '1px solid #f0f0ee', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
                        <button onClick={() => setShowView(false)} style={{ height: 38, padding: '0 18px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fff', fontSize: 13, fontWeight: 600, color: '#706f6c', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>Fermer</button>
                        <button onClick={() => { setShowView(false); openEdit(selected); }}
                            style={{ height: 38, padding: '0 20px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', boxShadow: '0 4px 14px rgba(245,48,3,0.25)' }}>
                            ✏️ Modifier
                        </button>
                    </div>
                </ModalWrapper>
            )}

            {/* ══════════════════════════════════════ MODAL STATUT */}
            {showStatut && selected && (
                <ModalWrapper maxWidth={420}>
                    <ModalHeader
                        icon={<div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔄</div>}
                        title="Changer le statut"
                        subtitle={`${selected.prenom} ${selected.nom}`}
                        onClose={() => setShowStatut(false)}
                    />
                    <form onSubmit={e => { e.preventDefault(); if (selected) { statutForm.put(`/patients/${selected.id}`, { onSuccess: () => { setShowStatut(false); setSelected(null); } }); } }}
                        style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {statuts.map(s => {
                                const cfg = STATUT_CFG[s] ?? STATUT_CFG.Sortie;
                                const active = statutForm.data.statut === s;
                                return (
                                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${active ? cfg.color : '#f0f0ee'}`, background: active ? cfg.bg : '#fafaf9', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        <input type="radio" name="statut" value={s} checked={active} onChange={e => statutForm.setData('statut', e.target.value)} style={{ accentColor: cfg.color }}/>
                                        <StatusBadge status={s}/>
                                    </label>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0ee' }}>
                            <button type="button" onClick={() => setShowStatut(false)} style={{ height: 38, padding: '0 18px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fff', fontSize: 13, fontWeight: 600, color: '#706f6c', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>Annuler</button>
                            <button type="submit" disabled={statutForm.processing}
                                style={{ height: 38, padding: '0 20px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', boxShadow: '0 4px 14px rgba(245,48,3,0.25)', opacity: statutForm.processing ? 0.7 : 1 }}>
                                Mettre à jour
                            </button>
                        </div>
                    </form>
                </ModalWrapper>
            )}

            {/* ══════════════════════════════════════ MODAL CRÉER / ÉDITER */}
            {showCreate && (
                <PatientFormModal title="Nouveau patient" subtitle="Ajout d'un nouveau patient dans le système"
                    form={createForm} statuts={statuts}
                    onSubmit={e => { e.preventDefault(); createForm.post('/patients', { onSuccess: () => { createForm.reset(); setShowCreate(false); } }); }}
                    onClose={() => setShowCreate(false)} submitLabel="Enregistrer le patient"/>
            )}
            {showEdit && selected && (
                <PatientFormModal title="Modifier le patient" subtitle={`${selected.prenom} ${selected.nom} · ${selected.numero_dossier}`}
                    form={editForm} statuts={statuts}
                    onSubmit={e => { e.preventDefault(); editForm.put(`/patients/${selected.id}`, { onSuccess: () => { setShowEdit(false); setSelected(null); } }); }}
                    onClose={() => { setShowEdit(false); setSelected(null); }} submitLabel="Mettre à jour"/>
            )}

        </DashboardLayout>
    );
}