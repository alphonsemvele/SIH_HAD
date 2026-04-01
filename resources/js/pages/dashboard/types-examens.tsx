import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────
interface TypeExamen {
    id: number;
    code: string;
    nom: string;
    description: string | null;
    module: 'laboratoire' | 'imagerie';
    categorie: string | null;
    modalite_imagerie_id: number | null;
    modalite_imagerie?: { id: number; code: string; nom: string } | null;
    prix: number | null;
    duree_minutes: number | null;
    actif: boolean;
    analyses_count: number;
    examens_imagerie_count: number;
}

interface Props {
    typesExamens: { data: TypeExamen[]; total: number; last_page: number; links: any[] };
    stats: { total: number; laboratoire: number; imagerie: number; actifs: number };
    modalites: { id: number; code: string; nom: string }[];
    filters: { search?: string; module?: string; actif?: string };
}

// ─── Constantes ───────────────────────────────────────────────
const CATEGORIES_LABO = ['Hématologie', 'Biochimie', 'Microbiologie', 'Immunologie', 'Parasitologie', 'Hormonologie', 'Toxicologie'];
const CATEGORIES_IMAGERIE = ['Radiologie conventionnelle', 'Imagerie en coupe', 'Sénologie', 'Dentisterie', 'Médecine nucléaire'];
const MODALITES = ['Radiographie', 'Scanner', 'IRM', 'Échographie', 'Mammographie', 'Panoramique', 'TEP-Scan'];

const MODALITE_COLORS: Record<string, string> = {
    Radiographie: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    Scanner:      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    IRM:          'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    Échographie:  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    Mammographie: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Panoramique:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'TEP-Scan':   'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// ─── Modale Formulaire ────────────────────────────────────────
function TypeExamenModal({
    editItem,
    onClose,
    modalites,
}: {
    editItem: TypeExamen | null;
    onClose: () => void;
    modalites: { id: number; code: string; nom: string }[];
}) {
    const [form, setForm] = useState({
        code: editItem?.code ?? '',
        nom: editItem?.nom ?? '',
        description: editItem?.description ?? '',
        module: editItem?.module ?? 'laboratoire' as 'laboratoire' | 'imagerie',
        categorie: editItem?.categorie ?? '',
        modalite_imagerie_id: editItem?.modalite_imagerie_id?.toString() ?? '',
        prix: editItem?.prix?.toString() ?? '',
        duree_minutes: editItem?.duree_minutes?.toString() ?? '',
        actif: editItem?.actif ?? true,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const inp = "w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";
    const lbl = "mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]";

    const categories = form.module === 'imagerie' ? CATEGORIES_IMAGERIE : CATEGORIES_LABO;

    const setModule = (m: 'laboratoire' | 'imagerie') => {
        setForm(f => ({ ...f, module: m, categorie: '', modalite_imagerie_id: '' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.module === 'imagerie' && !form.modalite_imagerie_id) {
            setErrors({ modalite_imagerie_id: 'La modalité est obligatoire pour l\'imagerie' });
            return;
        }
        setErrors({});
        setProcessing(true);
        const data = {
            ...form,
            prix: form.prix ? Number(form.prix) : null,
            duree_minutes: form.duree_minutes ? Number(form.duree_minutes) : null,
            modalite_imagerie_id: form.modalite_imagerie_id ? Number(form.modalite_imagerie_id) : null,
        };
        const opts = { onFinish: () => setProcessing(false), onSuccess: onClose };
        if (editItem) {
            router.put(`/type-examens/${editItem.id}`, data, opts);
        } else {
            router.post('/type-examens', data, opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            {editItem ? 'Modifier le type d\'examen' : 'Nouveau type d\'examen'}
                        </h2>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            Catalogue des examens disponibles
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    <div>
                        <label className={lbl}>Module *</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(['laboratoire', 'imagerie'] as const).map(m => (
                                <button key={m} type="button" onClick={() => setModule(m)}
                                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${form.module === m ? (m === 'laboratoire' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-sky-500 bg-sky-50 dark:bg-sky-900/20') : 'border-[#e3e3e0] hover:border-[#706f6c] dark:border-[#3E3E3A]'}`}>
                                    {/* icônes et labels inchangés */}
                                    {m === 'laboratoire' ? (
                                        <svg className={`h-8 w-8 ${form.module === 'laboratoire' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#706f6c] dark:text-[#A1A09A]'}`} viewBox="0 0 24 24" fill="none">
                                            <path d="M9 3H15M9 3V13.5L5.5 19C5.5 19 4 21 6 21H18C20 21 18.5 19 18.5 19L15 13.5V3M9 3H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="10" cy="17" r="1" fill="currentColor"/>
                                            <circle cx="14" cy="15" r="1" fill="currentColor"/>
                                        </svg>
                                    ) : (
                                        <svg className={`h-8 w-8 ${form.module === 'imagerie' ? 'text-sky-600 dark:text-sky-400' : 'text-[#706f6c] dark:text-[#A1A09A]'}`} viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                                            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                                            <path d="M3 8H21" stroke="currentColor" strokeWidth="1.5"/>
                                            <circle cx="6" cy="6" r="1" fill="currentColor"/>
                                        </svg>
                                    )}
                                    <div className="text-left">
                                        <p className={`font-medium capitalize ${form.module === m ? (m === 'laboratoire' ? 'text-emerald-700 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-400') : 'text-[#1b1b18] dark:text-[#EDEDEC]'}`}>
                                            {m === 'laboratoire' ? '🧪 Laboratoire' : '🩻 Imagerie'}
                                        </p>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            {m === 'laboratoire' ? 'Analyses biologiques' : 'Examens radiologiques'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Code *</label>
                            <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className={inp} placeholder="LAB-HEM-001" required />
                        </div>
                        <div>
                            <label className={lbl}>Nom *</label>
                            <input type="text" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} className={inp} placeholder="Numération Formule Sanguine" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Catégorie</label>
                            <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} className={inp}>
                                <option value="">Sélectionner...</option>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        {form.module === 'imagerie' && (
                            <div>
                                <label className={lbl}>Modalité *</label>
                                <select
                                    value={form.modalite_imagerie_id}
                                    onChange={e => setForm(f => ({ ...f, modalite_imagerie_id: e.target.value }))}
                                    className={`${inp} ${errors.modalite_imagerie_id ? 'border-red-500' : ''}`}
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {modalites.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.code ? `${m.code} - ` : ''}{m.nom}
                                        </option>
                                    ))}
                                </select>
                                {errors.modalite_imagerie_id && <p className="mt-1 text-xs text-red-500">{errors.modalite_imagerie_id}</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Prix (FCFA)</label>
                            <input type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} className={inp} min={0} placeholder="5000" />
                        </div>
                        <div>
                            <label className={lbl}>Durée estimée (min)</label>
                            <input type="number" value={form.duree_minutes} onChange={e => setForm(f => ({ ...f, duree_minutes: e.target.value }))} className={inp} min={0} placeholder="30" />
                        </div>
                    </div>

                    <div>
                        <label className={lbl}>Description</label>
                        <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp} placeholder="Description et indications..." />
                    </div>

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e3e3e0] p-3 dark:border-[#3E3E3A]">
                        <input type="checkbox" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))} className="h-4 w-4 rounded text-[#f53003]" />
                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Type d'examen actif</span>
                    </label>

                    <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                        <button type="button" onClick={onClose} className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {processing ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────
export default function TypesExamens({ typesExamens, stats, modalites, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<TypeExamen | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [module, setModule] = useState(filters.module ?? '');
    const [actif, setActif] = useState(filters.actif ?? '');

    if (!typesExamens) {
        return (
            <DashboardLayout title="Types d'examens" subtitle="Catalogue unifié laboratoire et imagerie">
                <div className="p-8 text-center text-red-600 dark:text-red-400">
                    Erreur : les données des types d'examens n'ont pas été chargées.
                </div>
            </DashboardLayout>
        );
    }

    const applyFilters = (overrides: object = {}) =>
        router.get('/type-examens', { search, module, actif, ...overrides }, { preserveState: true, replace: true });

    const handleDelete = (t: TypeExamen) => {
        const usages = t.analyses_count + t.examens_imagerie_count;
        if (usages > 0) {
            alert(`Impossible de supprimer : ce type est utilisé dans ${usages} examen(s).`);
            return;
        }
        if (confirm(`Supprimer "${t.nom}" ?`)) router.delete(`/type-examens/${t.id}`);
    };

    const openEdit = (t: TypeExamen) => { setEditItem(t); setShowModal(true); };
    const openNew  = () => { setEditItem(null); setShowModal(true); };

    return (
        <DashboardLayout title="Types d'examens" subtitle="Catalogue unifié laboratoire et imagerie">
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
            )}

            {/* Stats cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { l: 'Total', v: stats.total, color: 'text-[#f53003]', bg: 'bg-[#fff2f2] dark:bg-[#1D0002]', icon: '📋' },
                    { l: 'Laboratoire', v: stats.laboratoire, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '🧪' },
                    { l: 'Imagerie', v: stats.imagerie, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20', icon: '🩻' },
                    { l: 'Actifs', v: stats.actifs, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: '✅' },
                ].map(s => (
                    <div key={s.l} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${s.bg}`}>{s.icon}</div>
                        <p className={`text-2xl font-semibold ${s.color}`}>{s.v}</p>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.l}</p>
                    </div>
                ))}
            </div>

            {/* Filtres + Bouton nouveau */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Code, nom..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div className="flex rounded-lg border border-[#e3e3e0] bg-white p-1 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        {[['', 'Tous'], ['laboratoire', '🧪 Labo'], ['imagerie', '🩻 Imagerie']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => { setModule(val); applyFilters({ module: val }); }}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${module === val ? 'bg-[#f53003] text-white' : 'text-[#706f6c] hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <select
                        value={actif}
                        onChange={e => { setActif(e.target.value); applyFilters({ actif: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    >
                        <option value="">Tous statuts</option>
                        <option value="1">Actifs</option>
                        <option value="0">Inactifs</option>
                    </select>
                </div>

                <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouveau type
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-[#e3e3e0] bg-[#fafaf9] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                            <tr>
                                {['Code', 'Nom', 'Module', 'Catégorie / Modalité', 'Prix', 'Durée', 'Utilisations', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {typesExamens.data.map(t => (
                                <tr key={t.id} className="transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A]">
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <span className="font-mono text-sm font-medium text-[#f53003] dark:text-[#FF4433]">{t.code}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{t.nom}</p>
                                        {t.description && <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A] line-clamp-1">{t.description}</p>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${t.module === 'laboratoire' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'}`}>
                                            {t.module === 'laboratoire' ? '🧪' : '🩻'} {t.module === 'laboratoire' ? 'Labo' : 'Imagerie'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {t.categorie && <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{t.categorie}</p>}
                                        {t.modalite_imagerie && (
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${MODALITE_COLORS[t.modalite_imagerie.nom] ?? 'bg-gray-100 text-gray-700'}`}>
                                                {t.modalite_imagerie.nom}
                                            </span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {t.prix ? new Intl.NumberFormat('fr-CM').format(t.prix) + ' F' : '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {t.duree_minutes ? `${t.duree_minutes} min` : '—'}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center rounded-full bg-[#f5f5f3] px-2.5 py-1 text-xs font-medium text-[#706f6c] dark:bg-[#3E3E3A] dark:text-[#A1A09A]">
                                            {t.analyses_count + t.examens_imagerie_count} examen(s)
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${t.actif ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                            {t.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]" title="Modifier">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.47 4 3 4.45 3 5V20C3 20.55 3.47 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(t)} className="rounded-lg p-2 text-[#706f6c] hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400" title="Supprimer">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {typesExamens.data.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucun type d'examen trouvé</p>
                        <p className="text-sm text-[#706f6c]">Modifiez vos filtres ou créez un nouveau type.</p>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{typesExamens.total}</span> types d'examens
                    </p>
                    {typesExamens.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {typesExamens.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:opacity-40 dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && <TypeExamenModal editItem={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} modalites={modalites} />}
        </DashboardLayout>
    );
}