import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────
interface Medicament {
    id: number;
    code: string;
    nom: string;
    dci: string;
    forme: string;
    dosage: string | null;
    categorie: string | null;
    categorie_id: number | null;
    stock_actuel: number;
    stock_minimum: number;
    stock_maximum: number;
    prix_achat: number;
    prix_vente: number;
    fournisseur: string | null;
    fournisseur_id: number | null;
    date_expiration: string | null;
    ordonnance_obligatoire: boolean;
    actif: boolean;
    statut: 'En stock' | 'Stock bas' | 'Rupture' | 'Péremption proche';
}

interface Categorie  { id: number; nom: string }
interface Fournisseur { id: number; nom: string }

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    medicaments:  PaginatedData<Medicament>;
    stats:        { total: number; en_stock: number; stock_bas: number; ruptures: number; peremption: number };
    alertes:      { ruptures: string; peremption: string };
    categories:   Categorie[];
    fournisseurs: Fournisseur[];
    filters:      { search?: string; categorie_id?: string; statut?: string; fournisseur_id?: string };
}

// ─── Helpers ──────────────────────────────────────────────────
const formatPrice = (n: number) =>
    new Intl.NumberFormat('fr-CM').format(n) + ' FCFA';

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'En stock':         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        'Stock bas':        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        'Rupture':          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        'Péremption proche':'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles['En stock']}`}>
            {status}
        </span>
    );
}

// ─── Modal Formulaire ─────────────────────────────────────────
function MedicamentModal({
    editItem,
    categories,
    fournisseurs,
    onClose,
}: {
    editItem: Medicament | null;
    categories: Categorie[];
    fournisseurs: Fournisseur[];
    onClose: () => void;
}) {
    const { data, setData, processing, errors, reset } = useForm({
        code:                    editItem?.code                    ?? '',
        nom:                     editItem?.nom                     ?? '',
        dci:                     editItem?.dci                     ?? '',
        forme:                   editItem?.forme                   ?? '',
        dosage:                  editItem?.dosage                  ?? '',
        categorie_medicament_id: editItem?.categorie_id            ?? '',
        conditionnement:         '',
        stock_actuel:            editItem?.stock_actuel            ?? 0,
        stock_minimum:           editItem?.stock_minimum           ?? 0,
        stock_maximum:           editItem?.stock_maximum           ?? 0,
        prix_achat:              editItem?.prix_achat              ?? 0,
        prix_vente:              editItem?.prix_vente              ?? 0,
        fournisseur_id:          editItem?.fournisseur_id          ?? '',
        date_expiration:         '',
        ordonnance_obligatoire:  editItem?.ordonnance_obligatoire  ?? false,
        actif:                   editItem?.actif                   ?? true,
        notes:                   '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            router.put(`/medicaments/${editItem.id}`, data as any, {
                onSuccess: () => { reset(); onClose(); },
            });
        } else {
            router.post('/medicaments', data as any, {
                onSuccess: () => { reset(); onClose(); },
            });
        }
    };

    const inputCls = "w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";
    const labelCls = "mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            {editItem ? 'Modifier le médicament' : 'Nouveau médicament'}
                        </h2>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            {editItem ? `Modification de ${editItem.nom}` : 'Ajout d\'une nouvelle référence au stock'}
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Code + Nom */}
                        <div>
                            <label className={labelCls}>Code interne *</label>
                            <input type="text" value={data.code} onChange={e => setData('code', e.target.value)}
                                className={inputCls} placeholder="MED-042" required />
                            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Nom commercial *</label>
                            <input type="text" value={data.nom} onChange={e => setData('nom', e.target.value)}
                                className={inputCls} placeholder="Paracétamol 500mg" required />
                            {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom}</p>}
                        </div>

                        {/* DCI + Forme */}
                        <div>
                            <label className={labelCls}>DCI *</label>
                            <input type="text" value={data.dci} onChange={e => setData('dci', e.target.value)}
                                className={inputCls} placeholder="Paracétamol" required />
                            {errors.dci && <p className="mt-1 text-xs text-red-500">{errors.dci}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Forme *</label>
                            <select value={data.forme} onChange={e => setData('forme', e.target.value)}
                                className={inputCls} required>
                                <option value="">Sélectionner...</option>
                                {[
                                    { value: 'comprime',     label: 'Comprimé' },
                                    { value: 'gelule',       label: 'Gélule' },
                                    { value: 'sirop',        label: 'Sirop' },
                                    { value: 'injectable',   label: 'Injectable' },
                                    { value: 'pommade',      label: 'Pommade' },
                                    { value: 'collyre',      label: 'Collyre' },
                                    { value: 'suppositoire', label: 'Suppositoire' },
                                    { value: 'solution',     label: 'Solution' },
                                    { value: 'poudre',       label: 'Poudre' },
                                    { value: 'autre',        label: 'Autre' },
                                ].map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dosage + Catégorie */}
                        <div>
                            <label className={labelCls}>Dosage</label>
                            <input type="text" value={data.dosage} onChange={e => setData('dosage', e.target.value)}
                                className={inputCls} placeholder="500mg, 100µg..." />
                        </div>
                        <div>
                            <label className={labelCls}>Catégorie</label>
                            <select value={data.categorie_medicament_id} onChange={e => setData('categorie_medicament_id', e.target.value)}
                                className={inputCls}>
                                <option value="">Aucune</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                            </select>
                        </div>

                        {/* Stocks */}
                        <div>
                            <label className={labelCls}>Stock actuel</label>
                            <input type="number" value={data.stock_actuel} onChange={e => setData('stock_actuel', parseInt(e.target.value) || 0)}
                                className={inputCls} min={0} />
                        </div>
                        <div>
                            <label className={labelCls}>Stock minimum (alerte)</label>
                            <input type="number" value={data.stock_minimum} onChange={e => setData('stock_minimum', parseInt(e.target.value) || 0)}
                                className={inputCls} min={0} />
                        </div>
                        <div>
                            <label className={labelCls}>Stock maximum</label>
                            <input type="number" value={data.stock_maximum} onChange={e => setData('stock_maximum', parseInt(e.target.value) || 0)}
                                className={inputCls} min={0} />
                        </div>

                        {/* Prix */}
                        <div>
                            <label className={labelCls}>Prix d'achat (FCFA)</label>
                            <input type="number" value={data.prix_achat} onChange={e => setData('prix_achat', parseFloat(e.target.value) || 0)}
                                className={inputCls} min={0} />
                        </div>
                        <div>
                            <label className={labelCls}>Prix de vente (FCFA) *</label>
                            <input type="number" value={data.prix_vente} onChange={e => setData('prix_vente', parseFloat(e.target.value) || 0)}
                                className={inputCls} min={0} required />
                            {errors.prix_vente && <p className="mt-1 text-xs text-red-500">{errors.prix_vente}</p>}
                        </div>

                        {/* Fournisseur + Expiration */}
                        <div>
                            <label className={labelCls}>Fournisseur</label>
                            <select value={data.fournisseur_id} onChange={e => setData('fournisseur_id', e.target.value)}
                                className={inputCls}>
                                <option value="">Aucun</option>
                                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Date d'expiration</label>
                            <input type="date" value={data.date_expiration} onChange={e => setData('date_expiration', e.target.value)}
                                className={inputCls} />
                        </div>

                        {/* Ordonnance */}
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="ordonnance" checked={data.ordonnance_obligatoire}
                                onChange={e => setData('ordonnance_obligatoire', e.target.checked)}
                                className="h-4 w-4 rounded border-[#e3e3e0] text-[#f53003]" />
                            <label htmlFor="ordonnance" className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                                Ordonnance obligatoire
                            </label>
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className={labelCls}>Notes / Remarques</label>
                            <textarea rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)}
                                className={inputCls}
                                placeholder="Conditions de conservation, remarques particulières..." />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t border-[#e3e3e0] bg-white pt-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60 dark:bg-[#FF4433]">
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
export default function Medicaments({ medicaments, stats, alertes, categories, fournisseurs, filters }: Props) {
    const { flash }: any = usePage().props;

    const [showModal, setShowModal] = useState(false);
    const [editItem,  setEditItem]  = useState<Medicament | null>(null);

    const [search,       setSearch]       = useState(filters.search        ?? '');
    const [categorieId,  setCategorieId]  = useState(filters.categorie_id  ?? '');
    const [statut,       setStatut]       = useState(filters.statut        ?? '');
    const [fournisseurId,setFournisseurId]= useState(filters.fournisseur_id ?? '');

    const applyFilters = (overrides: object = {}) => {
        router.get('/medicaments', {
            search, categorie_id: categorieId, statut, fournisseur_id: fournisseurId,
            ...overrides,
        }, { preserveState: true, replace: true });
    };

    const handleDelete = (med: Medicament) => {
        if (confirm(`Supprimer "${med.nom}" ?`)) {
            router.delete(`/medicaments/${med.id}`);
        }
    };

    const openEdit = (med: Medicament) => { setEditItem(med); setShowModal(true); };
    const openNew  = () => { setEditItem(null); setShowModal(true); };

    return (
        <DashboardLayout title="Médicaments" subtitle="Gestion du stock de la pharmacie">

            {/* Flash */}
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {flash.success}
                </div>
            )}

            {/* Header actions */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text" placeholder="Rechercher par nom, DCI, code..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                        className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1b1b18] placeholder-[#A1A09A] focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filtre catégorie */}
                    <select value={categorieId}
                        onChange={e => { setCategorieId(e.target.value); applyFilters({ categorie_id: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Toutes catégories</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>

                    {/* Filtre statut */}
                    <select value={statut}
                        onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous les statuts</option>
                        <option value="en_stock">En stock</option>
                        <option value="stock_bas">Stock bas</option>
                        <option value="rupture">Rupture</option>
                        <option value="peremption">Péremption proche</option>
                    </select>

                    <button onClick={openNew}
                        className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] dark:bg-[#FF4433]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Ajouter médicament
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                    { label: 'Références',        value: stats.total,      color: 'text-[#f53003]',          bg: 'bg-[#fff2f2] dark:bg-[#1D0002]',        icon: <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" strokeWidth="1.5"/> },
                    { label: 'En stock',           value: stats.en_stock,   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-900/30',   icon: <path d="M22 11.08V12C21.999 14.156 21.3 16.255 20.009 17.982C18.718 19.709 16.903 20.972 14.835 21.584C12.767 22.195 10.557 22.122 8.534 21.375C6.512 20.627 4.785 19.246 3.611 17.437C2.437 15.628 1.88 13.488 2.022 11.336C2.164 9.185 2.997 7.136 4.398 5.497C5.799 3.858 7.693 2.715 9.796 2.24C11.9 1.765 14.1 1.982 16.07 2.86" stroke="currentColor" strokeWidth="1.5"/> },
                    { label: 'Stock bas',          value: stats.stock_bas,  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.47 19 21.43 17.333 20.66 16L13.73 4C12.96 2.667 11.04 2.667 10.27 4L3.34 16C2.57 17.333 3.53 19 5.07 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/> },
                    { label: 'Ruptures',           value: stats.ruptures,   color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-900/30',       icon: <><path d="M18.36 6.64C19.618 7.899 20.475 9.502 20.822 11.248C21.169 12.994 20.991 14.803 20.31 16.448C19.628 18.092 18.475 19.498 16.995 20.486C15.515 21.475 13.775 22.003 11.995 22.003C10.215 22.003 8.475 21.475 6.995 20.486C5.515 19.498 4.362 18.092 3.68 16.448C2.999 14.803 2.821 12.994 3.168 11.248C3.515 9.502 4.372 7.899 5.63 6.64" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
                    { label: 'Péremption proche',  value: stats.peremption, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: <><path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></> },
                ].map(s => (
                    <div key={s.label} className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                                <svg className={`h-5 w-5 ${s.color}`} viewBox="0 0 24 24" fill="none">{s.icon}</svg>
                            </div>
                            <div>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                                <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alertes */}
            {(alertes.ruptures || alertes.peremption) && (
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    {alertes.ruptures && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                                <svg className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9V13M12 17H12.01M5.07 19H18.93C20.47 19 21.43 17.333 20.66 16L13.73 4C12.96 2.667 11.04 2.667 10.27 4L3.34 16C2.57 17.333 3.53 19 5.07 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-300">Alertes ruptures de stock</p>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">{alertes.ruptures}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {alertes.peremption && (
                        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/50 dark:bg-orange-900/20">
                            <div className="flex items-start gap-3">
                                <svg className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                <div>
                                    <p className="font-medium text-orange-800 dark:text-orange-300">Péremption dans moins de 3 mois</p>
                                    <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">{alertes.peremption}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Tableau */}
            <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
                                {['Médicament','Catégorie','Stock','Prix vente','Fournisseur','Expiration','Statut','Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {medicaments.data.map(med => (
                                <tr key={med.id} className="transition-colors hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            {med.ordonnance_obligatoire && (
                                                <span className="mt-0.5 flex-shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Rx</span>
                                            )}
                                            <div>
                                                <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{med.nom}</p>
                                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{med.code} · {med.forme}{med.dosage ? ` · ${med.dosage}` : ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {med.categorie ? (
                                            <span className="inline-flex rounded-full bg-[#f5f5f3] px-2.5 py-1 text-xs font-medium text-[#1b1b18] dark:bg-[#3E3E3A] dark:text-[#EDEDEC]">
                                                {med.categorie}
                                            </span>
                                        ) : <span className="text-sm text-[#A1A09A]">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${med.stock_actuel <= med.stock_minimum ? 'text-red-600 dark:text-red-400' : 'text-[#1b1b18] dark:text-[#EDEDEC]'}`}>
                                                {med.stock_actuel}
                                            </span>
                                            <span className="text-xs text-[#706f6c]">/ {med.stock_maximum}</span>
                                        </div>
                                        <div className="mt-1 h-1.5 w-24 rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                            <div className={`h-1.5 rounded-full ${med.stock_actuel === 0 ? 'bg-red-500' : med.stock_actuel <= med.stock_minimum ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                style={{ width: `${Math.min(med.stock_maximum > 0 ? (med.stock_actuel / med.stock_maximum) * 100 : 0, 100)}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {formatPrice(med.prix_vente)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {med.fournisseur ?? '—'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        {med.date_expiration ?? '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={med.statut} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(med)}
                                                className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]" title="Modifier">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.47 4 3 4.45 3 5V20C3 20.55 3.47 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(med)}
                                                className="rounded-lg p-2 text-[#706f6c] transition-colors hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400" title="Supprimer">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{medicaments.total}</span> médicaments
                    </p>
                    {medicaments.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {medicaments.links.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {medicaments.data.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucun médicament trouvé</p>
                        <p className="text-sm text-[#706f6c]">Modifiez vos critères ou ajoutez un médicament.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <MedicamentModal
                    editItem={editItem}
                    categories={categories}
                    fournisseurs={fournisseurs}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                />
            )}
        </DashboardLayout>
    );
}