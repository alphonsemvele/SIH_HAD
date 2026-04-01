import { Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface User {
    id: number;
    name: string;
    lastname: string;
    matricule: string;
}

interface Lit {
    id: number;
    numero: string;
}

interface Service {
    id: number;
    code: string;
    nom: string;
    description: string | null;
    chef_service_id: number | null;
    chef_service: User | null;
    etage: string | null;
    batiment: string | null;
    telephone: string | null;
    email: string | null;
    capacite_lits: number | null;
    actif: boolean;
    users: User[];
    lits: Lit[];
    created_at: string;
    updated_at: string;
}

interface PaginatedData {
    data: Service[];
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
    totalLits: number;
    totalPersonnel: number;
}

interface Props {
    services: PaginatedData;
    stats: Stats;
    filters: {
        search?: string;
        actif?: string;
        batiment?: string;
    };
    batiments: string[];
    medecins: User[];
}

function StatusBadge({ actif }: { actif: boolean }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            actif 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
            {actif ? 'Actif' : 'Inactif'}
        </span>
    );
}

function InfoItem({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div>
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</p>
            <p className="mt-1 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                {value ?? '—'}
            </p>
        </div>
    );
}

// Couleurs pour les avatars des services
const serviceColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-cyan-500',
];

function getServiceColor(id: number): string {
    return serviceColors[id % serviceColors.length];
}

export default function ServicesPage({ services, stats, filters, batiments, medecins }: Props) {
    const [showNewModal, setShowNewModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [actifFilter, setActifFilter] = useState(filters.actif || '');
    const [batimentFilter, setBatimentFilter] = useState(filters.batiment || '');

    // Formulaire de création
    const createForm = useForm({
        nom: '',
        description: '',
        chef_service_id: '',
        etage: '',
        batiment: '',
        telephone: '',
        email: '',
        capacite_lits: '',
        actif: true,
    });

    // Formulaire d'édition
    const editForm = useForm({
        nom: '',
        description: '',
        chef_service_id: '',
        etage: '',
        batiment: '',
        telephone: '',
        email: '',
        capacite_lits: '',
        actif: true,
    });

    // Recherche
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/services', { search, actif: actifFilter, batiment: batimentFilter }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: any = { search, actif: actifFilter, batiment: batimentFilter };
        params[key] = value;
        
        if (key === 'actif') setActifFilter(value);
        if (key === 'batiment') setBatimentFilter(value);
        
        router.get('/services', params, { preserveState: true });
    };

    // Création
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/services', {
            onSuccess: () => {
                createForm.reset();
                setShowNewModal(false);
            },
        });
    };

    // Ouvrir modal Voir
    const openViewModal = (service: Service) => {
        setSelectedService(service);
        setShowViewModal(true);
    };

    // Ouvrir modal Éditer
    const openEditModal = (service: Service) => {
        setSelectedService(service);
        editForm.setData({
            nom: service.nom || '',
            description: service.description || '',
            chef_service_id: service.chef_service_id?.toString() || '',
            etage: service.etage || '',
            batiment: service.batiment || '',
            telephone: service.telephone || '',
            email: service.email || '',
            capacite_lits: service.capacite_lits?.toString() || '',
            actif: service.actif,
        });
        setShowEditModal(true);
    };

    // Mise à jour
    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedService) {
            editForm.put(`/services/${selectedService.id}`, {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedService(null);
                },
            });
        }
    };

    // Toggle statut
    const handleToggleStatus = (service: Service) => {
        router.patch(`/services/${service.id}/toggle-status`);
    };

    // Suppression
    const handleDelete = (service: Service) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.nom}" ?`)) {
            router.delete(`/services/${service.id}`);
        }
    };

    return (
        <DashboardLayout title="Services" subtitle="Gestion des services de l'établissement">
            {/* Header Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un service..."
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#A1A09A] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:focus:border-[#FF4433] dark:focus:ring-[#FF4433]"
                    />
                    <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </form>

                {/* Filters & Add Button */}
                <div className="flex flex-wrap items-center gap-3">
                    <select 
                        value={actifFilter}
                        onChange={(e) => handleFilterChange('actif', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="true">Actifs</option>
                        <option value="false">Inactifs</option>
                    </select>
                    {batiments.length > 0 && (
                        <select 
                            value={batimentFilter}
                            onChange={(e) => handleFilterChange('batiment', e.target.value)}
                            className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                        >
                            <option value="">Tous les bâtiments</option>
                            {batiments.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    )}
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Nouveau service
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff2f2] dark:bg-[#1D0002]">
                            <svg className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" viewBox="0 0 24 24" fill="none">
                                <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3M9 7H10M9 11H10M14 7H15M14 11H15M9 21V16C9 15.4477 9.44772 15 10 15H14C14.5523 15 15 15.4477 15 16V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total services</p>
                            <p className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{stats.total}</p>
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
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Services actifs</p>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">{stats.actifs}</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                                <path d="M2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V8C22 6.89543 21.1046 6 20 6H12L10 4H4C2.89543 4 2 4.89543 2 6V4Z" stroke="currentColor" strokeWidth="1.5"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Capacité totale</p>
                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{stats.totalLits} lits</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 24 24" fill="none">
                                <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                <path d="M16 3.13C17.7699 3.58317 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Personnel affecté</p>
                            <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">{stats.totalPersonnel}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid de services */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.data.length === 0 ? (
                    <div className="col-span-full rounded-xl border border-[#e3e3e0] bg-white p-12 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <svg className="mx-auto h-12 w-12 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                            <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 5V21M19 21H5M19 21H21M5 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <p className="mt-4 text-[#706f6c] dark:text-[#A1A09A]">Aucun service trouvé</p>
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03]"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            Créer un service
                        </button>
                    </div>
                ) : (
                    services.data.map((service) => (
                        <div
                            key={service.id}
                            className="group rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]"
                        >
                            {/* Header */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${getServiceColor(service.id)}`}>
                                        {service.nom.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{service.nom}</h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{service.code}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleToggleStatus(service)} className="transition-transform hover:scale-105">
                                    <StatusBadge actif={service.actif} />
                                </button>
                            </div>

                            {/* Description */}
                            {service.description && (
                                <p className="mb-4 text-sm text-[#706f6c] line-clamp-2 dark:text-[#A1A09A]">
                                    {service.description}
                                </p>
                            )}

                            {/* Infos */}
                            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-[#706f6c] dark:text-[#A1A09A]">
                                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="1.5"/>
                                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    <span className="truncate">{service.batiment || 'Non défini'}{service.etage ? `, ${service.etage}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#706f6c] dark:text-[#A1A09A]">
                                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M2 4V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V8C22 6.89543 21.1046 6 20 6H12L10 4H4C2.89543 4 2 4.89543 2 6V4Z" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    <span>{service.capacite_lits || 0} lits</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#706f6c] dark:text-[#A1A09A]">
                                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                    <span>{service.users?.length || 0} personnel</span>
                                </div>
                                {service.telephone && (
                                    <div className="flex items-center gap-2 text-[#706f6c] dark:text-[#A1A09A]">
                                        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                            <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.33 21.02 19.67 21.02 19 20.97C10.16 20.97 3 13.81 3 4.97C2.97 4.33 2.97 3.67 3.02 3C3.06 2.44 3.51 2 4.07 2H7.07C7.56 2 7.98 2.35 8.07 2.83C8.15 3.29 8.27 3.75 8.43 4.18C8.57 4.56 8.48 4.98 8.21 5.25L6.85 6.61C8.08 8.84 9.91 10.67 12.14 11.9L13.5 10.54C13.77 10.27 14.19 10.18 14.57 10.32C15 10.48 15.46 10.6 15.92 10.68C16.4 10.77 16.75 11.19 16.75 11.68V14.68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        <span className="truncate">{service.telephone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Chef de service */}
                            {service.chef_service && (
                                <div className="mb-4 rounded-lg border border-[#e3e3e0] bg-[#f5f5f3] p-3 dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Chef de service</p>
                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        Dr. {service.chef_service.name} {service.chef_service.lastname}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                                <button
                                    onClick={() => openViewModal(service)}
                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                    title="Voir"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => openEditModal(service)}
                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                    title="Modifier"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(service)}
                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    title="Supprimer"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {services.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Affichage de <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{(services.current_page - 1) * services.per_page + 1}</span> à <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{Math.min(services.current_page * services.per_page, services.total)}</span> sur <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{services.total}</span> services
                    </p>
                    <div className="flex items-center gap-2">
                        {services.links.map((link, index) => (
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

            {/* ============================================== */}
            {/* MODAL : VOIR LE SERVICE */}
            {/* ============================================== */}
            {showViewModal && selectedService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="flex items-center gap-4">
                                <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white ${getServiceColor(selectedService.id)}`}>
                                    {selectedService.nom.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {selectedService.nom}
                                    </h2>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {selectedService.code}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge actif={selectedService.actif} />
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
                            {/* Description */}
                            {selectedService.description && (
                                <div>
                                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                        Description
                                    </h3>
                                    <p className="text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {selectedService.description}
                                    </p>
                                </div>
                            )}

                            {/* Localisation */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Localisation
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Bâtiment" value={selectedService.batiment} />
                                    <InfoItem label="Étage" value={selectedService.etage} />
                                </div>
                            </div>

                            {/* Capacité */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Capacité
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Capacité lits" value={selectedService.capacite_lits} />
                                    <InfoItem label="Personnel affecté" value={selectedService.users?.length || 0} />
                                </div>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Contact
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Téléphone" value={selectedService.telephone} />
                                    <InfoItem label="Email" value={selectedService.email} />
                                </div>
                            </div>

                            {/* Chef de service */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Chef de service
                                </h3>
                                {selectedService.chef_service ? (
                                    <div className="flex items-center gap-3 rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                                            {selectedService.chef_service.name[0]}{selectedService.chef_service.lastname[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Dr. {selectedService.chef_service.name} {selectedService.chef_service.lastname}
                                            </p>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                {selectedService.chef_service.matricule}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">Aucun chef de service assigné</p>
                                )}
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
                                    openEditModal(selectedService);
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
            {/* MODAL : NOUVEAU SERVICE */}
            {/* ============================================== */}
            {showNewModal && (
                <ServiceFormModal
                    title="Nouveau service"
                    subtitle="Création d'un nouveau service"
                    form={createForm}
                    medecins={medecins}
                    onSubmit={handleCreate}
                    onClose={() => setShowNewModal(false)}
                    submitLabel="Créer le service"
                />
            )}

            {/* ============================================== */}
            {/* MODAL : ÉDITER SERVICE */}
            {/* ============================================== */}
            {showEditModal && selectedService && (
                <ServiceFormModal
                    title="Modifier le service"
                    subtitle={`${selectedService.nom} • ${selectedService.code}`}
                    form={editForm}
                    medecins={medecins}
                    onSubmit={handleUpdate}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedService(null);
                    }}
                    submitLabel="Mettre à jour"
                />
            )}
        </DashboardLayout>
    );
}

/* ============================================== */
/* COMPOSANT : FORMULAIRE SERVICE (RÉUTILISABLE) */
/* ============================================== */
interface ServiceFormModalProps {
    title: string;
    subtitle: string;
    form: any;
    medecins: User[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
}

function ServiceFormModal({ title, subtitle, form, medecins, onSubmit, onClose, submitLabel }: ServiceFormModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
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
                    {/* Section: Informations générales */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Informations générales
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Nom */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom du service *</label>
                                <input
                                    type="text"
                                    value={form.data.nom}
                                    onChange={(e) => form.setData('nom', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.nom 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                    placeholder="ex: Cardiologie, Urgences, Maternité"
                                />
                                {form.errors.nom && <p className="mt-1 text-xs text-red-500">{form.errors.nom}</p>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Description</label>
                                <textarea
                                    rows={3}
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Description des activités et spécialités du service..."
                                />
                            </div>

                            {/* Chef de service */}
                            <div className="md:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Chef de service</label>
                                <select
                                    value={form.data.chef_service_id}
                                    onChange={(e) => form.setData('chef_service_id', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    <option value="">Sélectionner un médecin...</option>
                                    {medecins.map((m) => (
                                        <option key={m.id} value={m.id}>Dr. {m.name} {m.lastname} ({m.matricule})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Localisation */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Localisation
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Bâtiment */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Bâtiment</label>
                                <input
                                    type="text"
                                    value={form.data.batiment}
                                    onChange={(e) => form.setData('batiment', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="ex: Bâtiment A, Aile Nord"
                                />
                            </div>

                            {/* Étage */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Étage</label>
                                <input
                                    type="text"
                                    value={form.data.etage}
                                    onChange={(e) => form.setData('etage', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="ex: RDC, 1er étage, 2ème étage"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Contact & Capacité */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Contact & Capacité
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Téléphone */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone</label>
                                <input
                                    type="tel"
                                    value={form.data.telephone}
                                    onChange={(e) => form.setData('telephone', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="+237 XXX XXX XXX"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.email 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                    placeholder="service@medicare.cm"
                                />
                                {form.errors.email && <p className="mt-1 text-xs text-red-500">{form.errors.email}</p>}
                            </div>

                            {/* Capacité lits */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Capacité (lits)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.data.capacite_lits}
                                    onChange={(e) => form.setData('capacite_lits', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="0"
                                />
                            </div>

                            {/* Statut */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Statut</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="actif"
                                            checked={form.data.actif === true}
                                            onChange={() => form.setData('actif', true)}
                                            className="h-4 w-4 text-[#f53003] focus:ring-[#f53003]"
                                        />
                                        <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">Actif</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="actif"
                                            checked={form.data.actif === false}
                                            onChange={() => form.setData('actif', false)}
                                            className="h-4 w-4 text-[#f53003] focus:ring-[#f53003]"
                                        />
                                        <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">Inactif</span>
                                    </label>
                                </div>
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