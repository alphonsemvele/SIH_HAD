import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';


interface Anomalie {
    id: number;
    nom: string;
    categorie: string | null;
    description: string | null;
    actif: boolean;
}

interface Props {
    anomalies:  Anomalie[];
    categories: string[];
    filters:    { search?: string; categorie?: string };
}

// ─── Catégories de maladies / pathologies ─────────────────────────────────────
const CATEGORIES_PHARMACIE = [
    'Cardiovasculaire',
    'Respiratoire',
    'Neurologique',
    'Digestif / Gastro-entérologie',
    'Endocrinologie / Métabolisme',
    'Infectieux / Parasitaire',
    'Dermatologie',
    'Rhumatologie / Ostéo-articulaire',
    'Urologie / Néphrologie',
    'Gynécologie / Obstétrique',
    'Pédiatrie',
    'Psychiatrie / Santé mentale',
    'Ophtalmologie',
    'ORL',
    'Hématologie / Oncologie',
    'Immunologie / Allergologie',
    'Traumatologie / Orthopédie',
    'Chirurgie',
    'Urgences',
    'Autre',
];

const FORM_VIDE = { nom: '', categorie: '', description: '' };

export default function AnomaliesIndex({
    anomalies  = [],
    categories = [],
    filters    = {},
}: Partial<Props>) {
    const { flash, errors: serverErrors } = usePage<{
        flash?: { success?: string; error?: string };
        errors: Record<string, string>;
    }>().props;

    const [search,    setSearch]    = useState(filters.search    ?? '');
    const [categorie, setCategorie] = useState(filters.categorie ?? '');

    // Modal
    const [modal,   setModal]   = useState<'create' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Anomalie | null>(null);
    const [form,    setForm]    = useState(FORM_VIDE);

    const ouvrirCreate = () => {
        setForm(FORM_VIDE);
        setEditing(null);
        setModal('create');
    };

    const ouvrirEdit = (a: Anomalie) => {
        setForm({ nom: a.nom, categorie: a.categorie ?? '', description: a.description ?? '' });
        setEditing(a);
        setModal('edit');
    };

    const fermer = () => { setModal(null); setEditing(null); };

    const applyFilters = (s: string, c: string) => {
        router.get('/anomalies',
            { search: s || undefined, categorie: c || undefined },
            { preserveScroll: true, replace: true });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form };

        if (modal === 'create') {
            router.post('/anomalies', payload, {
                preserveScroll: true,
                onSuccess: fermer,
            });
        } else if (editing) {
            router.put(`/anomalies/${editing.id}`, payload, {
                preserveScroll: true,
                onSuccess: fermer,
            });
        }
    };

    const toggleActif = (a: Anomalie) => {
        router.put(`/anomalies/${a.id}`,
            { nom: a.nom, categorie: a.categorie ?? '', description: a.description ?? '', actif: !a.actif },
            { preserveScroll: true }
        );
    };

    const supprimer = (a: Anomalie) => {
        if (!confirm(`Supprimer « ${a.nom} » ?`)) return;
        router.delete(`/anomalies/${a.id}`, { preserveScroll: true });
    };

    // Grouper par catégorie pour l'affichage
    const groupes: Record<string, Anomalie[]> = {};
    for (const a of anomalies) {
        const cle = a.categorie ?? '—';
        if (!groupes[cle]) groupes[cle] = [];
        groupes[cle].push(a);
    }

    return (
        <DashboardLayout title="Anomalies pharmacie" subtitle="Référentiel des anomalies déclarables">

            {/* Flash */}
            {(flash?.success || flash?.error) && (
                <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${flash.error
                    ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                    : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                    {flash.success ?? flash.error}
                </div>
            )}

            {/* ── Barre filtres + bouton ──────────────────────────── */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 11A6 6 0 111 11A6 6 0 0117 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input type="text" value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') applyFilters(search, categorie); }}
                        placeholder="Rechercher une anomalie…"
                        className="w-full rounded-lg border border-[#e3e3e0] py-2.5 pl-9 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"/>
                </div>

                <select value={categorie}
                    onChange={e => { setCategorie(e.target.value); applyFilters(search, e.target.value); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option value="">Toutes les catégories</option>
                    {CATEGORIES_PHARMACIE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <button onClick={ouvrirCreate}
                    className="ml-auto flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    Nouvelle anomalie
                </button>
            </div>

            {/* ── Contenu ─────────────────────────────────────────── */}
            {anomalies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#e3e3e0] py-20 text-center dark:border-[#3E3E3A]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucune anomalie dans le référentiel.</p>
                    <button onClick={ouvrirCreate} className="mt-3 text-sm font-medium text-[#f53003] hover:underline">
                        Ajouter la première
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupes)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([categorieName, items]) => (
                            <div key={categorieName}>
                                {/* Titre de catégorie */}
                                <div className="mb-2 flex items-center gap-3">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                        {categorieName}
                                    </span>
                                    <div className="h-px flex-1 bg-[#e3e3e0] dark:bg-[#3E3E3A]"/>
                                    <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{items.length}</span>
                                </div>

                                {/* Ligne par anomalie */}
                                <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    {items.map((a, i) => (
                                        <div key={a.id}
                                            className={`flex items-start justify-between gap-4 px-5 py-4 ${i < items.length - 1 ? 'border-b border-[#e3e3e0] dark:border-[#3E3E3A]' : ''} ${!a.actif ? 'opacity-50' : ''}`}>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{a.nom}</p>
                                                    {!a.actif && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                            Inactif
                                                        </span>
                                                    )}
                                                </div>
                                                {a.description && (
                                                    <p className="mt-0.5 truncate text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        {a.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-shrink-0 items-center gap-1">
                                                <button onClick={() => ouvrirEdit(a)}
                                                    className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                                                    title="Modifier">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        <path d="M11 4H4C3.448 4 3 4.448 3 5V19C3 19.552 3.448 20 4 20H18C18.552 20 19 19.552 19 19V12M17.586 2.586A2 2 0 0120.414 5.414L11.828 14H9V11.172L17.586 2.586Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                <button onClick={() => toggleActif(a)}
                                                    className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A] dark:hover:text-[#EDEDEC]"
                                                    title={a.actif ? 'Désactiver' : 'Activer'}>
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        {a.actif
                                                            ? <path d="M18.36 6.64A9 9 0 115.64 18.36M12 2V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                            : <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        }
                                                    </svg>
                                                </button>
                                                <button onClick={() => supprimer(a)}
                                                    className="rounded-lg p-2 text-[#706f6c] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                    title="Supprimer">
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                        <path d="M3 6H5H21M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18 20C18 20.552 17.552 21 17 21H7C6.448 21 6 20.552 6 20L5 6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* ── Modal create / edit ─────────────────────────────── */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <h2 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                {modal === 'create' ? 'Nouvelle anomalie' : `Modifier — ${editing?.nom}`}
                            </h2>
                            <button onClick={fermer} className="rounded-lg p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#3E3E3A]">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Nom *
                                </label>
                                <input type="text" value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                                    placeholder="ex : Hypertension artérielle"
                                    required autoFocus
                                    className={inputCls + (serverErrors?.nom ? ' border-red-400' : '')}/>
                                {serverErrors?.nom && <p className="mt-1 text-xs text-red-500">{serverErrors.nom}</p>}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Catégorie
                                </label>
                                <select value={form.categorie}
                                    onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                                    className={inputCls}>
                                    <option value="">— Choisir une catégorie —</option>
                                    {CATEGORIES_PHARMACIE.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                    Description
                                </label>
                                <textarea value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3} placeholder="Description optionnelle…"
                                    className={inputCls + ' resize-none'}/>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                                <button type="button" onClick={fermer}
                                    className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                                    Annuler
                                </button>
                                <button type="submit"
                                    className="rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03]">
                                    {modal === 'create' ? 'Ajouter' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

const inputCls = "w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";