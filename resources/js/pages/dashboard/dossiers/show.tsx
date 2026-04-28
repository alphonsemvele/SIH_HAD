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
    telephone: string | null;
    email: string | null;
    adresse: string | null;
    ville: string | null;
    groupe_sanguin: string | null;
    allergies: string[] | null;
    situation_matrimoniale: string | null;
    profession: string | null;
    nationalite: string | null;
    personne_contact_nom: string | null;
    personne_contact_telephone: string | null;
    personne_contact_lien: string | null;
    statut: string;
}

interface Entree {
    id: number;
    type: string;
    date_entree: string;
    date_sortie: string | null;
    diagnostic: string | null;
    statut: string;
    medecin?: { id: number; name: string };
    notes: string | null;
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
    notes_generales: string | null;
    statut: 'Actif' | 'Archivé' | 'Transféré';
    patient: Patient;
    entrees: Entree[];
}

interface Props {
    patient: Patient;
    dossier: DossierMedical;
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

const typeEntreeColor: Record<string, string> = {
    Consultation:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Hospitalisation:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Urgence:        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Suivi HAD':    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const statutDossierColor: Record<string, string> = {
    Actif:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Archivé:   'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    Transféré: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function DossierShow({ patient, dossier }: Props) {
    const [activeTab, setActiveTab] = useState<'resume' | 'entrees' | 'antecedents' | 'infos'>('resume');
    const [showEditModal, setShowEditModal] = useState(false);

    const editForm = useForm({
        groupe_sanguin:      dossier.groupe_sanguin ?? '',
        allergies_confirmees: (dossier.allergies_confirmees ?? []).join(', '),
        antecedents_medicaux: (dossier.antecedents_medicaux ?? []).join(', '),
        maladies_chroniques:  (dossier.maladies_chroniques ?? []).join(', '),
        notes_generales:      dossier.notes_generales ?? '',
        statut:               dossier.statut,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/dossiers-medicaux/${dossier.id}`, {
            onSuccess: () => setShowEditModal(false),
        });
    };

    const tabs = [
        { key: 'resume',      label: 'Résumé',         icon: 'M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5ZM9 12H15M9 16H13' },
        { key: 'entrees',     label: `Entrées (${dossier.entrees.length})`, icon: 'M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z' },
        { key: 'antecedents', label: 'Antécédents',    icon: 'M4.26 10.147A60.436 60.436 0 0012 8.25M4.26 10.147C5.49 8.396 8.47 6 12 6c3.53 0 6.51 2.396 7.74 4.147M4.26 10.147L12 14.25l7.74-4.103M4.26 10.147v6.858l7.74 4.103 7.74-4.103v-6.858' },
        { key: 'infos',       label: 'Infos patient',  icon: 'M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z' },
    ] as const;

    return (
        <DashboardLayout
            title={`Dossier — ${patient.prenom} ${patient.nom}`}
            subtitle={`${dossier.numero_dossier_medical} · Ouvert le ${formatDate(dossier.date_ouverture)}`}
        >
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                <Link href="/dossiers-medicaux" className="hover:text-[#f53003]">Dossiers médicaux</Link>
                <span>/</span>
                <span className="text-[#1b1b18] dark:text-[#EDEDEC]">{patient.nom} {patient.prenom}</span>
            </div>

            {/* ── En-tête patient ───────────────────────────────────── */}
            <div className="mb-6 overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-semibold text-white ${patient.sexe === 'M' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {patient.prenom[0]}{patient.nom[0]}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {patient.prenom} {patient.nom}
                                </h2>
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statutDossierColor[dossier.statut]}`}>
                                    {dossier.statut}
                                </span>
                            </div>
                            <p className="mt-0.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                {calculateAge(patient.date_naissance)} · {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                                {patient.telephone && ` · ${patient.telephone}`}
                            </p>
                            <p className="text-xs text-[#A1A09A]">
                                N° patient : {patient.numero_dossier} · N° dossier : {dossier.numero_dossier_medical}
                            </p>
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex flex-wrap items-center gap-2">
                        {dossier.groupe_sanguin && (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {dossier.groupe_sanguin}
                            </span>
                        )}
                        <button onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                            <SvgIcon path="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" className="h-4 w-4"/>
                            Modifier le dossier
                        </button>
                        <Link href={`/patients/${patient.id}`}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-3 py-2 text-sm font-medium text-white hover:bg-[#d42a03]">
                            <SvgIcon path="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" className="h-4 w-4"/>
                            Fiche patient
                        </Link>
                    </div>
                </div>

                {/* Alertes allergies */}
                {dossier.allergies_confirmees && dossier.allergies_confirmees.length > 0 && (
                    <div className="flex items-start gap-3 border-t border-[#e3e3e0] bg-red-50 px-6 py-3 dark:border-[#3E3E3A] dark:bg-red-900/10">
                        <SvgIcon path="M12 9V13M12 17H12.01M10.29 3.86L1.82 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7238C2.83871 20.9009 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9009 21.4623 20.7238C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3437 2.89726 12 2.89726C11.6563 2.89726 11.3183 2.98585 11.0188 3.15449C10.7193 3.32313 10.4683 3.56611 10.29 3.86Z" className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"/>
                        <div>
                            <p className="text-xs font-semibold text-red-700 dark:text-red-400">Allergies confirmées</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {dossier.allergies_confirmees.map((a, i) => (
                                    <span key={i} className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">{a}</span>
                                ))}
                            </div>
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

            {/* ════════════════════════════════════════════════════════ */}
            {/* TAB — Résumé                                             */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'resume' && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* Stats rapides */}
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-1 text-xs font-medium uppercase text-[#706f6c] dark:text-[#A1A09A]">Total entrées</p>
                        <p className="text-3xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{dossier.entrees.length}</p>
                    </div>
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-1 text-xs font-medium uppercase text-[#706f6c] dark:text-[#A1A09A]">Hospitalisations</p>
                        <p className="text-3xl font-semibold text-blue-600">{dossier.entrees.filter(e => e.type === 'Hospitalisation').length}</p>
                    </div>
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-1 text-xs font-medium uppercase text-[#706f6c] dark:text-[#A1A09A]">Consultations</p>
                        <p className="text-3xl font-semibold text-green-600">{dossier.entrees.filter(e => e.type === 'Consultation').length}</p>
                    </div>

                    {/* Dernière entrée */}
                    {dossier.entrees[0] && (
                        <div className="lg:col-span-2 rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Dernière entrée</p>
                            <div className="flex items-start gap-4">
                                <div className={`rounded-lg px-2.5 py-1 text-xs font-medium ${typeEntreeColor[dossier.entrees[0].type] ?? 'bg-gray-100 text-gray-700'}`}>
                                    {dossier.entrees[0].type}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {dossier.entrees[0].diagnostic ?? 'Diagnostic non renseigné'}
                                    </p>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {formatDate(dossier.entrees[0].date_entree)}
                                        {dossier.entrees[0].medecin && ` · Dr. ${dossier.entrees[0].medecin.name}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes générales */}
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-2 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Notes générales</p>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] whitespace-pre-wrap">
                            {dossier.notes_generales || 'Aucune note.'}
                        </p>
                    </div>

                    {/* Maladies chroniques */}
                    {dossier.maladies_chroniques && dossier.maladies_chroniques.length > 0 && (
                        <div className="lg:col-span-3 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800/30 dark:bg-orange-900/10">
                            <p className="mb-2 text-sm font-semibold text-orange-800 dark:text-orange-400">Maladies chroniques</p>
                            <div className="flex flex-wrap gap-2">
                                {dossier.maladies_chroniques.map((m, i) => (
                                    <span key={i} className="rounded-full border border-orange-200 bg-white px-3 py-1 text-sm text-orange-800 dark:border-orange-800/30 dark:bg-[#161615] dark:text-orange-400">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* TAB — Entrées                                            */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'entrees' && (
                <div className="rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    {dossier.entrees.length === 0 ? (
                        <div className="py-16 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Aucune entrée enregistrée.
                        </div>
                    ) : (
                        <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {dossier.entrees.map((entree) => (
                                <div key={entree.id} className="flex items-start gap-4 p-5 hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A]">
                                    {/* Indicateur */}
                                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#f5f5f3] dark:bg-[#1C1C1A]">
                                        <SvgIcon path="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" className="h-4 w-4 text-[#706f6c]"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeEntreeColor[entree.type] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {entree.type}
                                            </span>
                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                {formatDate(entree.date_entree)}
                                                {entree.date_sortie && ` → ${formatDate(entree.date_sortie)}`}
                                            </span>
                                        </div>
                                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {entree.diagnostic ?? 'Diagnostic non renseigné'}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-3">
                                            {entree.medecin && (
                                                <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                    Dr. {entree.medecin.name}
                                                </span>
                                            )}
                                            {entree.statut && (
                                                <span className="rounded-full bg-[#f5f5f3] px-2 py-0.5 text-xs text-[#706f6c] dark:bg-[#1C1C1A] dark:text-[#A1A09A]">
                                                    {entree.statut}
                                                </span>
                                            )}
                                        </div>
                                        {entree.notes && (
                                            <p className="mt-1 text-xs text-[#706f6c] dark:text-[#A1A09A] line-clamp-2">{entree.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* TAB — Antécédents                                        */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'antecedents' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                        { label: 'Allergies confirmées',  items: dossier.allergies_confirmees,  color: 'red' },
                        { label: 'Antécédents médicaux',  items: dossier.antecedents_medicaux,  color: 'orange' },
                        { label: 'Maladies chroniques',   items: dossier.maladies_chroniques,   color: 'yellow' },
                    ].map(({ label, items, color }) => (
                        <div key={label} className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{label}</p>
                            {items && items.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {items.map((item, i) => (
                                        <span key={i} className={`rounded-full px-3 py-1 text-sm ${
                                            color === 'red'    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            color === 'orange' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>{item}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[#A1A09A]">Aucun élément renseigné.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* TAB — Infos patient                                      */}
            {/* ════════════════════════════════════════════════════════ */}
            {activeTab === 'infos' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-4 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Informations personnelles</p>
                        <div className="space-y-3">
                            {[
                                { label: 'Date de naissance', value: `${formatDate(patient.date_naissance)} (${calculateAge(patient.date_naissance)})` },
                                { label: 'Sexe', value: patient.sexe === 'M' ? 'Masculin' : 'Féminin' },
                                { label: 'Nationalité', value: patient.nationalite },
                                { label: 'Profession', value: patient.profession },
                                { label: 'Situation matrimoniale', value: patient.situation_matrimoniale ? (situationLabel[patient.situation_matrimoniale] ?? patient.situation_matrimoniale) : null },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</span>
                                    <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] text-right">{value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="mb-4 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Coordonnées</p>
                        <div className="space-y-3">
                            {[
                                { label: 'Téléphone', value: patient.telephone },
                                { label: 'Email', value: patient.email },
                                { label: 'Adresse', value: patient.adresse },
                                { label: 'Ville', value: patient.ville },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</span>
                                    <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] text-right">{value || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(patient.personne_contact_nom || patient.personne_contact_telephone) && (
                        <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="mb-4 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Personne à contacter</p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Nom', value: patient.personne_contact_nom },
                                    { label: 'Téléphone', value: patient.personne_contact_telephone },
                                    { label: 'Lien', value: patient.personne_contact_lien },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between gap-4">
                                        <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{label}</span>
                                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC] text-right">{value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════════════════════════════════════════════ */}
            {/* MODAL — Modifier le dossier                              */}
            {/* ════════════════════════════════════════════════════════ */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Modifier le dossier</h2>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{dossier.numero_dossier_medical}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#3E3E3A]">
                                <SvgIcon path="M18 6L6 18M6 6L18 18" className="h-5 w-5"/>
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-5 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Groupe sanguin</label>
                                    <select value={editForm.data.groupe_sanguin} onChange={e => editForm.setData('groupe_sanguin', e.target.value)} className={inputCls}>
                                        <option value="">Non renseigné</option>
                                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Statut</label>
                                    <select value={editForm.data.statut} onChange={e => editForm.setData('statut', e.target.value as any)} className={inputCls}>
                                        <option value="Actif">Actif</option>
                                        <option value="Archivé">Archivé</option>
                                        <option value="Transféré">Transféré</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Allergies confirmées <span className="text-[#A1A09A]">(séparées par des virgules)</span></label>
                                <input type="text" value={editForm.data.allergies_confirmees} onChange={e => editForm.setData('allergies_confirmees', e.target.value)} className={inputCls} placeholder="Pénicilline, arachides…"/>
                            </div>
                            <div>
                                <label className={labelCls}>Antécédents médicaux <span className="text-[#A1A09A]">(séparés par des virgules)</span></label>
                                <input type="text" value={editForm.data.antecedents_medicaux} onChange={e => editForm.setData('antecedents_medicaux', e.target.value)} className={inputCls} placeholder="HTA, diabète…"/>
                            </div>
                            <div>
                                <label className={labelCls}>Maladies chroniques <span className="text-[#A1A09A]">(séparées par des virgules)</span></label>
                                <input type="text" value={editForm.data.maladies_chroniques} onChange={e => editForm.setData('maladies_chroniques', e.target.value)} className={inputCls} placeholder="Asthme, insuffisance rénale…"/>
                            </div>
                            <div>
                                <label className={labelCls}>Notes générales</label>
                                <textarea rows={4} value={editForm.data.notes_generales} onChange={e => editForm.setData('notes_generales', e.target.value)} className={inputCls + ' resize-none'} placeholder="Observations générales…"/>
                            </div>
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
const labelCls = "mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]";

function SvgIcon({ path, className }: { path: string; className?: string }) {
    return (
        <svg className={className ?? 'h-5 w-5'} viewBox="0 0 24 24" fill="none">
            <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}