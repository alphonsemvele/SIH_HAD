import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Patient {
    id: number; numero_dossier: string; nom: string; prenom: string;
    sexe: 'M' | 'F'; date_naissance: string; telephone: string | null;
}

interface DossierMedical {
    id: number; patient_id: number; numero_dossier_medical: string;
    date_ouverture: string; groupe_sanguin: string | null;
    allergies_confirmees: string[] | null; antecedents_medicaux: string[] | null;
    maladies_chroniques: string[] | null; statut: 'Actif' | 'Archivé' | 'Transféré';
    created_at: string; updated_at: string; patient: Patient;
    entrees_count?: number;
    derniere_entree?: { id: number; type: string; diagnostic: string | null; medecin?: { id: number; name: string }; date_entree: string; };
}

interface PaginatedData {
    data: DossierMedical[]; current_page: number; last_page: number;
    per_page: number; total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Stats { total: number; actifs: number; archives: number; mis_a_jour_aujourdhui: number; }

interface Props {
    dossiers: PaginatedData; stats?: Stats; patients: Patient[];
    medecins: Array<{ id: number; name: string }>;
    filters: { search?: string; statut?: string; medecin_id?: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const STATUT_MAP: Record<string, { color: string; bg: string; border: string }> = {
    Actif:     { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    Archivé:   { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
    Transféré: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dossiers({
    dossiers, stats, patients = [], medecins = [], filters = {}
}: Props) {
    const [showModal, setShowModal]         = useState(false);
    const [activeTab, setActiveTab]         = useState<'existant' | 'nouveau'>('existant');
    const [search, setSearch]               = useState(filters.search || '');
    const [statutFilter, setStatutFilter]   = useState(filters.statut || '');
    const [medecinFilter, setMedecinFilter] = useState(filters.medecin_id || '');
    const [searchPatient, setSearchPatient] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');

    const filteredPatients = patients.filter(p =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
        (p.telephone && p.telephone.includes(searchPatient)) ||
        p.numero_dossier.toLowerCase().includes(searchPatient.toLowerCase())
    );
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    const newPatientForm = useForm({ nom: '', prenom: '', sexe: 'M' as 'M'|'F', date_naissance: '', telephone: '' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dossiers-medicaux', { search, statut: statutFilter, medecin_id: medecinFilter }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const p: Record<string, string> = { search, statut: statutFilter, medecin_id: medecinFilter };
        p[key] = value;
        if (key === 'statut') setStatutFilter(value);
        if (key === 'medecin_id') setMedecinFilter(value);
        router.get('/dossiers-medicaux', p, { preserveState: true });
    };

    const handleCreateForExisting = () => {
        if (!selectedPatientId) return;
        router.get(`/patients/${selectedPatientId}/dossier-medical`);
        setShowModal(false);
    };

    const handleCreateNewPatient = (e: React.FormEvent) => {
        e.preventDefault();
        newPatientForm.post('/patients', { onSuccess: () => { newPatientForm.reset(); setShowModal(false); } });
    };

    return (
        <DashboardLayout title="Dossiers médicaux" subtitle="Gestion des dossiers patients informatisés (DPI)">

            {/* ══════════════════════════════════════ KPI CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total dossiers',       value: stats?.total ?? '—',                    icon: '📁', grad: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', shadow: 'rgba(59,130,246,0.35)' },
                    { label: 'Dossiers actifs',       value: stats?.actifs ?? '—',                   icon: '✅', grad: 'linear-gradient(135deg,#065f46,#10b981)', shadow: 'rgba(16,185,129,0.35)' },
                    { label: 'Archivés',              value: stats?.archives ?? '—',                 icon: '🗂️', grad: 'linear-gradient(135deg,#374151,#6b7280)', shadow: 'rgba(107,114,128,0.2)' },
                    { label: "Mis à jour aujourd'hui",value: stats?.mis_a_jour_aujourdhui ?? '—',   icon: '🕐', grad: 'linear-gradient(135deg,#b45309,#f59e0b)', shadow: 'rgba(245,158,11,0.35)' },
                ].map((k, i) => (
                    <div key={i} style={{ borderRadius: 18, padding: '20px 20px', background: k.grad, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 24px ${k.shadow}` }}>
                        <div style={{ position: 'absolute', top: -14, right: -14, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}/>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
                        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{typeof k.value === 'number' ? k.value.toLocaleString() : k.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 4, fontFamily: 'system-ui,sans-serif' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════ TOOLBAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
                {/* Search */}
                <form onSubmit={handleSearch} style={{ position: 'relative', flex: 1, minWidth: 240, maxWidth: 380 }}>
                    <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="N° dossier, patient…"
                        style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 12, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, color: '#1a1a18', outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                        onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }}/>
                </form>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Filtre statut */}
                    <select value={statutFilter} onChange={e => handleFilterChange('statut', e.target.value)}
                        style={{ height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, color: '#1a1a18', outline: 'none', fontFamily: 'system-ui,sans-serif', cursor: 'pointer' }}>
                        <option value="">Tous les statuts</option>
                        <option value="Actif">Actif</option>
                        <option value="Archivé">Archivé</option>
                        <option value="Transféré">Transféré</option>
                    </select>

                    {/* Filtre médecin */}
                    <select value={medecinFilter} onChange={e => handleFilterChange('medecin_id', e.target.value)}
                        style={{ height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, color: '#1a1a18', outline: 'none', fontFamily: 'system-ui,sans-serif', cursor: 'pointer' }}>
                        <option value="">Tous les médecins</option>
                        {medecins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>

                    {/* Bouton nouveau */}
                    <button onClick={() => setShowModal(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', boxShadow: '0 4px 14px rgba(245,48,3,0.3)', transition: 'transform 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
                        <svg style={{ width: 15, height: 15 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14"/></svg>
                        Nouveau dossier
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════ TABLE */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #eee', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                {/* Barre accent */}
                <div style={{ height: 3, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)' }}/>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui,sans-serif' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f5f5f3' }}>
                                {['N° Dossier','Patient','Dernier diagnostic','Gr. sanguin','Ouverture','Entrées','Statut','Actions'].map((h, i) => (
                                    <th key={i} style={{ padding: '13px 16px', textAlign: i === 7 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#c0c0bc', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dossiers.data.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#c0c0bc', fontSize: 14 }}>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                                    Aucun dossier médical trouvé
                                </td></tr>
                            ) : dossiers.data.map((d, i) => {
                                const stat = STATUT_MAP[d.statut] ?? STATUT_MAP.Actif;
                                return (
                                    <tr key={d.id} style={{ borderBottom: i < dossiers.data.length - 1 ? '1px solid #f5f5f3' : 'none', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fafaf9'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>

                                        {/* N° dossier */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#f53003' }}>
                                                {d.numero_dossier_medical}
                                            </span>
                                        </td>

                                        {/* Patient */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: d.patient.sexe === 'M' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#ec4899,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {d.patient.prenom[0]}{d.patient.nom[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{d.patient.nom} {d.patient.prenom}</div>
                                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{d.patient.numero_dossier}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Diagnostic */}
                                        <td style={{ padding: '13px 16px', maxWidth: 200 }}>
                                            <span style={{ fontSize: 13, color: d.derniere_entree?.diagnostic ? '#1a1a18' : '#c0c0bc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                {d.derniere_entree?.diagnostic || '—'}
                                            </span>
                                        </td>

                                        {/* Groupe sanguin */}
                                        <td style={{ padding: '13px 16px' }}>
                                            {d.groupe_sanguin
                                                ? <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 100, padding: '3px 9px' }}>{d.groupe_sanguin}</span>
                                                : <span style={{ color: '#c0c0bc', fontSize: 13 }}>—</span>
                                            }
                                        </td>

                                        {/* Date */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 12, color: '#9ca3af' }}>{formatDate(d.date_ouverture)}</span>
                                        </td>

                                        {/* Entrées */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: 7, background: '#f0f0ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg style={{ width: 12, height: 12, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{d.entrees_count || 0}</span>
                                            </div>
                                        </td>

                                        {/* Statut */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: stat.color, background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 100, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                                                {d.statut}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '13px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                {[
                                                    { href: `/patients/${d.patient_id}/dossier-medical`, title: 'Voir dossier', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                                                    { href: `/patients/${d.patient_id}`, title: 'Fiche patient', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                                ].map((btn, j) => (
                                                    <Link key={j} href={btn.href} title={btn.title}
                                                        style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', transition: 'background 0.15s', textDecoration: 'none' }}
                                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                        <svg style={{ width: 15, height: 15, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon}/></svg>
                                                    </Link>
                                                ))}
                                                <button title="Imprimer"
                                                    style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0ee'}
                                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                                                    <svg style={{ width: 15, height: 15, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm1-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3"/></svg>
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
                {dossiers.last_page > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f5f5f3' }}>
                        <p style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'system-ui,sans-serif' }}>
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{(dossiers.current_page - 1) * dossiers.per_page + 1}</span> –{' '}
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{Math.min(dossiers.current_page * dossiers.per_page, dossiers.total)}</span> sur{' '}
                            <span style={{ fontWeight: 600, color: '#1a1a18' }}>{dossiers.total.toLocaleString()}</span> dossiers
                        </p>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {dossiers.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'} preserveState
                                    style={{ minWidth: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13, fontFamily: 'system-ui,sans-serif', textDecoration: 'none', fontWeight: link.active ? 700 : 400, background: link.active ? '#f53003' : 'transparent', color: link.active ? '#fff' : link.url ? '#706f6c' : '#d1d5db', border: link.active ? 'none' : '1px solid #f0f0ee', pointerEvents: link.url ? 'auto' : 'none', opacity: link.url ? 1 : 0.4, padding: '0 6px' }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}/>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════ MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(10,10,8,0.6)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ width: '100%', maxWidth: 680, borderRadius: 24, background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

                        {/* Header modal */}
                        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f0f0ee', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f53003,#ff8c6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg style={{ width: 18, height: 18, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.3px' }}>Nouveau dossier médical</h2>
                                    <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'system-ui,sans-serif', marginTop: 2 }}>Sélectionnez un patient existant ou créez-en un nouveau</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #f0f0ee', background: '#fafaf9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg style={{ width: 14, height: 14, color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0ee', flexShrink: 0 }}>
                            {(['existant', 'nouveau'] as const).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 600, fontFamily: 'system-ui,sans-serif', background: 'none', border: 'none', cursor: 'pointer', borderBottom: activeTab === tab ? '2.5px solid #f53003' : '2.5px solid transparent', color: activeTab === tab ? '#f53003' : '#9ca3af', transition: 'all 0.15s' }}>
                                    {tab === 'existant' ? '👤 Patient existant' : '➕ Nouveau patient'}
                                </button>
                            ))}
                        </div>

                        {/* Body scrollable */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

                            {activeTab === 'existant' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Recherche */}
                                    <div style={{ position: 'relative' }}>
                                        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#c0c0bc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                        <input type="text" placeholder="Nom, prénom ou N° dossier…" value={searchPatient} onChange={e => setSearchPatient(e.target.value)}
                                            style={{ width: '100%', height: 40, paddingLeft: 34, paddingRight: 12, borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                                            onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }}/>
                                    </div>

                                    {/* Liste patients */}
                                    <div style={{ borderRadius: 14, border: '1px solid #f0f0ee', overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
                                        {filteredPatients.length === 0
                                            ? <div style={{ padding: '28px', textAlign: 'center', color: '#c0c0bc', fontSize: 13, fontFamily: 'system-ui,sans-serif' }}>Aucun patient trouvé</div>
                                            : filteredPatients.map((p, i) => (
                                                <button key={p.id} type="button" onClick={() => setSelectedPatientId(p.id)}
                                                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: selectedPatientId === p.id ? '#fff5f5' : 'transparent', border: 'none', borderBottom: i < filteredPatients.length - 1 ? '1px solid #f5f5f3' : 'none', cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left' }}
                                                    onMouseEnter={e => { if (selectedPatientId !== p.id) (e.currentTarget as HTMLElement).style.background = '#fafaf9'; }}
                                                    onMouseLeave={e => { if (selectedPatientId !== p.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p.sexe === 'M' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'linear-gradient(135deg,#ec4899,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                        {p.prenom?.[0] || '?'}{p.nom?.[0] || '?'}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a18' }}>{p.nom} {p.prenom}</div>
                                                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.numero_dossier} · {p.date_naissance ? formatDate(p.date_naissance) : '—'}</div>
                                                    </div>
                                                    {selectedPatientId === p.id && (
                                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#f53003', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <svg style={{ width: 11, height: 11, color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        }
                                    </div>

                                    {selectedPatient && (
                                        <div style={{ borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <svg style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            <p style={{ fontSize: 13, color: '#15803d', fontFamily: 'system-ui,sans-serif' }}>
                                                <strong>{selectedPatient.nom} {selectedPatient.prenom}</strong> sélectionné — le dossier sera ouvert.
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid #f0f0ee' }}>
                                        <button onClick={() => setShowModal(false)} style={{ height: 38, padding: '0 18px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fff', fontSize: 13, fontWeight: 600, color: '#706f6c', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>
                                            Annuler
                                        </button>
                                        <button onClick={handleCreateForExisting} disabled={!selectedPatientId}
                                            style={{ height: 38, padding: '0 20px', borderRadius: 10, background: selectedPatientId ? 'linear-gradient(135deg,#f53003,#e02a00)' : '#f0f0ee', border: 'none', color: selectedPatientId ? '#fff' : '#c0c0bc', fontSize: 13, fontWeight: 700, cursor: selectedPatientId ? 'pointer' : 'not-allowed', fontFamily: 'system-ui,sans-serif', boxShadow: selectedPatientId ? '0 4px 14px rgba(245,48,3,0.25)' : 'none' }}>
                                            Voir le dossier →
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateNewPatient} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        {[
                                            { label: 'Nom *', key: 'nom', type: 'text', span: false },
                                            { label: 'Prénom *', key: 'prenom', type: 'text', span: false },
                                        ].map(f => (
                                            <div key={f.key}>
                                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>{f.label}</label>
                                                <input type={f.type} value={(newPatientForm.data as any)[f.key]} onChange={e => newPatientForm.setData(f.key as any, e.target.value)}
                                                    style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                                                    onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                                                    onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }} required/>
                                            </div>
                                        ))}

                                        {/* Sexe */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>Sexe *</label>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {(['M','F'] as const).map(s => (
                                                    <button key={s} type="button" onClick={() => newPatientForm.setData('sexe', s)}
                                                        style={{ flex: 1, height: 38, borderRadius: 10, border: `1.5px solid ${newPatientForm.data.sexe === s ? (s === 'M' ? '#3b82f6' : '#ec4899') : '#f0f0ee'}`, background: newPatientForm.data.sexe === s ? (s === 'M' ? '#eff6ff' : '#fdf2f8') : '#fafaf9', fontSize: 13, fontWeight: 600, color: newPatientForm.data.sexe === s ? (s === 'M' ? '#2563eb' : '#db2777') : '#9ca3af', cursor: 'pointer', fontFamily: 'system-ui,sans-serif', transition: 'all 0.15s' }}>
                                                        {s === 'M' ? '♂ Masculin' : '♀ Féminin'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date naissance */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>Date de naissance *</label>
                                            <input type="date" value={newPatientForm.data.date_naissance} onChange={e => newPatientForm.setData('date_naissance', e.target.value)}
                                                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                                                onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                                                onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }} required/>
                                        </div>

                                        {/* Téléphone */}
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>Téléphone</label>
                                            <input type="tel" value={newPatientForm.data.telephone} onChange={e => newPatientForm.setData('telephone', e.target.value)} placeholder="+237 6XX XXX XXX"
                                                style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fafaf9', fontSize: 13, outline: 'none', fontFamily: 'system-ui,sans-serif', boxSizing: 'border-box' }}
                                                onFocus={e => { e.currentTarget.style.borderColor = '#f53003'; e.currentTarget.style.background = '#fff'; }}
                                                onBlur={e => { e.currentTarget.style.borderColor = '#f0f0ee'; e.currentTarget.style.background = '#fafaf9'; }}/>
                                        </div>
                                    </div>

                                    <div style={{ borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <svg style={{ width: 15, height: 15, color: '#2563eb', flexShrink: 0, marginTop: 1 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <p style={{ fontSize: 12, color: '#1d4ed8', fontFamily: 'system-ui,sans-serif' }}>Le dossier médical sera créé automatiquement avec le nouveau patient.</p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 12, borderTop: '1px solid #f0f0ee' }}>
                                        <button type="button" onClick={() => setShowModal(false)} style={{ height: 38, padding: '0 18px', borderRadius: 10, border: '1.5px solid #f0f0ee', background: '#fff', fontSize: 13, fontWeight: 600, color: '#706f6c', cursor: 'pointer', fontFamily: 'system-ui,sans-serif' }}>
                                            Annuler
                                        </button>
                                        <button type="submit" disabled={newPatientForm.processing}
                                            style={{ height: 38, padding: '0 20px', borderRadius: 10, background: 'linear-gradient(135deg,#f53003,#e02a00)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', opacity: newPatientForm.processing ? 0.7 : 1, boxShadow: '0 4px 14px rgba(245,48,3,0.25)', display: 'flex', alignItems: 'center', gap: 7 }}>
                                            {newPatientForm.processing ? 'Création…' : '✓ Créer patient + dossier'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}