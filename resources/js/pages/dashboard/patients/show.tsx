import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../layout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Patient {
    id: number;
    numero_dossier: string;
    nom: string;
    prenom: string;
    sexe: 'M' | 'F';
    date_naissance: string;
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
}

interface Props {
    patient: Patient;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('fr-FR') : '—';

const calculateAge = (d: string) => {
    const today = new Date();
    const birth = new Date(d);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() - birth.getMonth() < 0 ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return `${age} ans`;
};

const situationLabel: Record<string, string> = {
    celibataire: 'Célibataire', marie: 'Marié(e)',
    divorce: 'Divorcé(e)', veuf: 'Veuf(ve)',
};

const statutColor: Record<string, string> = {
    Hospitalisé: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Consultation: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Urgence: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Sortie: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function PatientShow({ patient }: Props) {
    const [activeTab, setActiveTab] = useState<'infos' | 'medical' | 'contact'>('infos');
    const [showEditModal, setShowEditModal] = useState(false);

    const editForm = useForm({
        nom: patient.nom,
        prenom: patient.prenom,
        sexe: patient.sexe,
        date_naissance: patient.date_naissance?.split('T')[0] ?? '',
        lieu_naissance: patient.lieu_naissance ?? '',
        nationalite: patient.nationalite ?? '',
        cni: patient.cni ?? '',
        telephone: patient.telephone ?? '',
        telephone_urgence: patient.telephone_urgence ?? '',
        email: patient.email ?? '',
        adresse: patient.adresse ?? '',
        ville: patient.ville ?? '',
        quartier: patient.quartier ?? '',
        profession: patient.profession ?? '',
        situation_matrimoniale: patient.situation_matrimoniale ?? '',
        groupe_sanguin: patient.groupe_sanguin ?? '',
        allergies: (patient.allergies ?? []).join(', '),
        personne_contact_nom: patient.personne_contact_nom ?? '',
        personne_contact_telephone: patient.personne_contact_telephone ?? '',
        personne_contact_lien: patient.personne_contact_lien ?? '',
        notes: patient.notes ?? '',
        statut: patient.statut,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/patients/${patient.id}`, {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Supprimer ${patient.prenom} ${patient.nom} ?`)) {
            router.delete(`/patients/${patient.id}`, {
                onSuccess: () => router.visit('/patients'),
            });
        }
    };

    const tabs = [
        { key: 'infos',   label: 'Informations', icon: 'M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z' },
        { key: 'medical', label: 'Médical',       icon: 'M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5ZM9 12H15M9 16H13' },
        { key: 'contact', label: 'Contact',       icon: 'M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z' },
    ] as const;

    return (
        <DashboardLayout
            title={`${patient.prenom} ${patient.nom}`}
            subtitle={`N° ${patient.numero_dossier} · Enregistré le ${formatDate(patient.created_at)}`}
        >
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                <Link href="/patients" className="hover:text-[#f53003]">Patients</Link>
                <span>/</span>
                <span className="text-[#1b1b18] dark:text-[#EDEDEC]">{patient.nom} {patient.prenom}</span>
            </div>

            {/* ── En-tête ───────────────────────────────────────────── */}
            <div className="mb-6 rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white ${patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {patient.prenom[0]}{patient.nom[0]}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {patient.prenom} {patient.nom}
                                </h2>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statutColor[patient.statut]}`}>
                                    {patient.statut}
                                </span>
                                {patient.groupe_sanguin && (
                                    <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {patient.groupe_sanguin}
                                    </span>
                                )}
                            </div>
                            <p className="mt-0.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                {calculateAge(patient.date_naissance)} · {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                                {patient.telephone && ` · ${patient.telephone}`}
                            </p>
                            <p className="text-xs text-[#A1A09A]">
                                N° dossier : {patient.numero_dossier}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/patients/${patient.id}/dossier-medical`}
                            className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                            <SvgIcon path="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5ZM9 12H15M9 16H13" className="h-4 w-4"/>
                            Dossier médical
                        </Link>
                        <button onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-3 py-2 text-sm font-medium text-white hover:bg-[#d42a03]">
                            <SvgIcon path="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" className="h-4 w-4"/>
                            Modifier
                        </button>
                        <button onClick={handleDelete}
                            className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-800/30 dark:text-red-400 dark:hover:bg-red-900/20">
                            <SvgIcon path="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" className="h-4 w-4"/>
                            Supprimer
                        </button>
                    </div>
                </div>

                {/* Allergies */}
                {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/30 dark:bg-red-900/10">
                        <SvgIcon path="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3437 2.89726 12 2.89726C11.6563 2.89726 11.3183 2.98585 11.0188 3.15449C10.7193 3.32313 10.4683 3.56611 10.29 3.86Z" className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"/>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs font-semibold text-red-700 dark:text-red-400 mr-1">Allergies :</span>
                            {patient.allergies.map((a, i) => (
                                <span key={i} className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">{a}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Tabs ──────────────────────────────────────────────── */}
            <div className="mb-6 flex items-center gap-1 rounded-lg bg-[#f5f5f3] p-1 dark:bg-[#1C1C1A]">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A]'}`}>
                        <SvgIcon path={tab.icon} className="h-4 w-4"/>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Infos personnelles ────────────────────────────────── */}
            {activeTab === 'infos' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InfoSection title="État civil" rows={[
                        { label: 'Nom complet',           value: `${patient.prenom} ${patient.nom}` },
                        { label: 'Date de naissance',     value: `${formatDate(patient.date_naissance)} (${calculateAge(patient.date_naissance)})` },
                        { label: 'Lieu de naissance',     value: patient.lieu_naissance },
                        { label: 'Nationalité',           value: patient.nationalite },
                        { label: 'CNI',                   value: patient.cni },
                        { label: 'Situation matrimoniale',value: patient.situation_matrimoniale ? (situationLabel[patient.situation_matrimoniale] ?? patient.situation_matrimoniale) : null },
                        { label: 'Profession',            value: patient.profession },
                    ]}/>
                    <InfoSection title="Coordonnées" rows={[
                        { label: 'Téléphone',         value: patient.telephone },
                        { label: 'Tél. urgence',      value: patient.telephone_urgence },
                        { label: 'Email',             value: patient.email },
                        { label: 'Adresse',           value: patient.adresse },
                        { label: 'Quartier',          value: patient.quartier },
                        { label: 'Ville',             value: patient.ville },
                    ]}/>
                    {patient.notes && (
                        <div className="md:col-span-2 rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Notes</p>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] whitespace-pre-wrap">{patient.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Médical ───────────────────────────────────────────── */}
            {activeTab === 'medical' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Données médicales</p>
                        <div className="space-y-3">
                            <div className="flex justify-between gap-4">
                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Groupe sanguin</span>
                                {patient.groupe_sanguin ? (
                                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">{patient.groupe_sanguin}</span>
                                ) : <span className="text-sm text-[#A1A09A]">—</span>}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Allergies connues</p>
                        {patient.allergies && patient.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {patient.allergies.map((a, i) => (
                                    <span key={i} className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{a}</span>
                                ))}
                            </div>
                        ) : <p className="text-sm text-[#A1A09A]">Aucune allergie renseignée.</p>}
                    </div>
                    {patient.antecedents_medicaux && patient.antecedents_medicaux.length > 0 && (
                        <div className="md:col-span-2 rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Antécédents médicaux</p>
                            <div className="flex flex-wrap gap-2">
                                {patient.antecedents_medicaux.map((a, i) => (
                                    <span key={i} className="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">{a}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Contact ───────────────────────────────────────────── */}
            {activeTab === 'contact' && (
                <InfoSection title="Personne à contacter en cas d'urgence" rows={[
                    { label: 'Nom',       value: patient.personne_contact_nom },
                    { label: 'Téléphone', value: patient.personne_contact_telephone },
                    { label: 'Lien',      value: patient.personne_contact_lien },
                ]}/>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* MODAL — Modifier patient                                 */}
            {/* ════════════════════════════════════════════════════════ */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Modifier le patient</h2>
                                <p className="text-sm text-[#706f6c]">{patient.prenom} {patient.nom} · {patient.numero_dossier}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#3E3E3A]">
                                <SvgIcon path="M18 6L6 18M6 6L18 18" className="h-5 w-5"/>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-6 p-6">
                            {/* État civil */}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">État civil</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField label="Nom *"><input required type="text" value={editForm.data.nom} onChange={e => editForm.setData('nom', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Prénom *"><input required type="text" value={editForm.data.prenom} onChange={e => editForm.setData('prenom', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Sexe *">
                                        <select value={editForm.data.sexe} onChange={e => editForm.setData('sexe', e.target.value as any)} className={inputCls}>
                                            <option value="M">Masculin</option>
                                            <option value="F">Féminin</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Date de naissance *"><input required type="date" value={editForm.data.date_naissance} onChange={e => editForm.setData('date_naissance', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Lieu de naissance"><input type="text" value={editForm.data.lieu_naissance} onChange={e => editForm.setData('lieu_naissance', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Nationalité"><input type="text" value={editForm.data.nationalite} onChange={e => editForm.setData('nationalite', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="CNI"><input type="text" value={editForm.data.cni} onChange={e => editForm.setData('cni', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Profession"><input type="text" value={editForm.data.profession} onChange={e => editForm.setData('profession', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Situation matrimoniale">
                                        <select value={editForm.data.situation_matrimoniale} onChange={e => editForm.setData('situation_matrimoniale', e.target.value)} className={inputCls}>
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
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Coordonnées</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField label="Téléphone"><input type="tel" value={editForm.data.telephone} onChange={e => editForm.setData('telephone', e.target.value)} className={inputCls} placeholder="+237 6XX XXX XXX"/></FormField>
                                    <FormField label="Tél. urgence"><input type="tel" value={editForm.data.telephone_urgence} onChange={e => editForm.setData('telephone_urgence', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Email"><input type="email" value={editForm.data.email} onChange={e => editForm.setData('email', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Ville"><input type="text" value={editForm.data.ville} onChange={e => editForm.setData('ville', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Quartier"><input type="text" value={editForm.data.quartier} onChange={e => editForm.setData('quartier', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Adresse"><input type="text" value={editForm.data.adresse} onChange={e => editForm.setData('adresse', e.target.value)} className={inputCls}/></FormField>
                                </div>
                            </div>
                            {/* Médical */}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Médical</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Groupe sanguin">
                                        <select value={editForm.data.groupe_sanguin} onChange={e => editForm.setData('groupe_sanguin', e.target.value)} className={inputCls}>
                                            <option value="">Non renseigné</option>
                                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label="Statut">
                                        <select value={editForm.data.statut} onChange={e => editForm.setData('statut', e.target.value as any)} className={inputCls}>
                                            <option value="Hospitalisé">Hospitalisé</option>
                                            <option value="Consultation">Consultation</option>
                                            <option value="Urgence">Urgence</option>
                                            <option value="Sortie">Sortie</option>
                                        </select>
                                    </FormField>
                                    <div className="col-span-2">
                                        <FormField label="Allergies (séparées par des virgules)">
                                            <input type="text" value={editForm.data.allergies} onChange={e => editForm.setData('allergies', e.target.value)} className={inputCls} placeholder="Pénicilline, arachides…"/>
                                        </FormField>
                                    </div>
                                </div>
                            </div>
                            {/* Contact urgence */}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Personne à contacter</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField label="Nom"><input type="text" value={editForm.data.personne_contact_nom} onChange={e => editForm.setData('personne_contact_nom', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Téléphone"><input type="tel" value={editForm.data.personne_contact_telephone} onChange={e => editForm.setData('personne_contact_telephone', e.target.value)} className={inputCls}/></FormField>
                                    <FormField label="Lien de parenté"><input type="text" value={editForm.data.personne_contact_lien} onChange={e => editForm.setData('personne_contact_lien', e.target.value)} className={inputCls}/></FormField>
                                </div>
                            </div>
                            <FormField label="Notes">
                                <textarea rows={3} value={editForm.data.notes} onChange={e => editForm.setData('notes', e.target.value)} className={inputCls + ' resize-none'}/>
                            </FormField>
                            <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">Annuler</button>
                                <button type="submit" disabled={editForm.processing} className="flex items-center gap-2 rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50">
                                    <SvgIcon path="M20 6L9 17L4 12" className="h-4 w-4"/>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{label}</label>
            {children}
        </div>
    );
}

function InfoSection({ title, rows }: { title: string; rows: { label: string; value: string | null | undefined }[] }) {
    return (
        <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <p className="mb-4 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</p>
            <div className="space-y-3">
                {rows.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 border-b border-[#f5f5f3] pb-2 last:border-0 last:pb-0 dark:border-[#1C1C1A]">
                        <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</span>
                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] text-right">{value || '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SvgIcon({ path, className }: { path: string; className?: string }) {
    return (
        <svg className={className ?? 'h-5 w-5'} viewBox="0 0 24 24" fill="none">
            <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}