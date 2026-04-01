import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

interface Patient {
    id: number;
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
}

interface Anomalie {
    id: number;
    titre: string;
    description: string | null;
    severite: 'critique' | 'elevee' | 'moderee' | 'faible';
    statut: string;
    created_at: string;
}

interface Medicament {
    id: number;
    nom: string;
    dosage: string;
    forme: string;
}

interface LignePrescription {
    medicament_id: number;
    medicament_nom: string;
    dosage: string;
    forme: string;
    posologie: string;
    duree: string;
    quantite: number;
    instructions: string;
}

interface Prescription {
    id: number;
    numero: string;
    patient: Patient;
    medecin: { name: string; lastname: string };
    anomalie: Anomalie | null;
    lignePrescriptions: LignePrescription[];
    statut: 'en_cours' | 'delivree' | 'expiree' | 'annulee';
    instructions_generales: string | null;
    date_prescription: string;
    date_validite: string | null;
}

interface PaginatedData {
    data: Prescription[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    prescriptions?: PaginatedData;
    patients?: Patient[];
    medicaments?: Medicament[];
    stats?: { total: number; en_cours: number; delivrees: number; expirees: number };
    filters?: { search?: string; statut?: string };
}

const defaultPaginated: PaginatedData = {
    data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, links: [],
};

const STATUTS: Record<string, { label: string; cls: string }> = {
    en_cours: { label: 'En cours',  cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    delivree: { label: 'Delivree',  cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    expiree:  { label: 'Expiree',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    annulee:  { label: 'Annulee',   cls: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

const SEVERITES: Record<string, string> = {
    critique: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    elevee:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    moderee:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    faible:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const fmt = (d: string) => {
    try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
};

function Badge({ statut }: { statut: string }) {
    const s = STATUTS[statut] ?? STATUTS['annulee'];
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function Step({ n, label }: { n: number; label: string }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f53003] text-xs font-bold text-white">{n}</span>
            <span className="text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{label}</span>
        </div>
    );
}

export default function Prescriptions({
    prescriptions = defaultPaginated,
    patients = [],
    medicaments = [],
    stats = { total: 0, en_cours: 0, delivrees: 0, expirees: 0 },
    filters = {},
}: Props) {
    const [showModal, setShowModal]               = useState(false);
    const [showView, setShowView]                 = useState(false);
    const [selected, setSelected]                 = useState<Prescription | null>(null);
    const [search, setSearch]                     = useState(filters?.search ?? '');
    const [statutFilter, setStatutFilter]         = useState(filters?.statut ?? '');
    const [patientAnomalies, setPatientAnomalies] = useState<Anomalie[]>([]);
    const [loadingAnomalies, setLoadingAnomalies] = useState(false);
    const [lignes, setLignes]                     = useState<LignePrescription[]>([]);

    const form = useForm({
        patient_id:             '',
        anomalie_id:            '',
        instructions_generales: '',
        date_validite:          '',
        lignes:                 [] as LignePrescription[],
    });

    const handlePatientChange = async (id: string) => {
        form.setData('patient_id', id);
        form.setData('anomalie_id', '');
        setPatientAnomalies([]);
        setLignes([]);
        if (!id) return;
        setLoadingAnomalies(true);
        try {
            const res = await fetch(`/patients/${id}/anomalies-actives`);
            const data = await res.json();
            setPatientAnomalies(Array.isArray(data) ? data : []);
        } catch {
            setPatientAnomalies([]);
        } finally {
            setLoadingAnomalies(false);
        }
    };

    const ajouterLigne = () => setLignes(prev => [...prev, {
        medicament_id: 0, medicament_nom: '', dosage: '',
        forme: '', posologie: '', duree: '', quantite: 1, instructions: '',
    }]);

    const supprimerLigne = (i: number) => setLignes(prev => prev.filter((_, idx) => idx !== i));

    const updateLigne = (idx: number, field: keyof LignePrescription, value: string | number) => {
        setLignes(prev => {
            const u = [...prev];
            if (field === 'medicament_id') {
                const med = medicaments.find(m => m.id === Number(value));
                u[idx] = { ...u[idx], medicament_id: Number(value), medicament_nom: med?.nom ?? '', dosage: med?.dosage ?? '', forme: med?.forme ?? '' };
            } else {
                (u[idx] as any)[field] = value;
            }
            return u;
        });
    };

    const closeModal = () => {
        setShowModal(false);
        form.reset();
        setLignes([]);
        setPatientAnomalies([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, lignes }));
        form.post('/prescriptions', { onSuccess: closeModal });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/prescription', { search, statut: statutFilter }, { preserveState: true });
    };

    const canSubmit = !!(form.data.patient_id && lignes.length > 0 && lignes.every(l => l.medicament_id > 0 && l.posologie && l.duree));
    const patientSel = patients.find(p => p.id === Number(form.data.patient_id)) ?? null;

    return (
        <DashboardLayout title="Prescriptions" subtitle="Gestion des ordonnances medicales">

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: 'Total',     value: stats.total,     color: 'text-[#1b1b18] dark:text-[#EDEDEC]',  bg: 'bg-[#f5f5f3] dark:bg-[#1C1C1A]' },
                    { label: 'En cours',  value: stats.en_cours,  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Delivrees', value: stats.delivrees, color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Expirees',  value: stats.expirees,  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className={`mb-2 inline-flex rounded-lg p-2 ${s.bg}`}>
                            <ClipboardIcon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Barre */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="relative">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                            className="h-10 w-64 rounded-lg border border-[#e3e3e0] bg-white pl-10 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                    </form>
                    <select value={statutFilter}
                        onChange={e => { setStatutFilter(e.target.value); router.get('/prescription', { search, statut: e.target.value }, { preserveState: true }); }}
                        className="h-10 rounded-lg border border-[#e3e3e0] bg-white px-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous les statuts</option>
                        {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#f53003] px-4 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nouvelle prescription
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                {['N Rx','Patient','Anomalie','Medicaments','Medecin','Date','Validite','Statut','Actions'].map((h, i) => (
                                    <th key={h} className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A] ${i === 8 ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {prescriptions.data.length === 0 ? (
                                <tr><td colSpan={9} className="py-12 text-center text-sm text-[#706f6c]">Aucune prescription trouvee</td></tr>
                            ) : prescriptions.data.map(p => (
                                <tr key={p.id} className="hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A]">
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-sm font-semibold text-[#f53003]">{p.numero}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${p.patient?.sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                {p.patient?.prenom?.[0]}{p.patient?.nom?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{p.patient?.prenom} {p.patient?.nom}</p>
                                                <p className="text-xs text-[#706f6c]">{p.patient?.date_naissance ? fmt(p.patient.date_naissance) : ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        {p.anomalie ? (
                                            <div>
                                                <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITES[p.anomalie.severite] ?? ''}`}>{p.anomalie.severite}</span>
                                                <p className="mt-1 max-w-[140px] truncate text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{p.anomalie.titre}</p>
                                            </div>
                                        ) : <span className="text-sm italic text-[#706f6c]">Libre</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {(p.lignePrescriptions ?? []).slice(0, 2).map((l, i) => (
                                                <span key={i} className="rounded bg-[#f5f5f3] px-2 py-0.5 text-xs dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">{l.medicament_nom}</span>
                                            ))}
                                            {(p.lignePrescriptions ?? []).length > 2 && (
                                                <span className="rounded bg-[#f5f5f3] px-2 py-0.5 text-xs text-[#706f6c]">+{p.lignePrescriptions.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">Dr. {p.medecin?.lastname}</td>
                                    <td className="px-5 py-4 text-sm text-[#706f6c]">{p.date_prescription ? fmt(p.date_prescription) : ''}</td>
                                    <td className="px-5 py-4 text-sm text-[#706f6c]">{p.date_validite ? fmt(p.date_validite) : '—'}</td>
                                    <td className="px-5 py-4"><Badge statut={p.statut} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => { setSelected(p); setShowView(true); }}
                                                className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]" title="Voir">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => window.open(`/prescriptions/${p.id}/print`, '_blank')}
                                                className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]" title="Imprimer">
                                                <PrintIcon className="h-4 w-4" />
                                            </button>
                                            {p.statut === 'expiree' && (
                                                <button onClick={() => router.post(`/prescriptions/${p.id}/renouveler`)}
                                                    className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]" title="Renouveler">
                                                    <RefreshIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {prescriptions.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-[#e3e3e0] px-5 py-4 dark:border-[#3E3E3A]">
                        <p className="text-sm text-[#706f6c]">
                            {(prescriptions.current_page - 1) * prescriptions.per_page + 1}–{Math.min(prescriptions.current_page * prescriptions.per_page, prescriptions.total)} sur {prescriptions.total}
                        </p>
                        <div className="flex gap-1.5">
                            {prescriptions.links.map((link, i) => (
                                <a key={i} href={link.url || '#'}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-[#f53003] text-white' : link.url ? 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A]' : 'cursor-not-allowed opacity-40 border border-[#e3e3e0] dark:border-[#3E3E3A]'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL VOIR */}
            {showView && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Ordonnance <span className="font-mono text-[#f53003]">{selected.numero}</span>
                                </h2>
                                <p className="text-sm text-[#706f6c]">{selected.patient?.prenom} {selected.patient?.nom} • {selected.date_prescription ? fmt(selected.date_prescription) : ''}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge statut={selected.statut} />
                                <button onClick={() => setShowView(false)} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0]">
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {selected.anomalie ? (
                                <div className="rounded-lg border border-[#e3e3e0] bg-[#fafaf9] p-4 dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Anomalie traitee</p>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-0.5 inline-flex rounded px-2 py-0.5 text-xs font-medium ${SEVERITES[selected.anomalie.severite] ?? ''}`}>
                                            {selected.anomalie.severite}
                                        </span>
                                        <div>
                                            <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{selected.anomalie.titre}</p>
                                            {selected.anomalie.description && <p className="mt-0.5 text-sm text-[#706f6c]">{selected.anomalie.description}</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="rounded-lg border border-dashed border-[#e3e3e0] p-3 text-center text-sm italic text-[#706f6c]">Prescription libre</p>
                            )}
                            <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Medicaments ({(selected.lignePrescriptions ?? []).length})</p>
                                <div className="space-y-3">
                                    {(selected.lignePrescriptions ?? []).map((l, i) => (
                                        <div key={i} className="flex items-start justify-between rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                            <div>
                                                <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                    {l.medicament_nom}
                                                    <span className="ml-2 text-sm font-normal text-[#706f6c]">{l.dosage} • {l.forme}</span>
                                                </p>
                                                <p className="mt-1 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{l.posologie}</p>
                                                {l.instructions && <p className="mt-0.5 text-xs text-[#706f6c]">{l.instructions}</p>}
                                            </div>
                                            <div className="text-right text-sm">
                                                <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{l.quantite} unites</p>
                                                <p className="text-[#706f6c]">{l.duree}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {selected.instructions_generales && (
                                <div>
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Instructions generales</p>
                                    <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{selected.instructions_generales}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <button onClick={() => setShowView(false)}
                                className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                                Fermer
                            </button>
                            <button onClick={() => window.open(`/prescriptions/${selected.id}/print`, '_blank')}
                                className="flex items-center gap-2 rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                                <PrintIcon className="h-4 w-4" /> Imprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NOUVELLE PRESCRIPTION */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div>
                                <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Nouvelle prescription</h2>
                                <p className="text-sm text-[#706f6c]">Prescrire des medicaments a un patient</p>
                            </div>
                            <button onClick={closeModal} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0]">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Etape 1 : Patient */}
                            <div>
                                <Step n={1} label="Selection du patient" />
                                <select value={form.data.patient_id} onChange={e => handlePatientChange(e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-3 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                                    <option value="">Selectionner un patient...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>{p.nom} {p.prenom} - {p.date_naissance ? fmt(p.date_naissance) : ''} ({p.sexe})</option>
                                    ))}
                                </select>
                                {form.errors.patient_id && <p className="mt-1 text-xs text-red-500">{form.errors.patient_id}</p>}
                                {patientSel && (
                                    <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#f5f5f3] p-3 dark:bg-[#1C1C1A]">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${patientSel.sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                            {patientSel.prenom?.[0]}{patientSel.nom?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{patientSel.prenom} {patientSel.nom}</p>
                                            <p className="text-xs text-[#706f6c]">{patientSel.date_naissance ? fmt(patientSel.date_naissance) : ''}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Etape 2 : Anomalie → stockee via anomalie_id (BelongsTo FK) */}
                            {form.data.patient_id && (
                                <div>
                                    <Step n={2} label="Anomalie a traiter" />
                                    {loadingAnomalies ? (
                                        <div className="flex items-center gap-2 text-sm text-[#706f6c]">
                                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            Chargement des anomalies...
                                        </div>
                                    ) : (
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                                form.data.anomalie_id === '' ? 'border-[#f53003] bg-[#fff2f2] dark:border-[#FF4433] dark:bg-[#1D0002]' : 'border-[#e3e3e0] hover:bg-[#fafaf9] dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A]'
                                            }`}>
                                                <input type="radio" name="anomalie_id" value="" checked={form.data.anomalie_id === ''} onChange={() => form.setData('anomalie_id', '')} className="h-4 w-4" />
                                                <span className="text-sm italic text-[#706f6c] dark:text-[#A1A09A]">
                                                    {patientAnomalies.length === 0 ? 'Aucune anomalie active - prescription libre' : 'Prescription libre (sans anomalie)'}
                                                </span>
                                            </label>
                                            {patientAnomalies.map(a => (
                                                <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                                    form.data.anomalie_id === String(a.id) ? 'border-[#f53003] bg-[#fff2f2] dark:border-[#FF4433] dark:bg-[#1D0002]' : 'border-[#e3e3e0] hover:bg-[#fafaf9] dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A]'
                                                }`}>
                                                    <input type="radio" name="anomalie_id" value={a.id} checked={form.data.anomalie_id === String(a.id)} onChange={e => form.setData('anomalie_id', e.target.value)} className="mt-0.5 h-4 w-4" />
                                                    <div className="min-w-0 flex-1">
                                                        <span className={`inline-flex rounded px-1.5 py-0.5 text-xs font-medium ${SEVERITES[a.severite] ?? ''}`}>{a.severite}</span>
                                                        <p className="mt-1 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{a.titre}</p>
                                                        {a.description && <p className="mt-0.5 truncate text-xs text-[#706f6c]">{a.description}</p>}
                                                        <p className="mt-0.5 text-xs text-[#706f6c]">Signalee le {a.created_at ? fmt(a.created_at) : ''}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {form.data.anomalie_id && (
                                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            L'anomalie sera automatiquement marquee comme <strong className="ml-1">traitee</strong> apres validation.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Etape 3 : Medicaments stockes dans ligne_prescriptions */}
                            {form.data.patient_id && (
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <Step n={3} label="Medicaments prescrits" />
                                        <button type="button" onClick={ajouterLigne} className="flex items-center gap-1 text-sm font-medium text-[#f53003] hover:text-[#d42a03]">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                                            </svg>
                                            Ajouter
                                        </button>
                                    </div>
                                    {lignes.length === 0 ? (
                                        <button type="button" onClick={ajouterLigne}
                                            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e3e3e0] py-8 text-[#706f6c] hover:border-[#f53003]/40 hover:text-[#f53003] dark:border-[#3E3E3A]">
                                            <PillIcon className="h-8 w-8" />
                                            <span className="text-sm font-medium">Ajouter le premier medicament</span>
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            {lignes.map((ligne, idx) => (
                                                <div key={idx} className="rounded-lg border border-[#e3e3e0] bg-[#fafaf9] p-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-[#706f6c]">Medicament #{idx + 1}</span>
                                                        <button type="button" onClick={() => supprimerLigne(idx)} className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        <div className="sm:col-span-3">
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Medicament *</label>
                                                            <select value={ligne.medicament_id || ''} onChange={e => updateLigne(idx, 'medicament_id', e.target.value)}
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                                                                <option value="">Selectionner un medicament...</option>
                                                                {medicaments.map(m => <option key={m.id} value={m.id}>{m.nom} - {m.dosage} ({m.forme})</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Dosage</label>
                                                            <input type="text" value={ligne.dosage} onChange={e => updateLigne(idx, 'dosage', e.target.value)}
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Forme</label>
                                                            <input type="text" value={ligne.forme} onChange={e => updateLigne(idx, 'forme', e.target.value)}
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Quantite *</label>
                                                            <input type="number" min="1" value={ligne.quantite} onChange={e => updateLigne(idx, 'quantite', e.target.value)}
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Posologie *</label>
                                                            <input type="text" value={ligne.posologie} onChange={e => updateLigne(idx, 'posologie', e.target.value)} placeholder="1 comprime 3x/jour"
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Duree *</label>
                                                            <input type="text" value={ligne.duree} onChange={e => updateLigne(idx, 'duree', e.target.value)} placeholder="7 jours"
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                        <div className="sm:col-span-3">
                                                            <label className="mb-1 block text-xs text-[#706f6c]">Instructions particulieres</label>
                                                            <input type="text" value={ligne.instructions} onChange={e => updateLigne(idx, 'instructions', e.target.value)} placeholder="Pendant les repas"
                                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Etape 4 : Infos complementaires */}
                            {form.data.patient_id && (
                                <div>
                                    <Step n={4} label="Informations complementaires" />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Date de validite</label>
                                            <input type="date" value={form.data.date_validite} onChange={e => form.setData('date_validite', e.target.value)}
                                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Instructions generales</label>
                                            <textarea rows={2} value={form.data.instructions_generales} onChange={e => form.setData('instructions_generales', e.target.value)}
                                                placeholder="Recommandations, notes de suivi..."
                                                className="w-full resize-none rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm placeholder-[#706f6c] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e3e3e0] bg-white pt-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <button type="button" onClick={closeModal}
                                    className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                                    Annuler
                                </button>
                                <button type="submit" disabled={form.processing || !canSubmit}
                                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50">
                                    {form.processing
                                        ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Enregistrement...</>
                                        : <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>Valider la prescription</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

function ClipboardIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7C5.895 5 5 5.895 5 7v12c0 1.105.895 2 2 2h10c1.105 0 2-.895 2-2V7c0-1.105-.895-2-2-2h-2"/><path d="M9 5c0-1.105.895-2 2-2h2c1.105 0 2 .895 2 2s-.895 2-2 2h-2c-1.105 0-2-.895-2-2z"/><path d="M9 12h6M9 16h4" strokeLinecap="round"/></svg>;
}
function EyeIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function PrintIcon({ className }: { className?: string }) {
    return <svg className={className ?? 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9V2H18V9M6 18H4C2.895 18 2 17.105 2 16V11C2 9.895 2.895 9 4 9H20C21.105 9 22 9.895 22 11V16C22 17.105 21.105 18 20 18H18"/><path d="M18 14H6V22H18V14Z"/></svg>;
}
function RefreshIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>;
}
function TrashIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6H5H21"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>;
}
function PillIcon({ className }: { className?: string }) {
    return <svg className={className ?? 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="8" width="20" height="8" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/></svg>;
}
function XIcon({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}