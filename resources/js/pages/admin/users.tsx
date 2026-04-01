import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './layout';

interface Service {
    id: number;
    nom: string;
}

interface User {
    id: number;
    matricule: string;
    name: string;
    lastname: string;
    email: string;
    telephone: string | null;
    fonction: string;
    specialite: string | null;
    service_id: number | null;
    service: Service | null;
    statut: 'actif' | 'conge' | 'mission' | 'inactif';
    role: string | null;
    date_embauche: string | null;
    created_at: string;
}

interface PaginatedData {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Stats {
    total: number;
    actifs: number;
    inactifs: number;
    suspendus: number;
    medecins: number;
}

interface Props {
    users: PaginatedData;
    stats: Stats;
    filters: {
        search?: string;
        fonction?: string;
        service_id?: string;
        statut?: string;
    };
    statuts: string[];
    fonctions: string[];
    roles: string[];
    services: Service[];
}

function StatutBadge({ statut }: { statut: string }) {
    const styles: Record<string, { dot: string; badge: string; label: string }> = {
        actif:    { dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400', label: 'Actif' },
        conge:    { dot: 'bg-yellow-400',  badge: 'bg-yellow-500/20 text-yellow-400',  label: 'Congé' },
        mission:  { dot: 'bg-blue-400',    badge: 'bg-blue-500/20 text-blue-400',      label: 'Mission' },
        inactif:  { dot: 'bg-gray-400',    badge: 'bg-gray-500/20 text-gray-400',      label: 'Inactif' },
    };
    const s = styles[statut] ?? styles['inactif'];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${s.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function FonctionBadge({ fonction }: { fonction: string }) {
    const styles: Record<string, string> = {
        'Médecin':          'bg-violet-500/20 text-violet-400',
        'Infirmière':       'bg-blue-500/20 text-blue-400',
        'Infirmière Chef':  'bg-purple-500/20 text-purple-400',
        'Sage-femme':       'bg-pink-500/20 text-pink-400',
        'Pharmacien(ne)':   'bg-emerald-500/20 text-emerald-400',
        'Technicien(ne)':   'bg-amber-500/20 text-amber-400',
        'Administratif':    'bg-gray-500/20 text-gray-400',
        'Admin':            'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${styles[fonction] ?? 'bg-gray-500/20 text-gray-400'}`}>
            {fonction}
        </span>
    );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-sm text-[#71717A]">{label}</p>
            <p className="mt-1 font-medium text-white">{value || '—'}</p>
        </div>
    );
}

export default function AdminUtilisateurs({ users, stats, filters, statuts, fonctions, roles, services }: Props) {
    const [showNewModal, setShowNewModal]     = useState(false);
    const [showViewModal, setShowViewModal]   = useState(false);
    const [showEditModal, setShowEditModal]   = useState(false);
    const [showStatutModal, setShowStatutModal] = useState(false);
    const [selectedUser, setSelectedUser]     = useState<User | null>(null);
    const [search, setSearch]                 = useState(filters.search || '');
    const [fonctionFilter, setFonctionFilter] = useState(filters.fonction || '');
    const [serviceFilter, setServiceFilter]   = useState(filters.service_id || '');
    const [statutFilter, setStatutFilter]     = useState(filters.statut || '');

    const createForm = useForm({
        name: '', lastname: '', email: '', password: '',
        telephone: '', fonction: '', specialite: '',
        service_id: '', date_embauche: '', statut: 'actif', role: '',
    });

    const editForm = useForm({
        name: '', lastname: '', email: '', password: '',
        telephone: '', fonction: '', specialite: '',
        service_id: '', date_embauche: '', statut: 'actif', role: '',
    });

    const statutForm = useForm({ statut: '' });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/utilisateurs', { search, fonction: fonctionFilter, service_id: serviceFilter, statut: statutFilter }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { search, fonction: fonctionFilter, service_id: serviceFilter, statut: statutFilter };
        params[key] = value;
        if (key === 'fonction')   setFonctionFilter(value);
        if (key === 'service_id') setServiceFilter(value);
        if (key === 'statut')     setStatutFilter(value);
        router.get('/admin/utilisateurs', params, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/utilisateurs', {
            onSuccess: () => { createForm.reset(); setShowNewModal(false); },
        });
    };

    const openViewModal = (user: User) => { setSelectedUser(user); setShowViewModal(true); };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        editForm.setData({
            name: user.name || '', lastname: user.lastname || '',
            email: user.email || '', password: '',
            telephone: user.telephone || '', fonction: user.fonction || '',
            specialite: user.specialite || '', service_id: user.service_id?.toString() || '',
            date_embauche: user.date_embauche ? user.date_embauche.split('T')[0] : '',
            statut: user.statut || 'actif', role: user.role || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            editForm.put(`/admin/utilisateurs/${selectedUser.id}`, {
                onSuccess: () => { setShowEditModal(false); setSelectedUser(null); },
            });
        }
    };

    const openStatutModal = (user: User) => {
        setSelectedUser(user);
        statutForm.setData('statut', user.statut);
        setShowStatutModal(true);
    };

    const handleChangeStatut = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            statutForm.patch(`/admin/utilisateurs/${selectedUser.id}/statut`, {
                onSuccess: () => { setShowStatutModal(false); setSelectedUser(null); },
            });
        }
    };

    const handleDelete = (user: User) => {
        if (confirm(`Supprimer définitivement ${user.lastname} ${user.name} ?`)) {
            router.delete(`/admin/utilisateurs/${user.id}`);
        }
    };

    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

    return (
        <AdminLayout title="Utilisateurs" subtitle="Gestion des comptes utilisateurs">

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                    { label: 'Total',     value: stats.total,      color: 'text-white' },
                    { label: 'Actifs',    value: stats.actifs,     color: 'text-emerald-400' },
                    { label: 'Inactifs',  value: stats.inactifs,   color: 'text-gray-400' },
                    { label: 'Suspendus', value: stats.suspendus,  color: 'text-red-400' },
                    { label: 'Médecins',  value: stats.medecins,   color: 'text-violet-400' },
                ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-[#1F1F28] bg-[#16161D] p-4">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
                        <p className="text-sm text-[#71717A]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Actions & Filters */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52525B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-64 rounded-xl border border-[#1F1F28] bg-[#16161D] pl-10 pr-4 text-sm text-white placeholder-[#52525B] outline-none focus:border-violet-500/50"
                        />
                    </form>
                    <select value={fonctionFilter} onChange={(e) => handleFilterChange('fonction', e.target.value)}
                        className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none focus:border-violet-500/50">
                        <option value="">Toutes fonctions</option>
                        {fonctions.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <select value={serviceFilter} onChange={(e) => handleFilterChange('service_id', e.target.value)}
                        className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none focus:border-violet-500/50">
                        <option value="">Tous les services</option>
                        {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                    <select value={statutFilter} onChange={(e) => handleFilterChange('statut', e.target.value)}
                        className="h-10 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-white outline-none focus:border-violet-500/50">
                        <option value="">Tous les statuts</option>
                        {statuts.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.get('/admin/utilisateurs/export')}
                        className="flex h-10 items-center gap-2 rounded-xl border border-[#1F1F28] bg-[#16161D] px-4 text-sm text-[#A1A1AA] transition-colors hover:border-violet-500/30 hover:text-white"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Exporter
                    </button>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Nouvel utilisateur
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#1F1F28] bg-[#16161D]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F1F28] bg-[#0F0F12]">
                                {['Utilisateur', 'Contact', 'Fonction', 'Service', 'Statut', 'Embauche', 'Actions'].map((h, i) => (
                                    <th key={h} className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#71717A] ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F1F28]">
                            {users.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#71717A]">Aucun utilisateur trouvé</td>
                                </tr>
                            ) : users.data.map((user) => (
                                <tr key={user.id} className="transition-colors hover:bg-[#1F1F28]/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                                                {user.lastname?.[0]}{user.name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {user.fonction === 'Médecin' ? 'Dr. ' : ''}{user.lastname} {user.name}
                                                </p>
                                                <p className="text-xs text-[#71717A]">{user.matricule}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-white">{user.email}</p>
                                        <p className="text-xs text-[#71717A]">{user.telephone || '—'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <FonctionBadge fonction={user.fonction} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#A1A1AA]">{user.service?.nom || '—'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => openStatutModal(user)}>
                                            <StatutBadge statut={user.statut} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#71717A]">{formatDate(user.date_embauche)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openViewModal(user)}
                                                className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-[#1F1F28] hover:text-white" title="Voir">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button onClick={() => openEditModal(user)}
                                                className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-[#1F1F28] hover:text-white" title="Modifier">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(user)}
                                                className="rounded-lg p-2 text-[#71717A] transition-colors hover:bg-red-500/10 hover:text-red-400" title="Supprimer">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3,6 5,6 21,6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#1F1F28] px-6 py-4">
                        <p className="text-sm text-[#71717A]">
                            Affichage de{' '}
                            <span className="font-medium text-white">{(users.current_page - 1) * users.per_page + 1}</span>
                            {' '}à{' '}
                            <span className="font-medium text-white">{Math.min(users.current_page * users.per_page, users.total)}</span>
                            {' '}sur{' '}
                            <span className="font-medium text-white">{users.total.toLocaleString()}</span> résultats
                        </p>
                        <div className="flex items-center gap-2">
                            {users.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-violet-500/20 font-medium text-violet-400'
                                            : link.url
                                            ? 'border border-[#1F1F28] text-[#71717A] hover:border-violet-500/30 hover:text-white'
                                            : 'cursor-not-allowed border border-[#1F1F28] text-[#71717A] opacity-40'
                                    }`}
                                    preserveState
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ============================================== */}
            {/* MODAL : VOIR */}
            {/* ============================================== */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-2xl border border-[#1F1F28] bg-[#16161D] shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1F1F28] bg-[#16161D] px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-lg font-bold text-white">
                                    {selectedUser.lastname?.[0]}{selectedUser.name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">
                                        {selectedUser.fonction === 'Médecin' ? 'Dr. ' : ''}{selectedUser.lastname} {selectedUser.name}
                                    </h2>
                                    <p className="text-sm text-[#71717A]">{selectedUser.matricule}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatutBadge statut={selectedUser.statut} />
                                <button onClick={() => setShowViewModal(false)}
                                    className="rounded-full p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A]">Informations professionnelles</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Fonction"       value={selectedUser.fonction} />
                                    <InfoItem label="Spécialité"     value={selectedUser.specialite} />
                                    <InfoItem label="Service"        value={selectedUser.service?.nom} />
                                    <InfoItem label="Date d'embauche" value={formatDate(selectedUser.date_embauche)} />
                                    <InfoItem label="Rôle système"   value={selectedUser.role} />
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A]">Coordonnées</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Email"      value={selectedUser.email} />
                                    <InfoItem label="Téléphone"  value={selectedUser.telephone} />
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#1F1F28] bg-[#16161D] px-6 py-4">
                            <button onClick={() => setShowViewModal(false)}
                                className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] transition-colors hover:text-white">
                                Fermer
                            </button>
                            <button onClick={() => { setShowViewModal(false); openEditModal(selectedUser); }}
                                className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20">
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================== */}
            {/* MODAL : NOUVEAU */}
            {/* ============================================== */}
            {showNewModal && (
                <UserFormModal
                    title="Nouvel utilisateur"
                    subtitle="Créer un nouveau compte"
                    form={createForm}
                    fonctions={fonctions}
                    services={services}
                    statuts={statuts}
                    roles={roles}
                    onSubmit={handleCreate}
                    onClose={() => setShowNewModal(false)}
                    submitLabel="Créer l'utilisateur"
                />
            )}

            {/* ============================================== */}
            {/* MODAL : ÉDITER */}
            {/* ============================================== */}
            {showEditModal && selectedUser && (
                <UserFormModal
                    title="Modifier l'utilisateur"
                    subtitle={`${selectedUser.lastname} ${selectedUser.name} • ${selectedUser.matricule}`}
                    form={editForm}
                    fonctions={fonctions}
                    services={services}
                    statuts={statuts}
                    roles={roles}
                    onSubmit={handleUpdate}
                    onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
                    submitLabel="Mettre à jour"
                    isEdit
                />
            )}

            {/* ============================================== */}
            {/* MODAL : CHANGER STATUT */}
            {/* ============================================== */}
            {showStatutModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-[#1F1F28] bg-[#16161D] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#1F1F28] px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Changer le statut</h2>
                                <p className="text-sm text-[#71717A]">{selectedUser.lastname} {selectedUser.name}</p>
                            </div>
                            <button onClick={() => setShowStatutModal(false)}
                                className="rounded-full p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleChangeStatut} className="p-6">
                            <div className="space-y-3">
                                {statuts.map((statut) => (
                                    <label key={statut}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                                            statutForm.data.statut === statut
                                                ? 'border-violet-500/50 bg-violet-500/10'
                                                : 'border-[#1F1F28] hover:bg-[#1F1F28]'
                                        }`}>
                                        <input type="radio" name="statut" value={statut}
                                            checked={statutForm.data.statut === statut}
                                            onChange={(e) => statutForm.setData('statut', e.target.value)}
                                            className="h-4 w-4 text-violet-500 focus:ring-violet-500" />
                                        <StatutBadge statut={statut} />
                                    </label>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowStatutModal(false)}
                                    className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] transition-colors hover:text-white">
                                    Annuler
                                </button>
                                <button type="submit" disabled={statutForm.processing}
                                    className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">
                                    {statutForm.processing ? 'Mise à jour...' : 'Confirmer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

/* ============================================== */
/* COMPOSANT : FORMULAIRE (RÉUTILISABLE) */
/* ============================================== */
interface UserFormModalProps {
    title: string;
    subtitle: string;
    form: any;
    fonctions: string[];
    services: Service[];
    statuts: string[];
    roles: string[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
    isEdit?: boolean;
}

function UserFormModal({ title, subtitle, form, fonctions, services, statuts, roles, onSubmit, onClose, submitLabel, isEdit = false }: UserFormModalProps) {
    const inputCls = (err?: string) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-white outline-none bg-[#0F0F12] placeholder-[#52525B] ${
            err ? 'border-red-500/60 focus:border-red-500' : 'border-[#1F1F28] focus:border-violet-500/50'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl border border-[#1F1F28] bg-[#16161D] shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1F1F28] bg-[#16161D] px-6 py-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <p className="text-sm text-[#71717A]">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#71717A] hover:bg-[#1F1F28] hover:text-white">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6">
                    {/* Informations personnelles */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A]">Informations personnelles</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Nom *</label>
                                <input type="text" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)}
                                    className={inputCls(form.errors.name)} placeholder="Nom de famille" />
                                {form.errors.name && <p className="mt-1 text-xs text-red-400">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Prénom *</label>
                                <input type="text" value={form.data.lastname} onChange={(e) => form.setData('lastname', e.target.value)}
                                    className={inputCls(form.errors.lastname)} placeholder="Prénom" />
                                {form.errors.lastname && <p className="mt-1 text-xs text-red-400">{form.errors.lastname}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Email *</label>
                                <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)}
                                    className={inputCls(form.errors.email)} placeholder="prenom.nom@medicare.cm" />
                                {form.errors.email && <p className="mt-1 text-xs text-red-400">{form.errors.email}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">
                                    Mot de passe {!isEdit && '*'}
                                </label>
                                <input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)}
                                    className={inputCls(form.errors.password)}
                                    placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Minimum 8 caractères'} />
                                {form.errors.password && <p className="mt-1 text-xs text-red-400">{form.errors.password}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Téléphone</label>
                                <input type="tel" value={form.data.telephone} onChange={(e) => form.setData('telephone', e.target.value)}
                                    className={inputCls()} placeholder="+237 6XX XXX XXX" />
                            </div>
                        </div>
                    </div>

                    {/* Informations professionnelles */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A]">Informations professionnelles</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Fonction *</label>
                                <select value={form.data.fonction} onChange={(e) => form.setData('fonction', e.target.value)}
                                    className={inputCls(form.errors.fonction)}>
                                    <option value="">Sélectionner...</option>
                                    {fonctions.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                                {form.errors.fonction && <p className="mt-1 text-xs text-red-400">{form.errors.fonction}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Rôle système</label>
                                <select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}
                                    className={inputCls()}>
                                    <option value="">Sélectionner...</option>
                                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Spécialité</label>
                                <input type="text" value={form.data.specialite} onChange={(e) => form.setData('specialite', e.target.value)}
                                    className={inputCls()} placeholder="Ex: Cardiologie interventionnelle" />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Service</label>
                                <select value={form.data.service_id} onChange={(e) => form.setData('service_id', e.target.value)}
                                    className={inputCls()}>
                                    <option value="">Sélectionner...</option>
                                    {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Date d'embauche</label>
                                <input type="date" value={form.data.date_embauche} onChange={(e) => form.setData('date_embauche', e.target.value)}
                                    className={inputCls()} />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#A1A1AA]">Statut</label>
                                <select value={form.data.statut} onChange={(e) => form.setData('statut', e.target.value)}
                                    className={inputCls()}>
                                    {statuts.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-[#1F1F28] pt-6">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-[#1F1F28] px-6 py-2.5 text-sm text-[#A1A1AA] transition-colors hover:border-[#2F2F3A] hover:text-white">
                            Annuler
                        </button>
                        <button type="submit" disabled={form.processing}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 disabled:opacity-50">
                            {form.processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}