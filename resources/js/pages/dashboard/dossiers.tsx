import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Patient {
    id: number;
    numero_dossier: string;
    nom: string;
    prenom: string;
    sexe: 'M' | 'F';
    date_naissance: string;
    telephone: string | null;
}

interface DossierMedical {
    id: number;
    patient_id: number;
    numero_dossier_medical: string;
    date_ouverture: string;
    groupe_sanguin: string | null;
    allergies_confirmees: string[] | null;
    antecedents_medicaux: string[] | null;
    maladies_chroniques: string[] | null;
    statut: 'Actif' | 'Archivé' | 'Transféré';
    created_at: string;
    updated_at: string;
    patient: Patient;
    entrees_count?: number;
    derniere_entree?: {
        id: number;
        type: string;
        diagnostic: string | null;
        medecin?: {
            id: number;
            name: string;
        };
        date_entree: string;
    };
}

interface PaginatedData {
    data: DossierMedical[];
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
    archives: number;
    mis_a_jour_aujourdhui: number;
}

interface Props {
    dossiers: PaginatedData;
    stats?: Stats;           // Made optional to match reality
    patients: Patient[];
    medecins: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        statut?: string;
        medecin_id?: string;
    };
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Actif: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Archivé: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        Transféré: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.Actif}`}>
            {status}
        </span>
    );
}

export default function Dossiers({ 
    dossiers, 
    stats,                  // can be undefined — we handle it safely now
    patients = [], 
    medecins = [], 
    filters = {}  
}: Props) {
    // Debug: see what actually arrives from Laravel
    console.log("Dossiers page props:", { 
        dossiersCount: dossiers?.data?.length, 
        hasStats: !!stats, 
        stats 
    });

    const [showNewDossierModal, setShowNewDossierModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'existant' | 'nouveau'>('existant');
    const [search, setSearch] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || '');
    const [medecinFilter, setMedecinFilter] = useState(filters.medecin_id || '');

    // Recherche patient existant
    const [searchPatient, setSearchPatient] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');

    const filteredPatients = patients.filter(p =>
        `${p.nom} ${p.prenom}`.toLowerCase().includes(searchPatient.toLowerCase()) ||
        (p.telephone && p.telephone.includes(searchPatient)) ||
        p.numero_dossier.toLowerCase().includes(searchPatient.toLowerCase())
    );

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    // Formulaire pour nouveau patient + dossier
    const newPatientForm = useForm({
        nom: '',
        prenom: '',
        sexe: 'M' as 'M' | 'F',
        date_naissance: '',
        telephone: '',
    });

    // Recherche et filtres
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dossiers-medicaux', { search, statut: statutFilter, medecin_id: medecinFilter }, { preserveState: true });
    };

    const handleFilterChange = (key: string, value: string) => {
        const params: Record<string, string> = { search, statut: statutFilter, medecin_id: medecinFilter };
        params[key] = value;
        
        if (key === 'statut') setStatutFilter(value);
        if (key === 'medecin_id') setMedecinFilter(value);
        
        router.get('/dossiers-medicaux', params, { preserveState: true });
    };

    // Création dossier pour patient existant
    const handleCreateForExisting = () => {
        if (!selectedPatientId) {
            alert('Veuillez sélectionner un patient');
            return;
        }
        router.get(`/patients/${selectedPatientId}/dossier-medical`);
        setShowNewDossierModal(false);
    };

    // Création nouveau patient (le dossier sera créé automatiquement)
    const handleCreateNewPatient = (e: React.FormEvent) => {
        e.preventDefault();
        newPatientForm.post('/patients', {
            onSuccess: () => {
                newPatientForm.reset();
                setShowNewDossierModal(false);
            },
        });
    };

    // Formater la date
    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <DashboardLayout title="Dossiers médicaux" subtitle="Gestion des dossiers patients informatisés (DPI)">
            {/* Header Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher par N° dossier, patient..."
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#A1A09A] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:focus:border-[#FF4433] dark:focus:ring-[#FF4433]"
                    />
                    <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </form>

                {/* Filters & Add Button */}
                <div className="flex items-center gap-3">
                    <select
                        value={statutFilter}
                        onChange={(e) => handleFilterChange('statut', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="Actif">Actif</option>
                        <option value="Archivé">Archivé</option>
                        <option value="Transféré">Transféré</option>
                    </select>

                    <select
                        value={medecinFilter}
                        onChange={(e) => handleFilterChange('medecin_id', e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les médecins</option>
                        {medecins.map((medecin) => (
                            <option key={medecin.id} value={medecin.id}>{medecin.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => setShowNewDossierModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Nouveau dossier
                    </button>
                </div>
            </div>

            {/* Stats – SAFE ACCESS ADDED */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fff2f2] dark:bg-[#1D0002]">
                            <svg className="h-5 w-5 text-[#f53003] dark:text-[#FF4433]" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total dossiers</p>
                            <p className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                {stats?.total?.toLocaleString() ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <svg className="h-5 w-5 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none">
                                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Dossiers actifs</p>
                            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                                {stats?.actifs?.toLocaleString() ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none">
                                <path d="M21 8V21H3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M23 3H1V8H23V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Archivés</p>
                            <p className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                {stats?.archives?.toLocaleString() ?? '—'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none">
                                <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Mis à jour aujourd'hui</p>
                            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                {stats?.mis_a_jour_aujourdhui ?? '—'}
                            </p>
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
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">N° Dossier</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Dernier diagnostic</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Groupe sanguin</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Date ouverture</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Entrées</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {dossiers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                        Aucun dossier médical trouvé
                                    </td>
                                </tr>
                            ) : (
                                dossiers.data.map((dossier) => (
                                    <tr key={dossier.id} className="transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-[#f53003] dark:text-[#FF4433]">
                                                {dossier.numero_dossier_medical}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium text-white ${dossier.patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                    {dossier.patient.prenom[0]}{dossier.patient.nom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        {dossier.patient.nom} {dossier.patient.prenom}
                                                    </p>
                                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                        {dossier.patient.numero_dossier}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                {dossier.derniere_entree?.diagnostic || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {dossier.groupe_sanguin ? (
                                                <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                    {dossier.groupe_sanguin}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                {formatDate(dossier.date_ouverture)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="h-4 w-4 text-[#706f6c] dark:text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                                <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    {dossier.entrees_count || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={dossier.statut} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/patients/${dossier.patient_id}/dossier-medical`}
                                                    className="group relative rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Voir le dossier"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </Link>

                                                <Link
                                                    href={`/patients/${dossier.patient_id}/dossier-medical`}
                                                    className="group relative rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Historique"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </Link>

                                                <Link
                                                    href={`/patients/${dossier.patient_id}`}
                                                    className="group relative rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Fiche patient"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                                    </svg>
                                                </Link>

                                                <button
                                                    className="group relative rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Imprimer"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M6 18H4C3.46957 18 2.96086 17.7893 2.58579 17.4142C2.21071 17.0391 2 16.5304 2 16V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H20C20.5304 9 21.0391 9.21071 21.4142 9.58579C21.7893 9.96086 22 10.4696 22 11V16C22 16.5304 21.7893 17.0391 21.4142 17.4142C21.0391 17.7893 20.5304 18 20 18H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                {dossiers.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Affichage de <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{(dossiers.current_page - 1) * dossiers.per_page + 1}</span> à{' '}
                            <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{Math.min(dossiers.current_page * dossiers.per_page, dossiers.total)}</span> sur{' '}
                            <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{dossiers.total.toLocaleString()}</span> dossiers
                        </p>
                        <div className="flex items-center gap-2">
                            {dossiers.links.map((link, index) => (
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

            {/* MODAL : NOUVEAU DOSSIER */}
            {showNewDossierModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Nouveau dossier médical</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Sélectionnez un patient ou créez-en un nouveau</p>
                            </div>
                            <button
                                onClick={() => setShowNewDossierModal(false)}
                                className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <button
                                onClick={() => setActiveTab('existant')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                    activeTab === 'existant'
                                        ? 'border-b-2 border-[#f53003] text-[#f53003] dark:border-[#FF4433] dark:text-[#FF4433]'
                                        : 'text-[#706f6c] hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]'
                                }`}
                            >
                                Patient existant
                            </button>
                            <button
                                onClick={() => setActiveTab('nouveau')}
                                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                                    activeTab === 'nouveau'
                                        ? 'border-b-2 border-[#f53003] text-[#f53003] dark:border-[#FF4433] dark:text-[#FF4433]'
                                        : 'text-[#706f6c] hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]'
                                }`}
                            >
                                Nouveau patient
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'existant' ? (
                                <div className="space-y-6">
                                    {/* Recherche */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Rechercher patient par nom, prénom ou N° dossier..."
                                            value={searchPatient}
                                            onChange={(e) => setSearchPatient(e.target.value)}
                                            className="w-full rounded-lg border border-[#e3e3e0] bg-white py-3 pl-10 pr-4 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                        />
                                        <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                    </div>

                                    {/* Liste des patients */}
                                    <div className="max-h-64 overflow-y-auto border border-[#e3e3e0] rounded-lg divide-y divide-[#e3e3e0] dark:border-[#3E3E3A] dark:divide-[#3E3E3A]">
                                        {filteredPatients.length === 0 ? (
                                            <p className="p-8 text-center text-[#706f6c] dark:text-[#A1A09A]">Aucun patient trouvé</p>
                                        ) : (
                                            filteredPatients.map((patient) => (
                                                <button
                                                    key={patient.id}
                                                    type="button"
                                                    onClick={() => setSelectedPatientId(patient.id)}
                                                    className={`w-full flex items-center gap-4 p-4 hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A] ${
                                                        selectedPatientId === patient.id ? 'bg-[#fff5f5] dark:bg-[#2a0000]' : ''
                                                    }`}
                                                >
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                        {patient.prenom?.[0] || '?'}{patient.nom?.[0] || '?'}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                            {patient.nom} {patient.prenom}
                                                        </p>
                                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                            {patient.numero_dossier} • {patient.date_naissance ? formatDate(patient.date_naissance) : 'Date inconnue'}
                                                            {patient.telephone && ` • ${patient.telephone}`}
                                                        </p>
                                                    </div>
                                                    {selectedPatientId === patient.id && (
                                                        <svg className="h-5 w-5 text-[#f53003]" viewBox="0 0 24 24" fill="none">
                                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {selectedPatient && (
                                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                            <p className="font-medium text-green-800 dark:text-green-300">
                                                Patient sélectionné : {selectedPatient.nom} {selectedPatient.prenom}
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                Le dossier médical a été créé automatiquement avec ce patient.
                                            </p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex justify-end gap-4 pt-4 border-t border-[#e3e3e0] dark:border-[#3E3E3A]">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewDossierModal(false)}
                                            className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleCreateForExisting}
                                            disabled={!selectedPatientId}
                                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50 dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            Voir le dossier
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateNewPatient} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom *</label>
                                            <input
                                                type="text"
                                                value={newPatientForm.data.nom}
                                                onChange={(e) => newPatientForm.setData('nom', e.target.value)}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                                required
                                            />
                                            {newPatientForm.errors.nom && <p className="mt-1 text-xs text-red-500">{newPatientForm.errors.nom}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Prénom *</label>
                                            <input
                                                type="text"
                                                value={newPatientForm.data.prenom}
                                                onChange={(e) => newPatientForm.setData('prenom', e.target.value)}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                                required
                                            />
                                            {newPatientForm.errors.prenom && <p className="mt-1 text-xs text-red-500">{newPatientForm.errors.prenom}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Sexe *</label>
                                            <select
                                                value={newPatientForm.data.sexe}
                                                onChange={(e) => newPatientForm.setData('sexe', e.target.value as 'M' | 'F')}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                                required
                                            >
                                                <option value="M">Masculin</option>
                                                <option value="F">Féminin</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date de naissance *</label>
                                            <input
                                                type="date"
                                                value={newPatientForm.data.date_naissance}
                                                onChange={(e) => newPatientForm.setData('date_naissance', e.target.value)}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                                required
                                            />
                                            {newPatientForm.errors.date_naissance && <p className="mt-1 text-xs text-red-500">{newPatientForm.errors.date_naissance}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone</label>
                                            <input
                                                type="tel"
                                                value={newPatientForm.data.telephone}
                                                onChange={(e) => newPatientForm.setData('telephone', e.target.value)}
                                                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                                placeholder="+237 6XX XXX XXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            <strong>Note :</strong> Le dossier médical sera créé automatiquement avec le nouveau patient.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-end gap-4 pt-4 border-t border-[#e3e3e0] dark:border-[#3E3E3A]">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewDossierModal(false)}
                                            className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={newPatientForm.processing}
                                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50 dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                                        >
                                            {newPatientForm.processing ? (
                                                <>
                                                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Création...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Créer patient + dossier
                                                </>
                                            )}
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