import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Patient {
    id: number;
    numero_dossier: string;
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: 'M' | 'F';
    lieu_naissance: string | null;
    nationalite: string | null;
    cni: string | null;
    telephone: string | null;
    telephone_urgence: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    quartier: string | null;
    profession: string | null;
    situation_matrimoniale: string | null;
    groupe_sanguin: string | null;
    allergies: string[] | null;
    antecedents_medicaux: string[] | null;
    personne_contact_nom: string | null;
    personne_contact_telephone: string | null;
    personne_contact_lien: string | null;
    notes: string | null;
    statut: 'Hospitalisé' | 'Consultation' | 'Urgence' | 'Sortie';
    created_at: string;
    updated_at: string;
}

interface PaginatedData {
    data: Patient[];
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
    hospitalises: number;
    consultations: number;
    urgences: number;
}

interface Props {
    patients: PaginatedData;
    stats: Stats;
    filters: {
        search?: string;
        statut?: string;
    };
    statuts: string[];
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Hospitalisé: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Consultation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Urgence: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Sortie: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.Sortie}`}>
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

export default function Patients({ patients, stats, filters, statuts }: Props) {
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatutModal, setShowStatutModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [statutFilter, setStatutFilter] = useState(filters.statut || '');

    // Formulaire pour créer un patient
    const createForm = useForm({
        nom: '',
        prenom: '',
        sexe: 'M' as 'M' | 'F',
        date_naissance: '',
        lieu_naissance: '',
        nationalite: '',
        cni: '',
        telephone: '',
        telephone_urgence: '',
        email: '',
        adresse: '',
        ville: '',
        quartier: '',
        profession: '',
        situation_matrimoniale: '',
        groupe_sanguin: '',
        allergies: '',
        personne_contact_nom: '',
        personne_contact_telephone: '',
        personne_contact_lien: '',
        notes: '',
        statut: 'Consultation',
    });

    // Formulaire pour éditer un patient
    const editForm = useForm({
        nom: '',
        prenom: '',
        sexe: 'M' as 'M' | 'F',
        date_naissance: '',
        lieu_naissance: '',
        nationalite: '',
        cni: '',
        telephone: '',
        telephone_urgence: '',
        email: '',
        adresse: '',
        ville: '',
        quartier: '',
        profession: '',
        situation_matrimoniale: '',
        groupe_sanguin: '',
        allergies: '',
        personne_contact_nom: '',
        personne_contact_telephone: '',
        personne_contact_lien: '',
        notes: '',
        statut: 'Consultation',
    });

    // Formulaire pour changer le statut
    const statutForm = useForm({
        statut: '',
    });

    // Recherche et filtres
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/patients', { search, statut: statutFilter }, { preserveState: true });
    };

    const handleStatutFilterChange = (value: string) => {
        setStatutFilter(value);
        router.get('/patients', { search, statut: value }, { preserveState: true });
    };

    // Création d'un patient
    const handleCreatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/patients', {
            onSuccess: () => {
                createForm.reset();
                setShowNewPatientModal(false);
            },
        });
    };

    // Ouvrir modal Voir
    const openViewModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setShowViewModal(true);
    };

    // Ouvrir modal Éditer
    const openEditModal = (patient: Patient) => {
        setSelectedPatient(patient);
        editForm.setData({
            nom: patient.nom || '',
            prenom: patient.prenom || '',
            sexe: patient.sexe || 'M',
            date_naissance: patient.date_naissance ? patient.date_naissance.split('T')[0] : '',
            lieu_naissance: patient.lieu_naissance || '',
            nationalite: patient.nationalite || '',
            cni: patient.cni || '',
            telephone: patient.telephone || '',
            telephone_urgence: patient.telephone_urgence || '',
            email: patient.email || '',
            adresse: patient.adresse || '',
            ville: patient.ville || '',
            quartier: patient.quartier || '',
            profession: patient.profession || '',
            situation_matrimoniale: patient.situation_matrimoniale || '',
            groupe_sanguin: patient.groupe_sanguin || '',
            allergies: patient.allergies ? patient.allergies.join(', ') : '',
            personne_contact_nom: patient.personne_contact_nom || '',
            personne_contact_telephone: patient.personne_contact_telephone || '',
            personne_contact_lien: patient.personne_contact_lien || '',
            notes: patient.notes || '',
            statut: patient.statut || 'Consultation',
        });
        setShowEditModal(true);
    };

    // Mise à jour d'un patient
    const handleUpdatePatient = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPatient) {
            editForm.put(`/patients/${selectedPatient.id}`, {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedPatient(null);
                },
            });
        }
    };

    // Ouvrir modal changement de statut
    const openStatutModal = (patient: Patient) => {
        setSelectedPatient(patient);
        statutForm.setData('statut', patient.statut);
        setShowStatutModal(true);
    };

    // Changer le statut
    const handleChangeStatut = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPatient) {
            statutForm.put(`/patients/${selectedPatient.id}`, {
                onSuccess: () => {
                    setShowStatutModal(false);
                    setSelectedPatient(null);
                },
            });
        }
    };

    // Suppression d'un patient
    const handleDelete = (patient: Patient) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${patient.prenom} ${patient.nom} ?`)) {
            router.delete(`/patients/${patient.id}`);
        }
    };

    // Formater la date
    const formatDate = (dateString: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Calculer l'âge
    const calculateAge = (dateString: string) => {
        if (!dateString) return '—';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} ans`;
    };

    return (
        <DashboardLayout title="Patients" subtitle="Gestion des patients de l'établissement">
            {/* Header Actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un patient..."
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#A1A09A] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC] dark:focus:border-[#FF4433] dark:focus:ring-[#FF4433]"
                    />
                    <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </form>

                {/* Filters & Add Button */}
                <div className="flex items-center gap-3">
                    <select 
                        value={statutFilter}
                        onChange={(e) => handleStatutFilterChange(e.target.value)}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous les statuts</option>
                        {statuts.map((statut) => (
                            <option key={statut} value={statut}>{statut}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowNewPatientModal(true)}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433] dark:hover:bg-[#e63d2d]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Nouveau patient
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Total patients</p>
                    <p className="mt-1 text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{stats.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Hospitalisés</p>
                    <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.hospitalises}</p>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Consultations</p>
                    <p className="mt-1 text-2xl font-semibold text-green-600">{stats.consultations}</p>
                </div>
                <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Urgences</p>
                    <p className="mt-1 text-2xl font-semibold text-red-600">{stats.urgences}</p>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">N° Dossier</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Date de naissance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Téléphone</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Ville</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {patients.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-[#706f6c] dark:text-[#A1A09A]">
                                        Aucun patient trouvé
                                    </td>
                                </tr>
                            ) : (
                                patients.data.map((patient) => (
                                    <tr key={patient.id} className="transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium text-white ${patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                                    {patient.prenom[0]}{patient.nom[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{patient.nom} {patient.prenom}</p>
                                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{patient.email || patient.adresse || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-[#1b1b18] dark:text-[#EDEDEC]">{patient.numero_dossier}</td>
                                        <td className="px-6 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{formatDate(patient.date_naissance)}</td>
                                        <td className="px-6 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{patient.telephone || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{patient.ville || '—'}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => openStatutModal(patient)}>
                                                <StatusBadge status={patient.statut} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Bouton Voir */}
                                                <button
                                                    onClick={() => openViewModal(patient)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Voir le dossier"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </button>
                                                {/* Bouton Éditer */}
                                                <button
                                                    onClick={() => openEditModal(patient)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]"
                                                    title="Modifier"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                {/* Bouton Supprimer */}
                                                <button
                                                    onClick={() => handleDelete(patient)}
                                                    className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                    title="Supprimer"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                {patients.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Affichage de <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{(patients.current_page - 1) * patients.per_page + 1}</span> à <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{Math.min(patients.current_page * patients.per_page, patients.total)}</span> sur <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{patients.total.toLocaleString()}</span> patients
                        </p>
                        <div className="flex items-center gap-2">
                            {patients.links.map((link, index) => (
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
            {/* MODAL : VOIR LE PATIENT */}
            {/* ============================================== */}
            {showViewModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-medium text-white ${selectedPatient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                    {selectedPatient.prenom[0]}{selectedPatient.nom[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {selectedPatient.prenom} {selectedPatient.nom}
                                    </h2>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {selectedPatient.numero_dossier} • {calculateAge(selectedPatient.date_naissance)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={selectedPatient.statut} />
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
                            {/* Informations personnelles */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Informations personnelles
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <InfoItem label="Date de naissance" value={formatDate(selectedPatient.date_naissance)} />
                                    <InfoItem label="Âge" value={calculateAge(selectedPatient.date_naissance)} />
                                    <InfoItem label="Sexe" value={selectedPatient.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                                    <InfoItem label="Lieu de naissance" value={selectedPatient.lieu_naissance} />
                                    <InfoItem label="Nationalité" value={selectedPatient.nationalite} />
                                    <InfoItem label="CNI" value={selectedPatient.cni} />
                                    <InfoItem label="Profession" value={selectedPatient.profession} />
                                    <InfoItem label="Situation matrimoniale" value={selectedPatient.situation_matrimoniale} />
                                </div>
                            </div>

                            {/* Coordonnées */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Coordonnées
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <InfoItem label="Téléphone" value={selectedPatient.telephone} />
                                    <InfoItem label="Téléphone urgence" value={selectedPatient.telephone_urgence} />
                                    <InfoItem label="Email" value={selectedPatient.email} />
                                    <InfoItem label="Ville" value={selectedPatient.ville} />
                                    <InfoItem label="Quartier" value={selectedPatient.quartier} />
                                    <div className="md:col-span-3">
                                        <InfoItem label="Adresse" value={selectedPatient.adresse} />
                                    </div>
                                </div>
                            </div>

                            {/* Informations médicales */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Informations médicales
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <InfoItem label="Groupe sanguin" value={selectedPatient.groupe_sanguin} />
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Allergies</p>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                                                selectedPatient.allergies.map((allergie, index) => (
                                                    <span key={index} className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                        {allergie}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">—</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personne à contacter */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                    Personne à contacter en cas d'urgence
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <InfoItem label="Nom" value={selectedPatient.personne_contact_nom} />
                                    <InfoItem label="Téléphone" value={selectedPatient.personne_contact_telephone} />
                                    <InfoItem label="Lien" value={selectedPatient.personne_contact_lien} />
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedPatient.notes && (
                                <div>
                                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                        Notes
                                    </h3>
                                    <p className="text-[#1b1b18] dark:text-[#EDEDEC] whitespace-pre-wrap">
                                        {selectedPatient.notes}
                                    </p>
                                </div>
                            )}
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
                                    openEditModal(selectedPatient);
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
            {/* MODAL : NOUVEAU PATIENT */}
            {/* ============================================== */}
            {showNewPatientModal && (
                <PatientFormModal
                    title="Nouveau patient"
                    subtitle="Ajout d'un nouveau patient dans le système"
                    form={createForm}
                    statuts={statuts}
                    onSubmit={handleCreatePatient}
                    onClose={() => setShowNewPatientModal(false)}
                    submitLabel="Enregistrer le patient"
                />
            )}

            {/* ============================================== */}
            {/* MODAL : ÉDITER PATIENT */}
            {/* ============================================== */}
            {showEditModal && selectedPatient && (
                <PatientFormModal
                    title="Modifier le patient"
                    subtitle={`${selectedPatient.prenom} ${selectedPatient.nom} • ${selectedPatient.numero_dossier}`}
                    form={editForm}
                    statuts={statuts}
                    onSubmit={handleUpdatePatient}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedPatient(null);
                    }}
                    submitLabel="Mettre à jour"
                />
            )}

            {/* ============================================== */}
            {/* MODAL : CHANGER LE STATUT */}
            {/* ============================================== */}
            {showStatutModal && selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Changer le statut</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {selectedPatient.prenom} {selectedPatient.nom}
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
/* COMPOSANT : FORMULAIRE PATIENT (RÉUTILISABLE) */
/* ============================================== */
interface PatientFormModalProps {
    title: string;
    subtitle: string;
    form: any;
    statuts: string[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    submitLabel: string;
}

function PatientFormModal({ title, subtitle, form, statuts, onSubmit, onClose, submitLabel }: PatientFormModalProps) {
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Nom */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom *</label>
                                <input
                                    type="text"
                                    value={form.data.nom}
                                    onChange={(e) => form.setData('nom', e.target.value)}
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
                                    value={form.data.prenom}
                                    onChange={(e) => form.setData('prenom', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.prenom 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                />
                                {form.errors.prenom && <p className="mt-1 text-xs text-red-500">{form.errors.prenom}</p>}
                            </div>

                            {/* Sexe */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Sexe *</label>
                                <select
                                    value={form.data.sexe}
                                    onChange={(e) => form.setData('sexe', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </select>
                            </div>

                            {/* Date de naissance */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date de naissance *</label>
                                <input
                                    type="date"
                                    value={form.data.date_naissance}
                                    onChange={(e) => form.setData('date_naissance', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-1 dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${
                                        form.errors.date_naissance 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                                            : 'border-[#e3e3e0] focus:border-[#f53003] focus:ring-[#f53003] dark:border-[#3E3E3A]'
                                    }`}
                                />
                                {form.errors.date_naissance && <p className="mt-1 text-xs text-red-500">{form.errors.date_naissance}</p>}
                            </div>

                            {/* Lieu de naissance */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Lieu de naissance</label>
                                <input
                                    type="text"
                                    value={form.data.lieu_naissance}
                                    onChange={(e) => form.setData('lieu_naissance', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                />
                            </div>

                            {/* Nationalité */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nationalité</label>
                                <input
                                    type="text"
                                    value={form.data.nationalite}
                                    onChange={(e) => form.setData('nationalite', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Camerounaise"
                                />
                            </div>

                            {/* CNI */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">N° CNI</label>
                                <input
                                    type="text"
                                    value={form.data.cni}
                                    onChange={(e) => form.setData('cni', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                />
                            </div>

                            {/* Profession */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Profession</label>
                                <input
                                    type="text"
                                    value={form.data.profession}
                                    onChange={(e) => form.setData('profession', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                />
                            </div>

                            {/* Situation matrimoniale */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Situation matrimoniale</label>
                                <select
                                    value={form.data.situation_matrimoniale}
                                    onChange={(e) => form.setData('situation_matrimoniale', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    <option value="">Non renseigné</option>
                                    <option value="Célibataire">Célibataire</option>
                                    <option value="Marié(e)">Marié(e)</option>
                                    <option value="Divorcé(e)">Divorcé(e)</option>
                                    <option value="Veuf(ve)">Veuf(ve)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Coordonnées */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Coordonnées
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                            {/* Téléphone urgence */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone urgence</label>
                                <input
                                    type="tel"
                                    value={form.data.telephone_urgence}
                                    onChange={(e) => form.setData('telephone_urgence', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="+237 6XX XXX XXX"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Email</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="patient@email.com"
                                />
                            </div>

                            {/* Ville */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Ville</label>
                                <input
                                    type="text"
                                    value={form.data.ville}
                                    onChange={(e) => form.setData('ville', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Douala"
                                />
                            </div>

                            {/* Quartier */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Quartier</label>
                                <input
                                    type="text"
                                    value={form.data.quartier}
                                    onChange={(e) => form.setData('quartier', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Akwa"
                                />
                            </div>

                            {/* Adresse */}
                            <div className="md:col-span-3">
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Adresse complète</label>
                                <input
                                    type="text"
                                    value={form.data.adresse}
                                    onChange={(e) => form.setData('adresse', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Rue 1.234, face pharmacie"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Informations médicales */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Informations médicales
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Groupe sanguin */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Groupe sanguin</label>
                                <select
                                    value={form.data.groupe_sanguin}
                                    onChange={(e) => form.setData('groupe_sanguin', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    <option value="">Non renseigné</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            {/* Statut */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Statut</label>
                                <select
                                    value={form.data.statut}
                                    onChange={(e) => form.setData('statut', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                >
                                    {statuts.map((statut) => (
                                        <option key={statut} value={statut}>{statut}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Allergies */}
                            <div className="md:col-span-3">
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Allergies connues</label>
                                <input
                                    type="text"
                                    value={form.data.allergies}
                                    onChange={(e) => form.setData('allergies', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Pénicilline, arachides (séparez par des virgules)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Personne à contacter */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Personne à contacter en cas d'urgence
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* Nom */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom complet</label>
                                <input
                                    type="text"
                                    value={form.data.personne_contact_nom}
                                    onChange={(e) => form.setData('personne_contact_nom', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                />
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone</label>
                                <input
                                    type="tel"
                                    value={form.data.personne_contact_telephone}
                                    onChange={(e) => form.setData('personne_contact_telephone', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="+237 6XX XXX XXX"
                                />
                            </div>

                            {/* Lien */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Lien de parenté</label>
                                <input
                                    type="text"
                                    value={form.data.personne_contact_lien}
                                    onChange={(e) => form.setData('personne_contact_lien', e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Époux, Parent, Enfant..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section: Notes */}
                    <div className="mb-6">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                            Notes
                        </h3>
                        <textarea
                            rows={4}
                            value={form.data.notes}
                            onChange={(e) => form.setData('notes', e.target.value)}
                            className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                            placeholder="Observations, antécédents médicaux, remarques..."
                        />
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