import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────
interface Modalite {
    id: number;
    code: string;
    nom: string;
    description: string | null;
    disponible: boolean;
    actif: boolean;
    type_examens_count: number;
    examen_imageries_count: number;
}

interface Props {
    modalites: { data: Modalite[]; total: number; last_page: number; links: any[] };
    stats: { total: number; actives: number; disponibles: number; inactives: number };
    filters: { search?: string; actif?: string; disponible?: string };
}

// ─── Couleurs par modalité ────────────────────────────────────
const MODALITE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
    'Radiographie': { bg: 'bg-sky-50 dark:bg-sky-900/20',     text: 'text-sky-600 dark:text-sky-400',     icon: '🩻' },
    'Scanner':      { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', icon: '🔬' },
    'IRM':          { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', icon: '🧲' },
    'Échographie':  { bg: 'bg-teal-50 dark:bg-teal-900/20',   text: 'text-teal-600 dark:text-teal-400',   icon: '〰️' },
    'Mammographie': { bg: 'bg-pink-50 dark:bg-pink-900/20',   text: 'text-pink-600 dark:text-pink-400',   icon: '🔍' },
    'Panoramique':  { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', icon: '🦷' },
    'TEP-Scan':     { bg: 'bg-rose-50 dark:bg-rose-900/20',   text: 'text-rose-600 dark:text-rose-400',   icon: '⚛️' },
};

const DEFAULT_STYLE = { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400', icon: '📷' };

function getStyle(nom: string) {
    return MODALITE_STYLES[nom] ?? DEFAULT_STYLE;
}

// ─── Modale Formulaire ────────────────────────────────────────
function ModaliteModal({ editItem, onClose }: { editItem: Modalite | null; onClose: () => void }) {
    const [form, setForm] = useState({
        code:        editItem?.code        ?? '',
        nom:         editItem?.nom         ?? '',
        description: editItem?.description ?? '',
        disponible:  editItem?.disponible  ?? true,
        actif:       editItem?.actif       ?? true,
    });
    const [processing, setProcessing] = useState(false);

    const inp = "w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";
    const lbl = "mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]";

    const style = getStyle(form.nom);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        const opts = { onFinish: () => setProcessing(false), onSuccess: onClose };
        if (editItem) {
            router.put(`/modalite-imagerie/${editItem.id}`, form as any, opts);
        } else {
            router.post('/modalite-imagerie', form as any, opts);
        }
    };

    // Suggestions de noms prédéfinis
    const suggestions = ['Radiographie', 'Scanner', 'IRM', 'Échographie', 'Mammographie', 'Panoramique', 'TEP-Scan'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${style.bg}`}>
                            {style.icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                {editItem ? 'Modifier la modalité' : 'Nouvelle modalité'}
                            </h2>
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Modalité d'imagerie médicale</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Suggestions rapides */}
                    {!editItem && (
                        <div>
                            <p className="mb-2 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Suggestions rapides</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map(s => {
                                    const st = getStyle(s);
                                    return (
                                        <button key={s} type="button"
                                            onClick={() => setForm(f => ({
                                                ...f,
                                                nom: s,
                                                code: 'MOD-' + s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4),
                                            }))}
                                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all ${form.nom === s ? `border-transparent ${st.bg} ${st.text}` : 'border-[#e3e3e0] text-[#706f6c] hover:border-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}>
                                            {st.icon} {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Code + Nom */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>Code *</label>
                            <input type="text" value={form.code}
                                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                                className={inp} placeholder="MOD-RX" required maxLength={20} />
                        </div>
                        <div>
                            <label className={lbl}>Nom *</label>
                            <input type="text" value={form.nom}
                                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                                className={inp} placeholder="Radiographie" required maxLength={100} />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className={lbl}>Description</label>
                        <textarea rows={3} value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className={inp} placeholder="Indications, équipements, conditions particulières..." />
                    </div>

                    {/* Toggles disponible + actif */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${form.disponible ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-[#e3e3e0] dark:border-[#3E3E3A]'}`}>
                            <input type="checkbox" checked={form.disponible}
                                onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))}
                                className="h-4 w-4 rounded text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Disponible</p>
                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Équipement opérationnel</p>
                            </div>
                        </label>
                        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${form.actif ? 'border-[#f53003] bg-[#fff5f3] dark:bg-[#1D0002]' : 'border-[#e3e3e0] dark:border-[#3E3E3A]'}`}>
                            <input type="checkbox" checked={form.actif}
                                onChange={e => setForm(f => ({ ...f, actif: e.target.checked }))}
                                className="h-4 w-4 rounded text-[#f53003]" />
                            <div>
                                <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Actif</p>
                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Visible dans le catalogue</p>
                            </div>
                        </label>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
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
export default function ModaliteImagerie({ modalites, stats, filters }: Props) {
    const { flash, errors: pageErrors }: any = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editItem,  setEditItem]  = useState<Modalite | null>(null);
    const [search,    setSearch]    = useState(filters.search     ?? '');
    const [actif,     setActif]     = useState(filters.actif      ?? '');
    const [dispo,     setDispo]     = useState(filters.disponible ?? '');

    const applyFilters = (overrides: object = {}) =>
        router.get('/modalite-imagerie', { search, actif, disponible: dispo, ...overrides }, { preserveState: true, replace: true });

    const handleDelete = (m: Modalite) => {
        const usages = m.type_examens_count + m.examen_imageries_count;
        if (usages > 0) {
            alert(`Impossible de supprimer : "${m.nom}" est utilisée dans ${usages} examen(s).`);
            return;
        }
        if (confirm(`Supprimer la modalité "${m.nom}" ?`)) router.delete(`/modalite-imagerie/${m.id}`);
    };

    const openEdit = (m: Modalite) => { setEditItem(m); setShowModal(true); };
    const openNew  = () => { setEditItem(null); setShowModal(true); };

    return (
        <DashboardLayout title="Modalités d'imagerie" subtitle="Gestion des types d'équipements d'imagerie médicale">

            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
            )}
            {pageErrors?.delete && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{pageErrors.delete}</div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { l: 'Total',        v: stats.total,       color: 'text-[#f53003]',                          bg: 'bg-[#fff2f2] dark:bg-[#1D0002]',          icon: '📷' },
                    { l: 'Actives',      v: stats.actives,     color: 'text-green-600 dark:text-green-400',      bg: 'bg-green-50 dark:bg-green-900/20',        icon: '✅' },
                    { l: 'Disponibles',  v: stats.disponibles, color: 'text-sky-600 dark:text-sky-400',          bg: 'bg-sky-50 dark:bg-sky-900/20',            icon: '🟢' },
                    { l: 'Inactives',    v: stats.inactives,   color: 'text-gray-500 dark:text-gray-400',        bg: 'bg-gray-50 dark:bg-gray-900/20',          icon: '⭕' },
                ].map(s => (
                    <div key={s.l} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${s.bg}`}>{s.icon}</div>
                        <p className={`text-2xl font-semibold ${s.color}`}>{s.v}</p>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.l}</p>
                    </div>
                ))}
            </div>

            {/* Filtres + Bouton */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <input type="text" placeholder="Code, nom..." value={search}
                            onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                    </div>
                    <select value={actif} onChange={e => { setActif(e.target.value); applyFilters({ actif: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous statuts</option>
                        <option value="1">Actives</option>
                        <option value="0">Inactives</option>
                    </select>
                    <select value={dispo} onChange={e => { setDispo(e.target.value); applyFilters({ disponible: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Toute disponibilité</option>
                        <option value="1">Disponibles</option>
                        <option value="0">Indisponibles</option>
                    </select>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouvelle modalité
                </button>
            </div>

            {/* Grille de cartes */}
            {modalites.data.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {modalites.data.map(m => {
                        const style = getStyle(m.nom);
                        const usages = m.type_examens_count + m.examen_imageries_count;
                        return (
                            <div key={m.id} className={`group relative rounded-xl border bg-white p-5 transition-shadow hover:shadow-md dark:bg-[#161615] ${!m.actif ? 'opacity-60' : ''} ${m.disponible ? 'border-[#e3e3e0] dark:border-[#3E3E3A]' : 'border-dashed border-gray-300 dark:border-gray-700'}`}>
                                {/* Icône + Badge disponibilité */}
                                <div className="mb-3 flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${style.bg}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.actif ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                            {m.actif ? 'Actif' : 'Inactif'}
                                        </span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.disponible ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                            {m.disponible ? '🟢 Disponible' : '🔴 Indisponible'}
                                        </span>
                                    </div>
                                </div>

                                {/* Nom + Code */}
                                <p className={`text-lg font-semibold ${style.text}`}>{m.nom}</p>
                                <p className="font-mono text-xs text-[#706f6c] dark:text-[#A1A09A]">{m.code}</p>

                                {/* Description */}
                                {m.description && (
                                    <p className="mt-2 text-xs text-[#706f6c] dark:text-[#A1A09A] line-clamp-2">{m.description}</p>
                                )}

                                {/* Utilisations */}
                                <div className="mt-3 border-t border-[#e3e3e0] pt-3 dark:border-[#3E3E3A]">
                                    <div className="flex items-center justify-between text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                        <span>{m.type_examens_count} type(s) d'examen</span>
                                        <span>{m.examen_imageries_count} examen(s)</span>
                                    </div>
                                    {usages > 0 && (
                                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                            <div className={`h-1.5 rounded-full ${style.text.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`}
                                                style={{ width: `${Math.min(usages * 10, 100)}%` }} />
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => openEdit(m)}
                                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e3e3e0] py-2 text-xs font-medium text-[#706f6c] transition-colors hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.47 4 3 4.45 3 5V20C3 20.55 3.47 21 4 21H19C19.55 21 20 20.55 20 20V13M18.5 2.5C19.33 1.67 20.67 1.67 21.5 2.5C22.33 3.33 22.33 4.67 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        Modifier
                                    </button>
                                    <button onClick={() => handleDelete(m)}
                                        className="rounded-lg border border-[#e3e3e0] p-2 text-[#706f6c] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-red-900/20 dark:hover:text-red-400">
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-[#e3e3e0] py-20 text-center dark:border-[#3E3E3A]">
                    <p className="text-4xl">🩻</p>
                    <p className="mt-3 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucune modalité trouvée</p>
                    <p className="text-sm text-[#706f6c]">Créez votre première modalité d'imagerie.</p>
                    <button onClick={openNew}
                        className="mt-4 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03]">
                        Créer une modalité
                    </button>
                </div>
            )}

            {/* Pagination */}
            {modalites.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{modalites.total}</span> modalités
                    </p>
                    <div className="flex items-center gap-1">
                        {modalites.links.map((link, i) => (
                            <button key={i} disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                className={`rounded-lg px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:opacity-40 dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                </div>
            )}

            {showModal && <ModaliteModal editItem={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
        </DashboardLayout>
    );
}