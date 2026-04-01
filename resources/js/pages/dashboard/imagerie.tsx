import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────
interface ExamenImagerie {
    id: number;
    numero: string;
    patient: { id: number; nom: string; prenom: string; sexe: string };
    type: string;
    modalite: string;
    modalite_id: number;
    region_anatomique: string | null;
    prescripteur: string;
    service: string;
    date_prescription: string;
    date_examen: string | null;
    salle: string | null;
    priorite: string;
    priorite_raw: string;
    statut: string;
    statut_raw: string;
    technicien: string | null;
    radiologue: string | null;
    nb_images: number;
    conclusion: string | null;
    contre_indications: string[];
    renseignements_cliniques: string | null;
}
interface Modalite   { id: number; nom: string; disponible: boolean }
interface TypeExamen { id: number; nom: string; modalite_imagerie_id: number }
interface Patient    { id: number; nom: string; prenom: string; sexe: string }
interface Medecin    { id: number; name: string }
interface Paginated<T> { data: T[]; total: number; last_page: number; links: any[] }

interface Props {
    examens:      Paginated<ExamenImagerie>;
    stats:        { total: number; en_attente: number; planifies: number; realises: number; interpretes: number; urgents: number };
    modalites:    Modalite[];
    typesExamens: TypeExamen[];
    patients:     Patient[];
    medecins:     Medecin[];
    filters:      { search?: string; statut?: string; priorite?: string; modalite_id?: string };
}

// ─── Constantes ───────────────────────────────────────────────
const MODALITE_STYLE: Record<string, { bg: string; icon: string }> = {
    'Radiographie': { bg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',           icon: '🩻' },
    'Scanner':      { bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '🔬' },
    'IRM':          { bg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: '🧲' },
    'Échographie':  { bg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',        icon: '📡' },
    'Mammographie': { bg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',        icon: '🎗️' },
    'Panoramique':  { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',    icon: '🦷' },
    'TEP-Scan':     { bg: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',        icon: '⚛️' },
};
const DEFAULT_STYLE = { bg: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: '📷' };

const STATUT_STYLE: Record<string, string> = {
    'En attente': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'Planifié':   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'En cours':   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Réalisé':    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Interprété': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const CI_LABELS: Record<string, string> = {
    allergie_iode:  'Allergie iode',
    grossesse:      'Grossesse',
    pacemaker:      'Pacemaker',
    claustrophobie: 'Claustrophobie',
};

// ─── Badges ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_STYLE[status] ?? STATUT_STYLE['En attente']}`}>
            {status}
        </span>
    );
}

function PrioriteBadge({ p }: { p: string }) {
    const s: Record<string, string> = {
        'Normal':      'bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
        'Urgent':      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        'Très urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${s[p] ?? s['Normal']}`}>{p}</span>;
}

function ModaliteBadge({ modalite }: { modalite: string }) {
    const style = MODALITE_STYLE[modalite] ?? DEFAULT_STYLE;
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg}`}>
            {style.icon} {modalite}
        </span>
    );
}

// ─── Modal Nouvelle demande ────────────────────────────────────
function NouvelleDemandeModal({ modalites, typesExamens, patients, medecins, onClose }: {
    modalites:    Modalite[];
    typesExamens: TypeExamen[];
    patients:     Patient[];
    medecins:     Medecin[];
    onClose:      () => void;
}) {
    const [form, setForm] = useState({
        patient_id:              '',
        medecin_prescripteur_id: '',
        type_examen_id:          '',
        modalite_imagerie_id:    '',
        region_anatomique:       '',
        priorite:                'normal',
        renseignements_cliniques:'',
        contre_indications:      [] as string[],
    });
    const [saving, setSaving] = useState(false);

    const safeModalites    = modalites    ?? [];
    const safeTypesExamens = typesExamens ?? [];
    const safePatients     = patients     ?? [];
    const safeMedecins     = medecins     ?? [];

    const filteredTypes = form.modalite_imagerie_id
        ? safeTypesExamens.filter(t => t.modalite_imagerie_id === parseInt(form.modalite_imagerie_id))
        : safeTypesExamens;

    const toggleCI = (ci: string) =>
        setForm(f => ({
            ...f,
            contre_indications: f.contre_indications.includes(ci)
                ? f.contre_indications.filter(c => c !== ci)
                : [...f.contre_indications, ci],
        }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.post('/imagerie', form as any, {
            onSuccess: onClose,
            onFinish:  () => setSaving(false),
        });
    };

    const inp = "w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615]">

                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Nouvelle demande d'imagerie</h2>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Prescription d'examen radiologique</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-5 p-6">

                    {/* Patient */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Patient *</label>
                        <select value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value})} className={inp} required>
                            <option value="">Sélectionner...</option>
                            {safePatients.map(p => <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>)}
                        </select>
                    </div>

                    {/* Prescripteur + Priorité */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Prescripteur *</label>
                            <select value={form.medecin_prescripteur_id} onChange={e => setForm({...form, medecin_prescripteur_id: e.target.value})} className={inp} required>
                                <option value="">Sélectionner...</option>
                                {safeMedecins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Priorité</label>
                            <select value={form.priorite} onChange={e => setForm({...form, priorite: e.target.value})} className={inp}>
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="tres_urgent">Très urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Modalité (boutons visuels) */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Modalité *</label>
                        <div className="grid grid-cols-3 gap-2">
                            {safeModalites.map(m => {
                                const style    = MODALITE_STYLE[m.nom] ?? DEFAULT_STYLE;
                                const selected = form.modalite_imagerie_id === String(m.id);
                                return (
                                    <button key={m.id} type="button"
                                        disabled={!m.disponible}
                                        onClick={() => setForm({...form, modalite_imagerie_id: String(m.id), type_examen_id: ''})}
                                        className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                                            !m.disponible
                                                ? 'cursor-not-allowed border-red-200 bg-red-50 opacity-50 dark:border-red-900/30 dark:bg-red-900/10'
                                                : selected
                                                    ? `border-[#f53003] ${style.bg}`
                                                    : 'border-[#e3e3e0] hover:border-[#f53003] dark:border-[#3E3E3A] dark:hover:border-[#f53003]'
                                        }`}>
                                        <span className="text-lg">{style.icon}</span>
                                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{m.nom}</span>
                                        {!m.disponible && <span className="ml-auto text-xs text-red-500">Indispo</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Type d'examen */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Type d'examen *</label>
                        <select value={form.type_examen_id} onChange={e => setForm({...form, type_examen_id: e.target.value})} className={inp} required>
                            <option value="">
                                {form.modalite_imagerie_id ? 'Sélectionner...' : 'Choisir une modalité d\'abord…'}
                            </option>
                            {filteredTypes.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                        </select>
                    </div>

                    {/* Région anatomique */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Région anatomique</label>
                        <select value={form.region_anatomique} onChange={e => setForm({...form, region_anatomique: e.target.value})} className={inp}>
                            <option value="">Sélectionner...</option>
                            {['Crâne / Encéphale', 'Thorax', 'Abdomen / Pelvis', 'Rachis', 'Membre supérieur', 'Membre inférieur', 'Cœur', 'Seins', 'Autres'].map(r => (
                                <option key={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Renseignements cliniques */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Renseignements cliniques</label>
                        <textarea rows={3} value={form.renseignements_cliniques}
                            onChange={e => setForm({...form, renseignements_cliniques: e.target.value})}
                            placeholder="Contexte, antécédents, hypothèse diagnostique..."
                            className={inp} />
                    </div>

                    {/* Contre-indications */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Contre-indications / Allergies</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(CI_LABELS).map(([ci, label]) => (
                                <label key={ci} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                                    form.contre_indications.includes(ci)
                                        ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                                        : 'border-[#e3e3e0] hover:bg-[#f5f5f3] dark:border-[#3E3E3A]'
                                }`}>
                                    <input type="checkbox" checked={form.contre_indications.includes(ci)}
                                        onChange={() => toggleCI(ci)}
                                        className="h-4 w-4 rounded text-red-500 focus:ring-red-500" />
                                    <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Annuler
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {saving ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal Détails / Compte-rendu ─────────────────────────────
function DetailModal({ examen, medecins, onClose }: {
    examen:   ExamenImagerie;
    medecins: Medecin[];
    onClose:  () => void;
}) {
    const [conclusion,   setConclusion]   = useState(examen.conclusion ?? '');
    const [radiologueId, setRadiologueId] = useState('');
    const [saving,       setSaving]       = useState(false);

    const saveConclusion = () => {
        setSaving(true);
        router.patch(`/imagerie/${examen.id}/conclusion`, { conclusion, radiologue_id: radiologueId || null }, {
            onSuccess: onClose,
            onFinish:  () => setSaving(false),
        });
    };

    const changeStatut = (s: string) =>
        router.patch(`/imagerie/${examen.id}/statut`, { statut: s }, { onSuccess: onClose });

    const nextStatut = (): { value: string; label: string } | null => {
        const map: Record<string, { value: string; label: string }> = {
            'en_attente': { value: 'planifie', label: '→ Planifier' },
            'planifie':   { value: 'en_cours', label: '→ Démarrer' },
            'en_cours':   { value: 'realise',  label: '→ Marquer réalisé' },
        };
        return map[examen.statut_raw] ?? null;
    };

    const safeMedecins = medecins ?? [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615]">

                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{examen.type}</h2>
                            <StatusBadge status={examen.statut} />
                            <PrioriteBadge p={examen.priorite} />
                        </div>
                        <p className="font-mono text-sm text-[#f53003]">{examen.numero}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Patient */}
                    <div className="flex items-center gap-4 rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold ${examen.patient.sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                            {examen.patient.prenom[0]}{examen.patient.nom[0]}
                        </div>
                        <div className="flex-1">
                            <p className="text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{examen.patient.prenom} {examen.patient.nom}</p>
                            <ModaliteBadge modalite={examen.modalite} />
                        </div>
                        <div className="text-right text-sm text-[#706f6c]">
                            <p>Prescripteur : <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{examen.prescripteur}</span></p>
                            <p>{examen.service}</p>
                        </div>
                    </div>

                    {/* Infos */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[
                            { label: 'Modalité', value: examen.modalite },
                            { label: 'Région',   value: examen.region_anatomique ?? '—' },
                            { label: 'Demande',  value: examen.date_prescription },
                            { label: 'Examen',   value: examen.date_examen ?? '—' },
                        ].map(c => (
                            <div key={c.label} className="rounded-lg border border-[#e3e3e0] p-3 dark:border-[#3E3E3A]">
                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{c.label}</p>
                                <p className="mt-1 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{c.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contre-indications */}
                    {examen.contre_indications?.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">⚠️ Contre-indications signalées</p>
                            <div className="flex flex-wrap gap-2">
                                {examen.contre_indications.map(ci => (
                                    <span key={ci} className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {CI_LABELS[ci] ?? ci}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Renseignements cliniques */}
                    {examen.renseignements_cliniques && (
                        <div className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                            <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Renseignements cliniques</p>
                            <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{examen.renseignements_cliniques}</p>
                        </div>
                    )}

                    {/* Avancement statut */}
                    {!['interprete'].includes(examen.statut_raw) && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Avancement</p>
                            <div className="flex items-center gap-2">
                                {(['en_attente', 'planifie', 'en_cours', 'realise', 'interprete'] as const).map((s, i) => {
                                    const labels: Record<string, string> = { en_attente: 'En attente', planifie: 'Planifié', en_cours: 'En cours', realise: 'Réalisé', interprete: 'Interprété' };
                                    const currentIdx = ['en_attente', 'planifie', 'en_cours', 'realise', 'interprete'].indexOf(examen.statut_raw);
                                    return (
                                        <button key={s} onClick={() => changeStatut(s)}
                                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                                                i === currentIdx ? 'bg-[#f53003] text-white' :
                                                i < currentIdx  ? 'bg-green-500 text-white' :
                                                'bg-[#f5f5f3] text-[#706f6c] hover:bg-[#e3e3e0] dark:bg-[#1C1C1A] dark:text-[#A1A09A]'
                                            }`}>
                                            {labels[s]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Compte-rendu existant */}
                    {examen.conclusion && (
                        <div>
                            <h4 className="mb-3 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Compte-rendu</h4>
                            <div className="rounded-lg border border-[#e3e3e0] bg-[#fafaf9] p-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                <p className="text-sm leading-relaxed text-[#1b1b18] dark:text-[#EDEDEC]">{examen.conclusion}</p>
                                {examen.radiologue && (
                                    <p className="mt-3 border-t border-[#e3e3e0] pt-2 text-xs text-[#706f6c] dark:border-[#3E3E3A]">
                                        Validé par {examen.radiologue} · {examen.date_examen}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Saisie compte-rendu */}
                    {examen.statut_raw === 'realise' && !examen.conclusion && (
                        <div>
                            <h4 className="mb-3 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Saisir le compte-rendu</h4>
                            <div className="space-y-3">
                                <select value={radiologueId} onChange={e => setRadiologueId(e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                                    <option value="">Radiologue signataire (optionnel)...</option>
                                    {safeMedecins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                                <textarea rows={5} value={conclusion}
                                    onChange={e => setConclusion(e.target.value)}
                                    placeholder="Rédigez votre compte-rendu radiologique..."
                                    className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 flex items-center justify-between border-t border-[#e3e3e0] bg-[#fafaf9] px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                    <button className="flex items-center gap-1 rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9M6 18H4C2.9 18 2 17.1 2 16V11C2 9.9 2.9 9 4 9H20C21.1 9 22 9.9 22 11V16C22 17.1 21.1 18 20 18H18M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Imprimer
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Fermer
                        </button>
                        {examen.statut_raw === 'realise' && !examen.conclusion && (
                            <button onClick={saveConclusion} disabled={saving || !conclusion.trim()}
                                className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {saving ? 'Validation...' : 'Valider le compte-rendu'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────
export default function Imagerie({ examens, stats, modalites, typesExamens, patients, medecins, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showNew,  setShowNew]  = useState(false);
    const [selected, setSelected] = useState<ExamenImagerie | null>(null);
    const [search,   setSearch]   = useState(filters.search      ?? '');
    const [statut,   setStatut]   = useState(filters.statut      ?? '');
    const [priorite, setPriorite] = useState(filters.priorite    ?? '');
    const [modalite, setModalite] = useState(filters.modalite_id ?? '');

    const safeModalites = modalites ?? [];

    const applyFilters = (ov: object = {}) =>
        router.get('/imagerie', { search, statut, priorite, modalite_id: modalite, ...ov }, { preserveState: true, replace: true });

    const handleDelete = (e: ExamenImagerie) => {
        if (confirm(`Supprimer "${e.numero}" ?`)) router.delete(`/imagerie/${e.id}`);
    };

    return (
        <DashboardLayout title="Imagerie médicale" subtitle="Radiologie et examens d'imagerie">
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {[
                    { label: 'Total',       value: stats.total,       color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: '📷' },
                    { label: 'En attente',  value: stats.en_attente,  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: '⏳' },
                    { label: 'Planifiés',   value: stats.planifies,   color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: '📅' },
                    { label: 'Réalisés',    value: stats.realises,    color: 'text-teal-600 dark:text-teal-400',    bg: 'bg-teal-50 dark:bg-teal-900/20',    icon: '✔️' },
                    { label: 'Interprétés', value: stats.interpretes, color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  icon: '📋' },
                    { label: 'Urgents',     value: stats.urgents,     color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20',      icon: '⚡' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${s.bg}`}>{s.icon}</div>
                        <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Cartes modalités */}
            <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Modalités d'imagerie</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {safeModalites.map(m => {
                        const style = MODALITE_STYLE[m.nom] ?? DEFAULT_STYLE;
                        return (
                            <div key={m.id} className={`rounded-xl border p-4 ${m.disponible ? 'border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]' : 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'}`}>
                                <div className="mb-1 text-2xl">{style.icon}</div>
                                <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{m.nom}</p>
                                <p className={`text-xs ${m.disponible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {m.disponible ? 'Disponible' : 'Maintenance'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[180px] flex-1">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c]" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input type="text" placeholder="N° examen ou patient..." value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2 pl-9 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                </div>

                <select value={modalite} onChange={e => { setModalite(e.target.value); applyFilters({ modalite_id: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option value="">Toutes modalités</option>
                    {safeModalites.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>

                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option value="">Tous statuts</option>
                    <option value="en_attente">En attente</option>
                    <option value="planifie">Planifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="realise">Réalisé</option>
                    <option value="interprete">Interprété</option>
                </select>

                <select value={priorite} onChange={e => { setPriorite(e.target.value); applyFilters({ priorite: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option value="">Toutes priorités</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="tres_urgent">Très urgent</option>
                </select>

                <button onClick={() => setShowNew(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouvelle demande
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] bg-[#fafaf9] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                {['N° Examen', 'Patient', 'Examen', 'Modalité', 'Prescripteur', 'Date', 'Priorité', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {examens.data.map(e => (
                                <tr key={e.id} className="hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A]">
                                    <td className="px-4 py-4">
                                        <span className="font-mono text-sm font-medium text-[#f53003]">{e.numero}</span>
                                        {e.contre_indications?.length > 0 && (
                                            <span className="ml-2 text-xs" title="Contre-indications signalées">⚠️</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${e.patient.sexe === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                                {e.patient.prenom[0]}{e.patient.nom[0]}
                                            </div>
                                            <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{e.patient.prenom} {e.patient.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{e.type}</p>
                                        {e.region_anatomique && <p className="text-xs text-[#706f6c]">{e.region_anatomique}</p>}
                                    </td>
                                    <td className="px-4 py-4"><ModaliteBadge modalite={e.modalite} /></td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{e.prescripteur}</p>
                                        <p className="text-xs text-[#706f6c]">{e.service}</p>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-[#706f6c]">{e.date_examen ?? e.date_prescription}</td>
                                    <td className="px-4 py-4"><PrioriteBadge p={e.priorite} /></td>
                                    <td className="px-4 py-4"><StatusBadge status={e.statut} /></td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setSelected(e)}
                                                className="rounded-lg p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]" title="Voir">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(e)}
                                                className="rounded-lg p-1.5 text-[#706f6c] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400" title="Supprimer">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {examens.data.length === 0 && (
                    <div className="py-14 text-center">
                        <p className="mb-2 text-4xl">🩻</p>
                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucun examen trouvé</p>
                        <p className="text-sm text-[#706f6c]">Modifiez vos filtres ou créez une nouvelle demande.</p>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-[#e3e3e0] px-4 py-3 dark:border-[#3E3E3A]">
                    <p className="text-sm text-[#706f6c]">
                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{examens.total}</span> examens
                    </p>
                    {examens.last_page > 1 && (
                        <div className="flex gap-1">
                            {examens.links.map((l, i) => (
                                <button key={i} disabled={!l.url}
                                    onClick={() => l.url && router.get(l.url, {}, { preserveState: true })}
                                    className={`rounded px-3 py-1.5 text-sm ${l.active ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:opacity-40 dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                    dangerouslySetInnerHTML={{ __html: l.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showNew && (
                <NouvelleDemandeModal
                    modalites={modalites ?? []}
                    typesExamens={typesExamens ?? []}
                    patients={patients ?? []}
                    medecins={medecins ?? []}
                    onClose={() => setShowNew(false)} />
            )}
            {selected && (
                <DetailModal
                    examen={selected}
                    medecins={medecins ?? []}
                    onClose={() => setSelected(null)} />
            )}
        </DashboardLayout>
    );
}