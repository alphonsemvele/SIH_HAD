import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Service {
    id: number;
    nom: string;
}

interface Personnel {
    id: number;
    matricule: string;
    name: string;
    lastname: string;
    fonction: string;
    specialite: string | null;
    service_id: number | null;
    service: Service | null;
    telephone: string | null;
    email: string;
    date_embauche: string | null;
    statut: 'actif' | 'conge' | 'mission' | 'inactif';
    role: string | null;
    avatar: string | null;
    created_at: string;
}

interface PaginatedData {
    data: Personnel[];
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
    medecins: number;
    infirmiers: number;
    enService: number;
    enConge: number;
}

interface Props {
    personnel: PaginatedData;
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

function FonctionBadge({ fonction }: { fonction: string }) {
    const styles: Record<string, string> = {
        'Médecin': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'Infirmière': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        'Infirmière Chef': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        'Sage-femme': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        'Pharmacien(ne)': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Technicien(ne)': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Administratif': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        'Admin': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-red-400',

    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[fonction] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>
            {fonction}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'actif': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'conge': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'mission': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        'inactif': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles['Inactif']}`}>
            {status}
        </span>
    );
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</p>
            <p className="mt-1 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                {value || '—'}
            </p>
        </div>
    );
}

export default function PersonnelPage({ personnel, stats, filters, statuts, fonctions, roles, services }: Props) {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatutModal, setShowStatutModal] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [fonctionFilter, setFonctionFilter] = useState(filters.fonction || '');
    const [serviceFilter, setServiceFilter] = useState(filters.service_id || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || '');

    // Formulaire de création
    const createForm = useForm({
        name: '',           
       lastname: '',       
        email: '',
        password: '',
        telephone: '',
        fonction: '',
        specialite: '',
        service_id: '',
        date_embauche: '',
        statut: 'actif',
        role: '',
    });

    // Formulaire d'édition
    const editForm = useForm({
          name: '',           
        lastname: '',       
        email: '',
        password: '',
        telephone: '',
        fonction: '',
        specialite: '',
        service_id: '',
        date_embauche: '',
        statut: 'actif',
        role: '',
    });

    // Formulaire de changement de statut
    const statutForm = useForm({
        statut: '',
    });

    // Recherche
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/personnel', { search, fonction: fonctionFilter, service_id: serviceFilter, statut: statutFilter }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { search, fonction: fonctionFilter, service_id: serviceFilter, statut: statutFilter };
        params[key] = value;
        
        if (key === 'fonction') setFonctionFilter(value);
        if (key === 'service_id') setServiceFilter(value);
        if (key === 'statut') setStatutFilter(value);
        
        router.get('/personnel', params, { preserveState: true });
    };

    // Création
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/personnel', {
            onSuccess: () => {
                createForm.reset();
                setShowNewModal(false);
            },
        });
    };

    // Ouvrir modal Voir
    const openViewModal = (agent: Personnel) => {
        setSelectedPersonnel(agent);
        setShowViewModal(true);
    };

    // Ouvrir modal Éditer
    const openEditModal = (agent: Personnel) => {
        setSelectedPersonnel(agent);
        editForm.setData({
            name: agent.name || '',
            lastname: agent.lastname || '',
            email: agent.email || '',
            password: '',
            telephone: agent.telephone || '',
            fonction: agent.fonction || '',
            specialite: agent.specialite || '',
            service_id: agent.service_id?.toString() || '',
            date_embauche: agent.date_embauche ? agent.date_embauche.split('T')[0] : '',
            statut: agent.statut || 'En service',
            role: agent.role || '',
        });
        setShowEditModal(true);
    };

    // Mise à jour
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPersonnel) {
            editForm.put(`/personnel/${selectedPersonnel.id}`, {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedPersonnel(null);
                },
            });
        }
    };

    // Ouvrir modal changement de statut
    const openStatutModal = (agent: Personnel) => {
        setSelectedPersonnel(agent);
        statutForm.setData('statut', agent.statut);
        setShowStatutModal(true);
    };

    // Changer le statut
    const handleChangeStatut = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPersonnel) {
            statutForm.put(`/personnel/${selectedPersonnel.id}`, {
                onSuccess: () => {
                    setShowStatutModal(false);
                    setSelectedPersonnel(null);
                },
            });
        }
    };

    // Désactivation
    const handleDeactivate = (agent: Personnel) => {
        if (confirm(`Êtes-vous sûr de vouloir désactiver ${agent.lastname} ${agent.name} ?`)) {
            router.delete(`/personnel/${agent.id}`);
        }
    };

    // Formater la date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <DashboardLayout title="Personnel médical" subtitle="Gestion du personnel de l'établissement">
            {/* Header Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par nom, matricule, spécialité..."
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#A1A09A] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:focus:border-[#FF4433] dark:focus:ring-[#FF4433]"
                    />
                    <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </form>

                {/* Filters & Add Button */}
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={fonctionFilter}
                        onChange={(e) => handleFilterChange('fonction', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Toutes fonctions</option>
                        {fonctions.map((f) => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <select 
                        value={serviceFilter}
                        onChange={(e) => handleFilterChange('service_id', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les services</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.nom}</option>
                        ))}
                    </select>
                    <select 
                        value={statutFilter}
                        onChange={(e) => handleFilterChange('statut', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les statuts</option>
                        {statuts.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Ajouter personnel
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff2f2] dark:bg-[#1D0002]">
                            <svg className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total personnel</p>
                            <p className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{stats.total.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Médecins</p>
                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{stats.medecins}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                            <svg className="h-5 w-5 text-pink-600 dark:text-pink-400" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Infirmiers</p>
                            <p className="text-xl font-semibold text-pink-600 dark:text-pink-400">{stats.infirmiers}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none">
                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">En service</p>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">{stats.enService}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" viewBox="0 0 24 24" fill="none">
                                <path d="M8 2V5M16 2V5M3 8H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">En congé</p>
                            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.enConge}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Personnel</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Fonction</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Spécialité</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {personnel.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                        Aucun personnel trouvé
                                    </td>
                                </tr>
                            ) : (
                                personnel.data.map((agent) => (
                                    <tr key={agent.id} className="transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white bg-blue-500">
                                                    {agent.lastname?.[0]}{agent.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        {agent.fonction === 'Médecin' ? 'Dr. ' : ''}{agent.lastname} {agent.name}
                                                    </p>
                                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{agent.matricule}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <FonctionBadge fonction={agent.fonction} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {agent.specialite || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                            {agent.service?.nom || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="text-[#1b1b18] dark:text-[#EDEDEC]">{agent.telephone || '—'}</p>
                                                <p className="text-[#706f6c] dark:text-[#A1A09A]">{agent.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => openStatutModal(agent)}>
                                                <StatusBadge status={agent.statut} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openViewModal(agent)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Voir profil"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(agent)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Modifier"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(agent)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                    title="Désactiver"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                                                        <path d="M4.93 4.93L19.07 19.07" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {personnel.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Affichage de <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{(personnel.current_page - 1) * personnel.per_page + 1}</span> à <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{Math.min(personnel.current_page * personnel.per_page, personnel.total)}</span> sur <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{personnel.total.toLocaleString()}</span> agents
                        </p>
                        <div className="flex items-center gap-2">
                            {personnel.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                        link.active
                                            ? 'bg-[#f53003] font-medium text-white'
                                            : link.url
                                            ? 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]'
                                            : 'cursor-not-allowed border border-[#e3e3e0] text-[#A1A09A] opacity-50 dark:border-[#3E3E3A]'
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
            {/* MODAL : VOIR LE PERSONNEL */}
            {/* ============================================== */}
            {showViewModal && selectedPersonnel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-medium text-white bg-blue-500">
                                    {selectedPersonnel.lastname?.[0]}{selectedPersonnel.name?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {selectedPersonnel.fonction === 'Médecin' ? 'Dr. ' : ''}{selectedPersonnel.lastname} {selectedPersonnel.name}
                                    </h2>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {selectedPersonnel.matricule}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selectedPersonnel.statut} />
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                >
                                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {/* Informations professionnelles */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Informations professionnelles
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Fonction" value={selectedPersonnel.fonction} />
                                    <InfoItem label="Spécialité" value={selectedPersonnel.specialite} />
                                    <InfoItem label="Service" value={selectedPersonnel.service?.nom} />
                                    <InfoItem label="Date d'embauche" value={formatDate(selectedPersonnel.date_embauche)} />
                                    <InfoItem label="Rôle système" value={selectedPersonnel.role} />
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Coordonnées
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Email" value={selectedPersonnel.email} />
                                    <InfoItem label="Téléphone" value={selectedPersonnel.telephone} />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 flex justify-end gap-4 border-t border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                            >
                                Fermer
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    openEditModal(selectedPersonnel);
                                }}
                                className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================== */}
            {/* MODAL : NOUVEAU PERSONNEL */}
            {/* ============================================== */}
            {showNewModal && (
                <PersonnelFormModal
                    title="Ajouter un membre du personnel"
                    subtitle="Enregistrement d'un nouveau collaborateur"
                    form={createForm}
                    fonctions={fonctions}
                    services={services}
                    statuts={statuts}
                    roles={roles}
                    onSubmit={handleCreate}
                    onClose={() => setShowNewModal(false)}
                    submitLabel="Enregistrer"
                />
            )}

            {/* ============================================== */}
            {/* MODAL : ÉDITER PERSONNEL */}
            {/* ============================================== */}
            {showEditModal && selectedPersonnel && (
                <PersonnelFormModal
                    title="Modifier le personnel"
                    subtitle={`${selectedPersonnel.lastname} ${selectedPersonnel.name} • ${selectedPersonnel.matricule}`}
                    form={editForm}
                    fonctions={fonctions}
                    services={services}
                    statuts={statuts}
                    roles={roles}
                    onSubmit={handleUpdate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedPersonnel(null);
                    }}
                    submitLabel="Mettre à jour"
                    isEdit
                />
            )}

            {/* ============================================== */}
            {/* MODAL : CHANGER LE STATUT */}
            {/* ============================================== */}
            {showStatutModal && selectedPersonnel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Changer le statut</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {selectedPersonnel.lastname} {selectedPersonnel.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowStatutModal(false)}
                                className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleChangeStatut} className="p-6">
                            <div className="space-y-3">
                                {statuts.map((statut) => (
                                    <label
                                        key={statut}
                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                                            statutForm.data.statut === statut
                                                ? 'border-[#f53003] bg-[#fff2f2] dark:border-[#FF4433] dark:bg-[#1D0002]'
                                                : 'border-[#e3e3e0] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A]'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="statut"
                                            value={statut}
                                            checked={statutForm.data.statut === statut}
                                            onChange={(e) => statutForm.setData('statut', e.target.value)}
                                            className="h-4 w-4 text-[#f53003] focus:ring-[#f53003]"
                                        />
                                        <StatusBadge status={statut} />
                                    </label>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowStatutModal(false)}
                                    className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={statutForm.processing}
                                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50 dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                                >
                                    {statutForm.processing ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

/* ============================================== */
/* COMPOSANT : FORMULAIRE PERSONNEL (RÉUTILISABLE) */
/* ============================================== */
interface PersonnelFormModalProps {
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

function PersonnelFormModal({ title, subtitle, form, fonctions, services, statuts, roles, onSubmit, onClose, submitLabel, isEdit = false }: PersonnelFormModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</h2>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                    >
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={onSubmit} className="p-6">
                    {/* Section: Informations personnelles */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Informations personnelles
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Nom */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom *</label>
                                <input
                                    type="text"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.nom 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                />
                                {form.errors.nom && <p className="mt-1 text-xs text-red-500">{form.errors.nom}</p>}
                            </div>

                            {/* Prénom */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Prénom *</label>
                                <input
                                    type="text"
                                    value={form.data.lastname}
                                    onChange={(e) => form.setData('lastname', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.prenom 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                />
                                {form.errors.prenom && <p className="mt-1 text-xs text-red-500">{form.errors.prenom}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Email *</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.email 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                    placeholder="prenom.nom@medicare.cm"
                                />
                                {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                            </div>

                            {/* Mot de passe */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Mot de passe {!isEdit && '*'}
                                </label>
                                <input
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.password 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                    placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Minimum 8 caractères'}
                                />
                                {form.errors.password && <p className="mt-1 text-xs text-red-500">{form.errors.password}</p>}
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone</label>
                                <input
                                    type="tel"
                                    value={form.data.telephone}
                                    onChange={(e) => form.setData('telephone', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="+237 6XX XXX XXX"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Informations professionnelles */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Informations professionnelles
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Fonction */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Fonction *</label>
                                <select
                                    value={form.data.fonction}
                                    onChange={(e) => form.setData('fonction', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.fonction 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                >
                                    <option value="">Sélectionner...</option>
                                    {fonctions.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                                {form.errors.fonction && <p className="mt-1 text-xs text-red-500">{form.errors.fonction}</p>}
                            </div>

                            {/* Spécialité */}
                          

                            {/* Service */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Service</label>
                                <select
                                    value={form.data.service_id}
                                    onChange={(e) => form.setData('service_id', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    <option value="">Sélectionner...</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>{s.nom}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date d'embauche */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date d'embauche</label>
                                <input
                                    type="date"
                                    value={form.data.date_embauche}
                                    onChange={(e) => form.setData('date_embauche', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                />
                            </div>

                            {/* Statut */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Statut</label>
                                <select
                                    value={form.data.statut}
                                    onChange={(e) => form.setData('statut', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    {statuts.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                           
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 flex justify-end gap-4 border-t border-[#e3e3e0] bg-white pt-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50 dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                        >
                            {form.processing ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {submitLabel}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}