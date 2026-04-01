import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';


// ─── Types ───────────────────────────────────────────────────
interface Categorie {
    id: number;
    code: string;
    nom: string;
    description: string | null;
    couleur: string;
    actif: boolean;
    medicaments_count: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    categories: PaginatedData<Categorie>;
    stats: { total: number; actives: number; inactives: number; total_medicaments: number };
    filters: { search?: string; statut?: string };
}

// ─── Formulaire modal ─────────────────────────────────────────
function CategorieModal({
    editItem,
    onClose,
}: {
    editItem: Categorie | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:        editItem?.code        ?? '',
        nom:         editItem?.nom         ?? '',
        description: editItem?.description ?? '',
        couleur:     editItem?.couleur     ?? '#3498db',
        actif:       editItem?.actif       ?? true,
    });

   const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
        router.put(`/categories/${editItem.id}`, data, {
            onSuccess: () => { reset(); onClose(); },
        });
    } else {
        router.post('/categories', data, {
            onSuccess: () => { reset(); onClose(); },
        });
    }
};
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-[#161615]">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                        {editItem ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Code *</label>
                            <input
                                type="text"
                                value={data.code}
                                onChange={e => setData('code', e.target.value)}
                                placeholder="CAT-011"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]"
                            />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Couleur</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={data.couleur}
                                    onChange={e => setData('couleur', e.target.value)}
                                    className="h-9 w-14 cursor-pointer rounded-lg border border-[#e3e3e0] p-1 dark:border-[#3E3E3A]"
                                />
                                <span className="text-xs text-[#706f6c]">{data.couleur}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom de la catégorie *</label>
                        <input
                            type="text"
                            value={data.nom}
                            onChange={e => setData('nom', e.target.value)}
                            placeholder="Ex: Antibiotiques"
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]"
                        />
                        {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Description</label>
                        <textarea
                            rows={3}
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            placeholder="Description de la catégorie..."
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Statut</label>
                        <select
                            value={data.actif ? 'Actif' : 'Inactif'}
                            onChange={e => setData('actif', e.target.value === 'Actif')}
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]"
                        >
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d2d2a] disabled:opacity-60 dark:bg-[#EDEDEC] dark:text-[#1b1b18]"
                        >
                            {processing ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Créer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────
export default function Categories({ categories, stats, filters }: Props) {
    const { flash }: any = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Categorie | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filtres locaux (soumis au serveur)
    const [search, setSearch]   = useState(filters.search  ?? '');
    const [statut, setStatut]   = useState(filters.statut  ?? 'Tous');

  const applyFilters = (overrides: object = {}) => {
    router.get('/categories', { search, statut, ...overrides }, {
        preserveState: true, replace: true,
    });
};

const handleDelete = (cat: Categorie) => {
    if (cat.medicaments_count > 0) {
        alert('Impossible de supprimer une catégorie liée à des médicaments.');
        return;
    }
    if (confirm(`Supprimer la catégorie "${cat.nom}" ?`)) {
        router.delete(`/categories/${cat.id}`);
    }
};

    return (
        <DashboardLayout title="Catégories" subtitle="Gestion des catégories de médicaments">
            {/* Flash message */}
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {flash.success}
                </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total catégories',    value: stats.total,             color: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
                    { label: 'Actives',              value: stats.actives,           color: 'text-[#27ae60]' },
                    { label: 'Total médicaments',    value: stats.total_medicaments, color: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
                    { label: 'Inactives',            value: stats.inactives,         color: 'text-[#e74c3c]' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                        <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Barre d'outils */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 11C17 14.3137 14.3137 17 11 17C7.68629 17 5 14.3137 5 11C5 7.68629 7.68629 5 11 5C14.3137 5 17 7.68629 17 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2 pl-9 pr-4 text-sm text-[#1b1b18] placeholder-[#706f6c] focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    />
                </div>

                <select
                    value={statut}
                    onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white py-2 px-3 text-sm text-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                >
                    <option>Tous</option>
                    <option>Actif</option>
                    <option>Inactif</option>
                </select>

                {/* Toggle vue */}
                <div className="flex rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A] overflow-hidden">
                    {(['grid', 'list'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setViewMode(m)}
                            className={`p-2 transition-colors ${viewMode === m ? 'bg-[#1b1b18] text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]' : 'bg-white text-[#706f6c] hover:bg-[#f5f5f3] dark:bg-[#161615] dark:hover:bg-[#1C1C1A]'}`}
                        >
                            {m === 'grid' ? (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => { setEditItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 rounded-lg bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d2d2a] dark:bg-[#EDEDEC] dark:text-[#1b1b18]"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouvelle catégorie
                </button>
            </div>

            {/* Vue Grille */}
            {viewMode === 'grid' && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.data.map(cat => (
                        <div key={cat.id} className="group relative rounded-xl border border-[#e3e3e0] bg-white overflow-hidden transition-shadow hover:shadow-md dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="h-1.5 w-full" style={{ backgroundColor: cat.couleur }} />
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: cat.couleur + '20' }}>
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" style={{ color: cat.couleur }}>
                                                <path d="M20.59 13.41L13.42 20.58C13.07 20.93 12.59 21.17 12.01 21.17C11.42 21.17 10.94 20.93 10.59 20.58L2 12V2H12L20.59 10.59C21.33 11.33 21.33 12.67 20.59 13.41Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{cat.nom}</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{cat.code}</p>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.actif ? 'bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                                        {cat.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </div>

                                {cat.description && (
                                    <p className="mt-3 text-xs leading-relaxed text-[#706f6c] dark:text-[#A1A09A] line-clamp-2">{cat.description}</p>
                                )}

                                <div className="mt-4 flex items-center justify-between border-t border-[#e3e3e0] pt-3 dark:border-[#3E3E3A]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.couleur }} />
                                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{cat.medicaments_count}</span>
                                        <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">médicament{cat.medicaments_count > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button onClick={() => { setEditItem(cat); setShowModal(true); }} className="rounded p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A]" title="Modifier">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        <button onClick={() => handleDelete(cat)} className="rounded p-1.5 text-[#706f6c] hover:bg-[#fee2e2] hover:text-[#e74c3c]" title="Supprimer">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6L18.13 19.14C18.06 20.2 17.18 21 16.11 21H7.89C6.82 21 5.94 20.2 5.87 19.14L5 6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vue Liste */}
            {viewMode === 'list' && (
                <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
                                {['Catégorie', 'Code', 'Description', 'Médicaments', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {categories.data.map(cat => (
                                <tr key={cat.id} className="hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.couleur }} />
                                            <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{cat.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#706f6c]">{cat.code}</td>
                                    <td className="max-w-xs truncate px-4 py-3 text-sm text-[#706f6c]">{cat.description ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: cat.couleur + '20', color: cat.couleur }}>
                                            {cat.medicaments_count}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cat.actif ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                                            {cat.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <button onClick={() => { setEditItem(cat); setShowModal(true); }} className="rounded p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A]">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(cat)} className="rounded p-1.5 text-[#706f6c] hover:bg-[#fee2e2] hover:text-[#e74c3c]">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6L18.13 19.14C18.06 20.2 17.18 21 16.11 21H7.89C6.82 21 5.94 20.2 5.87 19.14L5 6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {categories.last_page > 1 && (
                <div className="mt-4 flex justify-center gap-1">
                    {categories.links.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded px-3 py-1.5 text-sm transition-colors ${link.active ? 'bg-[#1b1b18] text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3E3E3A]'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {categories.data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucune catégorie trouvée</p>
                    <p className="text-sm text-[#706f6c]">Modifiez vos critères de recherche ou créez une nouvelle catégorie.</p>
                </div>
            )}

            {showModal && (
                <CategorieModal
                    editItem={editItem}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                />
            )}
        </DashboardLayout>
    );
}