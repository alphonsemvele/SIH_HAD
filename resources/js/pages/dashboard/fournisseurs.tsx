import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────
interface Fournisseur {
    id: number;
    code: string;
    nom: string;
    type: 'laboratoire' | 'grossiste' | 'importateur';
    adresse: string | null;
    ville: string | null;
    pays: string;
    telephone: string | null;
    email: string | null;
    site_web: string | null;
    contact_nom: string | null;
    contact_telephone: string | null;
    delai_livraison_jours: number;
    conditions_paiement: string | null;
    actif: boolean;
    medicaments_count: number;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    fournisseurs: PaginatedData<Fournisseur>;
    stats: { total: number; actifs: number; total_commandes: number; montant_total: number };
    villes: string[];
    filters: { search?: string; ville?: string; statut?: string };
}

// ─── Helpers ─────────────────────────────────────────────────
function delaiLabel(jours: number): string {
    if (jours <= 1) return '24h';
    if (jours <= 2) return '48h';
    if (jours <= 3) return '72h';
    return `${jours} jours`;
}

function formatMontant(m: number): string {
    return new Intl.NumberFormat('fr-CM', {
        style: 'currency', currency: 'XAF', maximumFractionDigits: 0,
    }).format(m);
}

function TypeBadge({ type }: { type: string }) {
    const map: Record<string, string> = {
        laboratoire: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        grossiste:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        importateur: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[type] ?? ''}`}>
            {type}
        </span>
    );
}

// ─── Modal Formulaire ─────────────────────────────────────────
function FournisseurModal({
    editItem,
    onClose,
}: {
    editItem: Fournisseur | null;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code:                  editItem?.code                  ?? '',
        nom:                   editItem?.nom                   ?? '',
        type:                  editItem?.type                  ?? 'grossiste',
        adresse:               editItem?.adresse               ?? '',
        ville:                 editItem?.ville                 ?? '',
        pays:                  editItem?.pays                  ?? 'Cameroun',
        telephone:             editItem?.telephone             ?? '',
        email:                 editItem?.email                 ?? '',
        site_web:              editItem?.site_web              ?? '',
        contact_nom:           editItem?.contact_nom           ?? '',
        contact_telephone:     editItem?.contact_telephone     ?? '',
        delai_livraison_jours: editItem?.delai_livraison_jours ?? 2,
        conditions_paiement:   editItem?.conditions_paiement   ?? '',
        actif:                 editItem?.actif                 ?? true,
    });

 const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
        router.put(`/fournisseurs/${editItem.id}`, data, {
            onSuccess: () => { reset(); onClose(); },
        });
    } else {
        router.post('/fournisseurs', data, {
            onSuccess: () => { reset(); onClose(); },
        });
    }
};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-[#161615]">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                        {editItem ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Code *</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} placeholder="FOUR-006"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Type *</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value as any)}
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">
                                <option value="laboratoire">Laboratoire</option>
                                <option value="grossiste">Grossiste</option>
                                <option value="importateur">Importateur</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Nom du fournisseur *</label>
                        <input type="text" value={data.nom} onChange={e => setData('nom', e.target.value)} placeholder="Ex: Pharma Cam Distribution"
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                        {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Contact</label>
                            <input type="text" value={data.contact_nom} onChange={e => setData('contact_nom', e.target.value)} placeholder="M. Jean Mbarga"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Tél. contact</label>
                            <input type="tel" value={data.contact_telephone} onChange={e => setData('contact_telephone', e.target.value)} placeholder="+237 677 000 000"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Téléphone</label>
                            <input type="tel" value={data.telephone} onChange={e => setData('telephone', e.target.value)} placeholder="+237 222 000 000"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Email</label>
                            <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="contact@fournisseur.cm"
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Adresse</label>
                        <input type="text" value={data.adresse} onChange={e => setData('adresse', e.target.value)} placeholder="Adresse complète"
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Ville</label>
                            <select value={data.ville} onChange={e => setData('ville', e.target.value)}
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">
                                <option value="">Choisir...</option>
                                {['Yaoundé', 'Douala', 'Bafoussam', 'Garoua', 'Maroua', 'Bamenda'].map(v => (
                                    <option key={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Délai livraison (jours)</label>
                            <select value={data.delai_livraison_jours} onChange={e => setData('delai_livraison_jours', parseInt(e.target.value))}
                                className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">
                                <option value={1}>24h (1 jour)</option>
                                <option value={2}>48h (2 jours)</option>
                                <option value={3}>72h (3 jours)</option>
                                <option value={5}>5 jours</option>
                                <option value={7}>7 jours</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Statut</label>
                        <select value={data.actif ? 'Actif' : 'Inactif'} onChange={e => setData('actif', e.target.value === 'Actif')}
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white px-3 py-2 text-sm focus:outline-none dark:border-[#3E3E3A] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">
                            <option>Actif</option>
                            <option>Inactif</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2d2a] disabled:opacity-60 dark:bg-[#EDEDEC] dark:text-[#1b1b18]">
                            {processing ? 'Enregistrement...' : editItem ? 'Mettre à jour' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal Détails ────────────────────────────────────────────
function DetailModal({ item, onClose, onEdit }: { item: Fournisseur; onClose: () => void; onEdit: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-[#161615]">
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{item.nom}</h2>
                            <TypeBadge type={item.type} />
                        </div>
                        <p className="text-sm text-[#706f6c]">{item.code} · {item.ville ?? item.pays}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { label: 'Contact',         value: item.contact_nom },
                        { label: 'Tél. contact',    value: item.contact_telephone },
                        { label: 'Téléphone',       value: item.telephone },
                        { label: 'Email',           value: item.email },
                        { label: 'Délai livraison', value: delaiLabel(item.delai_livraison_jours) },
                        { label: 'Statut',          value: item.actif ? 'Actif' : 'Inactif' },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-lg bg-[#f5f5f3] p-3 dark:bg-[#1C1C1A]">
                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{label}</p>
                            <p className="mt-0.5 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{value ?? '—'}</p>
                        </div>
                    ))}
                    {item.adresse && (
                        <div className="rounded-lg bg-[#f5f5f3] p-3 dark:bg-[#1C1C1A] sm:col-span-2">
                            <p className="text-xs text-[#706f6c]">Adresse</p>
                            <p className="mt-0.5 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{item.adresse}</p>
                        </div>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#e3e3e0] p-3 text-center dark:border-[#3E3E3A]">
                        <p className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{item.medicaments_count}</p>
                        <p className="text-xs text-[#706f6c]">Médicaments référencés</p>
                    </div>
                    <div className="rounded-lg border border-[#e3e3e0] p-3 text-center dark:border-[#3E3E3A]">
                        <p className="text-sm font-bold text-[#1b1b18] dark:text-[#EDEDEC]">{delaiLabel(item.delai_livraison_jours)}</p>
                        <p className="text-xs text-[#706f6c]">Délai de livraison</p>
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                        Fermer
                    </button>
                    <button onClick={onEdit} className="rounded-lg bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2d2a] dark:bg-[#EDEDEC] dark:text-[#1b1b18]">
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────
export default function Fournisseurs({ fournisseurs, stats, villes, filters }: Props) {
    const { flash }: any = usePage().props;

    const [showModal,  setShowModal]  = useState(false);
    const [editItem,   setEditItem]   = useState<Fournisseur | null>(null);
    const [detailItem, setDetailItem] = useState<Fournisseur | null>(null);

    const [search, setSearch] = useState(filters.search ?? '');
    const [ville,  setVille]  = useState(filters.ville  ?? 'Toutes');
    const [statut, setStatut] = useState(filters.statut ?? 'Tous');

  const applyFilters = (overrides: object = {}) => {
    router.get('/fournisseurs', { search, ville, statut, ...overrides }, {
        preserveState: true, replace: true,
    });
};

const handleDelete = (f: Fournisseur) => {
    if (f.medicaments_count > 0) {
        alert('Impossible de supprimer un fournisseur lié à des médicaments.');
        return;
    }
    if (confirm(`Supprimer le fournisseur "${f.nom}" ?`)) {
        router.delete(`/fournisseurs/${f.id}`);
    }
};

    return (
        <DashboardLayout title="Fournisseurs" subtitle="Gestion des fournisseurs de médicaments">
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {flash.success}
                </div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total fournisseurs', value: stats.total,           display: String(stats.total),                color: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
                    { label: 'Actifs',             value: stats.actifs,          display: String(stats.actifs),               color: 'text-[#27ae60]' },
                    { label: 'Total commandes',    value: stats.total_commandes, display: String(stats.total_commandes),       color: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
                    { label: 'Montant total',      value: stats.montant_total,   display: formatMontant(stats.montant_total),  color: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                        <p className={`mt-1 truncate text-xl font-bold ${s.color}`}>{s.display}</p>
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
                        type="text" placeholder="Rechercher un fournisseur..." value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2 pl-9 pr-4 text-sm text-[#1b1b18] placeholder-[#706f6c] focus:border-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    />
                </div>

                <select value={ville} onChange={e => { setVille(e.target.value); applyFilters({ ville: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white py-2 px-3 text-sm text-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option>Toutes</option>
                    {villes.map(v => <option key={v}>{v}</option>)}
                </select>

                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                    className="rounded-lg border border-[#e3e3e0] bg-white py-2 px-3 text-sm text-[#1b1b18] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                    <option>Tous</option>
                    <option>Actif</option>
                    <option>Inactif</option>
                </select>

                <button onClick={() => { setEditItem(null); setShowModal(true); }}
                    className="flex items-center gap-2 rounded-lg bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d2d2a] dark:bg-[#EDEDEC] dark:text-[#1b1b18]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouveau fournisseur
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-auto rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="border-b border-[#e3e3e0] bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
                            {['Fournisseur', 'Type', 'Contact', 'Délai', 'Médicaments', 'Statut', 'Actions'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                        {fournisseurs.data.map(f => (
                            <tr key={f.id} className="transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{f.nom}</p>
                                    <p className="text-xs text-[#706f6c]">{f.code}{f.ville ? ` · ${f.ville}` : ''}</p>
                                </td>
                                <td className="px-4 py-3"><TypeBadge type={f.type} /></td>
                                <td className="px-4 py-3">
                                    <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{f.contact_nom ?? '—'}</p>
                                    <p className="text-xs text-[#706f6c]">{f.telephone ?? ''}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                        {delaiLabel(f.delai_livraison_jours)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full bg-[#f5f5f3] px-2.5 py-1 text-sm font-medium text-[#1b1b18] dark:bg-[#1C1C1A] dark:text-[#EDEDEC]">
                                        {f.medicaments_count}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${f.actif ? 'bg-[#dcfce7] text-[#166534] dark:bg-[#14532d] dark:text-[#bbf7d0]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                                        {f.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setDetailItem(f)} className="rounded p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A]" title="Voir">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                                        </button>
                                        <button onClick={() => { setEditItem(f); setShowModal(true); }} className="rounded p-1.5 text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:hover:bg-[#1C1C1A]" title="Modifier">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.45 4 3 4.45 3 5V20C3 20.55 3.45 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                        <button onClick={() => handleDelete(f)} className="rounded p-1.5 text-[#706f6c] hover:bg-[#fee2e2] hover:text-[#e74c3c]" title="Supprimer">
                                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6L18.13 19.14C18.06 20.2 17.18 21 16.11 21H7.89C6.82 21 5.94 20.2 5.87 19.14L5 6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {fournisseurs.data.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucun fournisseur trouvé</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {fournisseurs.last_page > 1 && (
                <div className="mt-4 flex justify-center gap-1">
                    {fournisseurs.links.map((link, i) => (
                        <button
                            key={i} disabled={!link.url}
                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                            className={`rounded px-3 py-1.5 text-sm transition-colors ${link.active ? 'bg-[#1b1b18] text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-40'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {detailItem && (
                <DetailModal
                    item={detailItem}
                    onClose={() => setDetailItem(null)}
                    onEdit={() => { setEditItem(detailItem); setDetailItem(null); setShowModal(true); }}
                />
            )}

            {showModal && (
                <FournisseurModal
                    editItem={editItem}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                />
            )}
        </DashboardLayout>
    );
}