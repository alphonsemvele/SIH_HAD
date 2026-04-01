import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';

// ─── Types — miroir exact du modèle Eloquent ──────────────────────────────────

type Statut = 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
type Priorite = 'normal' | 'surveillance' | 'critique';
type TypeTournee = 'complete' | 'cas_critiques' | 'chambre_specifique';

interface Constantes {
    temperature: string;
    tension: string;
    pouls: string;
    saturation: string;
}

/** VisiteHad — visite individuelle d'un patient dans une tournée */
interface VisiteHad {
    id: number;
    patient_id: number;
    ordre: number;
    priorite: Priorite;
    chambre: string;
    lit: string;
    diagnostic: string;
    jours_hospitalisation: number;
    observations: string;
    visite_at: string | null;       // null = pas encore visité
    notes_soignant: string;
    temperature: string;
    tension: string;
    pouls: string;
    saturation: string;
    // Relations eager-loaded
    patient: {
        id: number;
        nom: string;
        prenom: string;
        sexe: 'M' | 'F';
        age: number;
    };
}

/** Tournee — miroir du modèle backend */
interface Tournee {
    id: number;
    soignant_id: number;
    service_id: number;
    date: string;
    vehicule: string | null;
    heure_debut_prevue: string;
    heure_fin_prevue: string | null;
    heure_debut_effective: string | null;
    heure_fin_effective: string | null;
    kilometres: string | null;
    type: TypeTournee;
    notes: string;
    statut: Statut;
    // Calculés par le controller
    patients_total: number;
    patients_vus: number;
    // Relations eager-loaded
    soignant: { id: number; name: string };
    service: { id: number; nom: string; etage: string };
    visite_hads: VisiteHad[];
}

interface Service {
    id: number;
    nom: string;
    etage: string;
    patients_actuels: number;
}

interface Soignant {
    id: number;
    name: string;
}

interface Props {
    tournees: Tournee[];
    services: Service[];
    soignants: Soignant[];
    stats: {
        tournees_jour: number;
        en_cours: number;
        terminees: number;
        patients_a_visiter: number;
        patients_vus: number;
    };
    filters: {
        service_id?: string;
        soignant_id?: string;
        statut?: string;
    };
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const statutConfig: Record<Statut, { label: string; badge: string; icon: string; btn: string; btnText: string }> = {
    planifiee:  { label: 'Planifiée',  badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',   btn: 'bg-[#f53003] hover:bg-[#d42a03] text-white', btnText: 'Démarrer' },
    en_cours:   { label: 'En cours',   badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', btn: 'bg-orange-500 hover:bg-orange-600 text-white', btnText: 'Continuer' },
    terminee:   { label: 'Terminée',   badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',   btn: 'border border-[#e3e3e0] bg-white text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]', btnText: 'Voir' },
    annulee:    { label: 'Annulée',    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',      icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',             btn: 'border border-[#e3e3e0] bg-white text-[#706f6c]', btnText: 'Voir' },
};

const prioriteConfig: Record<Priorite, string> = {
    normal:        'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    surveillance:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critique:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const prioriteLabel: Record<Priorite, string> = {
    normal: 'Normal', surveillance: 'Surveillance', critique: 'Critique',
};

// ─── Composant principal ──────────────────────────────────────────────────────

const defaultStats = { tournees_jour: 0, en_cours: 0, terminees: 0, patients_a_visiter: 0, patients_vus: 0 };

export default function Tournees({
    tournees   = [],
    services   = [],
    soignants  = [],
    stats      = defaultStats,
    filters    = {},
}: Partial<Props>) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    const [activeTab,       setActiveTab]       = useState<'aujourdhui' | 'planning' | 'historique'>('aujourdhui');
    const [showNewTournee,  setShowNewTournee]   = useState(false);
    const [selectedTournee, setSelectedTournee] = useState<Tournee | null>(null);
    const [selectedVisite,  setSelectedVisite]  = useState<VisiteHad | null>(null);
    const [filterForm,      setFilterForm]      = useState(filters);

    // ── Formulaire nouvelle tournée ──────────────────────────────────────
    const [newForm, setNewForm] = useState({
        soignant_id:      '',
        service_id:       '',
        date:             new Date().toISOString().slice(0, 10),
        heure_debut_prevue: '',
        heure_fin_prevue:   '',
        vehicule:         '',
        type:             'complete' as TypeTournee,
        notes:            '',
    });

    // ── Formulaire observation visite ────────────────────────────────────
    const [observationForm, setObservationForm] = useState({
        observations:   '',
        temperature:    '',
        tension:        '',
        pouls:          '',
        saturation:     '',
        notes_soignant: '',
    });

    // ── Filtre ────────────────────────────────────────────────────────────
    const applyFilters = () => {
        router.get('/tournees', filterForm, { preserveScroll: true, replace: true });
    };

    // ── Créer tournée ─────────────────────────────────────────────────────
    const submitNewTournee = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/tournees', newForm, {
            preserveScroll: true,
            onSuccess: () => setShowNewTournee(false),
        });
    };

    // ── Démarrer tournée ──────────────────────────────────────────────────
    const demarrer = (tournee: Tournee) => {
        router.post(`/tournees/${tournee.id}/demarrer`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Rafraîchit la tournée sélectionnée avec le nouveau statut
                setSelectedTournee(t => t ? { ...t, statut: 'en_cours', heure_debut_effective: new Date().toTimeString().slice(0, 5) } : t);
            },
        });
    };

    // ── Terminer tournée ──────────────────────────────────────────────────
    const terminer = () => {
        if (!selectedTournee) return;
        router.post(`/tournees/${selectedTournee.id}/terminer`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedTournee(null);
                setSelectedVisite(null);
            },
        });
    };

    // ── Suspendre tournée ─────────────────────────────────────────────────
    const suspendre = () => {
        if (!selectedTournee) return;
        router.post(`/tournees/${selectedTournee.id}/suspendre`, {}, {
            preserveScroll: true,
            onSuccess: () => setSelectedTournee(null),
        });
    };

    // ── Valider visite d'un patient ───────────────────────────────────────
    const validerVisite = () => {
        if (!selectedVisite || !selectedTournee) return;
        router.post(`/tournees/${selectedTournee.id}/visites/${selectedVisite.id}/valider`, observationForm, {
            preserveScroll: true,
            onSuccess: () => {
                // Mise à jour optimiste
                setSelectedTournee(prev => {
                    if (!prev) return prev;
                    const visite_hads = prev.visite_hads.map(v =>
                        v.id === selectedVisite.id
                            ? { ...v, visite_at: new Date().toISOString(), observations: observationForm.observations }
                            : v
                    );
                    const patients_vus = visite_hads.filter(v => v.visite_at !== null).length;
                    return { ...prev, visite_hads, patients_vus };
                });
                setObservationForm({ observations: '', temperature: '', tension: '', pouls: '', saturation: '', notes_soignant: '' });
                // Passer automatiquement au patient suivant non visité
                const nextVisite = selectedTournee.visite_hads.find(
                    v => v.id !== selectedVisite.id && v.visite_at === null
                );
                setSelectedVisite(nextVisite ?? null);
            },
        });
    };

    // ── Ouvrir modal et pré-remplir observations ──────────────────────────
    const ouvrirVisite = (visite: VisiteHad) => {
        setSelectedVisite(visite);
        setObservationForm({
            observations:   '',
            temperature:    visite.temperature ?? '',
            tension:        visite.tension ?? '',
            pouls:          visite.pouls ?? '',
            saturation:     visite.saturation ?? '',
            notes_soignant: '',
        });
    };

    // ── Ouvrir modal tournée (et sync état si déjà en cours) ──────────────
    const ouvrirTournee = (tournee: Tournee) => {
        setSelectedTournee(tournee);
        // Présélectionner le premier patient non visité
        const premierNonVisite = tournee.visite_hads
            .sort((a, b) => a.ordre - b.ordre)
            .find(v => v.visite_at === null);
        if (premierNonVisite) ouvrirVisite(premierNonVisite);
        else setSelectedVisite(null);

        // Démarrer automatiquement si planifiée
        if (tournee.statut === 'planifiee') demarrer(tournee);
    };

    return (
        <DashboardLayout title="Tournées médicales" subtitle="Visites des soignants dans les services">

            {/* Flash */}
            {(flash?.success || flash?.error) && (
                <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${flash.error ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'}`}>
                    {flash.success ?? flash.error}
                </div>
            )}

            {/* ── Stats ─────────────────────────────────────────────────── */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Tournées du jour"   value={stats.tournees_jour}        color="blue"   icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                <StatCard title="En cours"           value={stats.en_cours}             color="orange" icon="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07" />
                <StatCard title="Terminées"          value={stats.terminees}            color="green"  icon="M20 6L9 17L4 12" />
                <StatCard title="Patients à visiter" value={stats.patients_a_visiter}   color="purple" icon="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" />
                <StatCard title="Patients vus"       value={stats.patients_vus}         color="teal"   icon="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21M8.5 11C10.709 11 12.5 9.209 12.5 7C12.5 4.791 10.709 3 8.5 3C6.291 3 4.5 4.791 4.5 7C4.5 9.209 6.291 11 8.5 11ZM17 11L19 13L23 9" />
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <div className="mb-6 flex items-center gap-1 rounded-lg bg-[#f5f5f3] p-1 dark:bg-[#1C1C1A]">
                {(['aujourdhui', 'planning', 'historique'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-[#1b1b18] shadow-sm dark:bg-[#161615] dark:text-[#EDEDEC]' : 'text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A]'}`}
                    >
                        {tab === 'aujourdhui' ? "Tournées du jour" : tab === 'planning' ? "Planning semaine" : "Historique"}
                    </button>
                ))}
            </div>

            {/* ── Filtres + bouton ──────────────────────────────────────── */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <select value={filterForm.service_id ?? ''} onChange={e => setFilterForm(p => ({ ...p, service_id: e.target.value }))}
                        onBlur={applyFilters}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous les services</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                    </select>
                    <select value={filterForm.soignant_id ?? ''} onChange={e => setFilterForm(p => ({ ...p, soignant_id: e.target.value }))}
                        onBlur={applyFilters}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous les soignants</option>
                        {soignants.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={filterForm.statut ?? ''} onChange={e => setFilterForm(p => ({ ...p, statut: e.target.value }))}
                        onBlur={applyFilters}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous les statuts</option>
                        {Object.entries(statutConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                </div>
                <button onClick={() => setShowNewTournee(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                    <SvgIcon path="M12 5V19M5 12H19" className="h-5 w-5" />
                    Planifier une tournée
                </button>
            </div>

            {/* ── Liste des tournées ────────────────────────────────────── */}
            <div className="grid gap-4">
                {tournees.length === 0 ? (
                    <div className="rounded-xl border border-[#e3e3e0] bg-white py-16 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucune tournée pour ces filtres.</p>
                    </div>
                ) : tournees.map(tournee => {
                    const cfg = statutConfig[tournee.statut];
                    return (
                        <div key={tournee.id} className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                                {/* Icône + identité */}
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.icon}`}>
                                        <SvgIcon path="M6 19C4 21 2 19 2 16V12C2 10 4 8 6 8C8 8 10 9 12 12C12 14 14 18 18 20C20 21 22 19 22 16V12C22 10 20 8 18 8C16 8 14 9 12 12M12 4V12" className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{tournee.service.nom}</h3>
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                                            {tournee.vehicule && (
                                                <span className="rounded-full border border-[#e3e3e0] px-2 py-0.5 text-xs text-[#706f6c] dark:border-[#3E3E3A] dark:text-[#A1A09A]">
                                                    🚗 {tournee.vehicule}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{tournee.soignant.name} • {tournee.service.etage}</p>
                                    </div>
                                </div>

                                {/* Métriques */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-semibold tabular-nums text-[#1b1b18] dark:text-[#EDEDEC]">
                                            {tournee.patients_vus}/{tournee.patients_total}
                                        </p>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Patients vus</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{tournee.heure_debut_prevue}</p>
                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            {tournee.heure_fin_effective ? `→ ${tournee.heure_fin_effective}` : tournee.heure_debut_effective ? 'En cours' : 'Prévu'}
                                        </p>
                                    </div>
                                    {tournee.kilometres && (
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{tournee.kilometres} km</p>
                                            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Parcourus</p>
                                        </div>
                                    )}
                                    <button onClick={() => ouvrirTournee(tournee)}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${cfg.btn}`}>
                                        {cfg.btnText}
                                    </button>
                                </div>
                            </div>

                            {/* Barre de progression */}
                            <div className="h-1 w-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                <div className={`h-full transition-all ${tournee.statut === 'terminee' ? 'bg-green-500' : tournee.statut === 'en_cours' ? 'bg-orange-500' : 'bg-blue-400'}`}
                                    style={{ width: `${tournee.patients_total > 0 ? (tournee.patients_vus / tournee.patients_total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* MODAL — Nouvelle tournée                                     */}
            {/* ════════════════════════════════════════════════════════════ */}
            {showNewTournee && (
                <Modal title="Planifier une tournée" subtitle="Visite médicale programmée" onClose={() => setShowNewTournee(false)} size="lg">
                    <form onSubmit={submitNewTournee} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Soignant *">
                                <select value={newForm.soignant_id} onChange={e => setNewForm(p => ({ ...p, soignant_id: e.target.value }))} required
                                    className={inputCls}>
                                    <option value="">Sélectionner…</option>
                                    {soignants.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Service *">
                                <select value={newForm.service_id} onChange={e => setNewForm(p => ({ ...p, service_id: e.target.value }))} required
                                    className={inputCls}>
                                    <option value="">Sélectionner…</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.patients_actuels} patients)</option>)}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Date *">
                                <input type="date" value={newForm.date} onChange={e => setNewForm(p => ({ ...p, date: e.target.value }))} required className={inputCls}/>
                            </Field>
                            <Field label="Heure début *">
                                <input type="time" value={newForm.heure_debut_prevue} onChange={e => setNewForm(p => ({ ...p, heure_debut_prevue: e.target.value }))} required className={inputCls}/>
                            </Field>
                            <Field label="Heure fin prévue">
                                <input type="time" value={newForm.heure_fin_prevue} onChange={e => setNewForm(p => ({ ...p, heure_fin_prevue: e.target.value }))} className={inputCls}/>
                            </Field>
                        </div>

                        <Field label="Véhicule (HAD)">
                            <input type="text" value={newForm.vehicule} onChange={e => setNewForm(p => ({ ...p, vehicule: e.target.value }))}
                                placeholder="ex : AA 123 CM" className={inputCls}/>
                        </Field>

                        <Field label="Type de tournée">
                            <div className="grid grid-cols-3 gap-2">
                                {([
                                    { v: 'complete',           l: 'Visite complète'      },
                                    { v: 'cas_critiques',      l: 'Cas critiques'        },
                                    { v: 'chambre_specifique', l: 'Chambre spécifique'   },
                                ] as { v: TypeTournee; l: string }[]).map(({ v, l }) => (
                                    <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A] ${newForm.type === v ? 'border-[#f53003] bg-[#fff2f2] dark:bg-[#1D0002]' : 'border-[#e3e3e0] dark:border-[#3E3E3A]'}`}>
                                        <input type="radio" name="type" value={v} checked={newForm.type === v}
                                            onChange={() => setNewForm(p => ({ ...p, type: v }))}
                                            className="h-4 w-4 text-[#f53003] focus:ring-[#f53003]"/>
                                        <span className="text-[#1b1b18] dark:text-[#EDEDEC]">{l}</span>
                                    </label>
                                ))}
                            </div>
                        </Field>

                        <Field label="Notes">
                            <textarea value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                                placeholder="Instructions particulières, patients prioritaires…"
                                className={inputCls + ' resize-none'}/>
                        </Field>

                        <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                            <button type="button" onClick={() => setShowNewTournee(false)} className={`rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]`}>Annuler</button>
                            <button type="submit" className="flex items-center gap-2 rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                                <SvgIcon path="M20 6L9 17L4 12" className="h-4 w-4"/> Planifier
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* MODAL — Déroulement tournée                                  */}
            {/* ════════════════════════════════════════════════════════════ */}
            {selectedTournee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#161615]">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        Tournée — {selectedTournee.service.nom}
                                    </h2>
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statutConfig[selectedTournee.statut].badge}`}>
                                        {statutConfig[selectedTournee.statut].label}
                                    </span>
                                </div>
                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {selectedTournee.soignant.name} • {selectedTournee.date} à {selectedTournee.heure_debut_prevue}
                                    {selectedTournee.vehicule && ` • 🚗 ${selectedTournee.vehicule}`}
                                </p>
                            </div>
                            <button onClick={() => { setSelectedTournee(null); setSelectedVisite(null); }}
                                className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                                <SvgIcon path="M18 6L6 18M6 6L18 18" className="h-5 w-5"/>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex min-h-0 flex-1">
                            {/* ── Colonne patients ─────────────────────── */}
                            <div className="w-80 flex-shrink-0 overflow-y-auto border-r border-[#e3e3e0] dark:border-[#3E3E3A]">
                                <div className="sticky top-0 z-10 border-b border-[#e3e3e0] bg-white px-4 py-3 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Patients ({selectedTournee.patients_vus}/{selectedTournee.patients_total})
                                        </span>
                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
                                            <div className="h-full rounded-full bg-[#f53003]"
                                                style={{ width: `${selectedTournee.patients_total > 0 ? (selectedTournee.patients_vus / selectedTournee.patients_total) * 100 : 0}%` }}/>
                                        </div>
                                    </div>
                                </div>

                                {[...selectedTournee.visite_hads].sort((a, b) => a.ordre - b.ordre).map(visite => (
                                    <button key={visite.id} onClick={() => ouvrirVisite(visite)}
                                        className={`w-full border-b border-[#e3e3e0] p-4 text-left transition-colors hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:hover:bg-[#1C1C1A] ${selectedVisite?.id === visite.id ? 'bg-[#f5f5f3] dark:bg-[#1C1C1A]' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${visite.patient.sexe === 'M' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                                {visite.patient.prenom[0]}{visite.patient.nom[0]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        {visite.patient.prenom} {visite.patient.nom}
                                                    </p>
                                                    {visite.visite_at && (
                                                        <SvgIcon path="M22 11.08V12C21.999 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999M22 4L12 14.01L9 11.01" className="h-4 w-4 flex-shrink-0 text-green-500"/>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Ch. {visite.chambre} – Lit {visite.lit}</p>
                                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${prioriteConfig[visite.priorite]}`}>
                                                    {prioriteLabel[visite.priorite]}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* ── Détail patient ───────────────────────── */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {selectedVisite ? (
                                    <>
                                        {/* Header patient */}
                                        <div className="mb-6 flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold ${selectedVisite.patient.sexe === 'M' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                                    {selectedVisite.patient.prenom[0]}{selectedVisite.patient.nom[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                        {selectedVisite.patient.prenom} {selectedVisite.patient.nom}
                                                    </h3>
                                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        {selectedVisite.patient.age} ans • {selectedVisite.patient.sexe === 'M' ? 'Homme' : 'Femme'}
                                                    </p>
                                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                        Chambre {selectedVisite.chambre} – Lit {selectedVisite.lit} • J{selectedVisite.jours_hospitalisation}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${prioriteConfig[selectedVisite.priorite]}`}>
                                                {prioriteLabel[selectedVisite.priorite]}
                                            </span>
                                        </div>

                                        {/* Diagnostic */}
                                        <div className="mb-6 rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                                            <p className="text-xs font-medium uppercase text-[#706f6c] dark:text-[#A1A09A]">Diagnostic</p>
                                            <p className="mt-1 text-lg font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{selectedVisite.diagnostic}</p>
                                        </div>

                                        {/* Constantes vitales */}
                                        <div className="mb-6">
                                            <h4 className="mb-3 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Constantes vitales</h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {([
                                                    { label: 'Température', field: 'temperature' as const, icon: 'M14 14.76V3.5C14 2.67157 13.3284 2 12.5 2V2C11.6716 2 11 2.67157 11 3.5V14.76C9.79401 15.3134 9 16.5289 9 17.9C9 19.8882 10.5118 21.4 12.5 21.4C14.4882 21.4 16 19.8882 16 17.9C16 16.5289 15.206 15.3134 14 14.76Z', color: 'text-red-500', placeholder: '36.5' },
                                                    { label: 'Tension',     field: 'tension'     as const, icon: 'M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z', color: 'text-pink-500', placeholder: '120/80' },
                                                    { label: 'Pouls',      field: 'pouls'       as const, icon: 'M22 12H18L15 21L9 3L6 12H2', color: 'text-orange-500', placeholder: '72 bpm' },
                                                    { label: 'SpO2',       field: 'saturation'  as const, icon: 'M12 4V12M12 12C12 14 10 18 6 20C4 21 2 19 2 16V12C2 10 4 8 6 8C8 8 10 9 12 12ZM12 12C12 14 14 18 18 20C20 21 22 19 22 16V12C22 10 20 8 18 8C16 8 14 9 12 12Z', color: 'text-blue-500', placeholder: '98%' },
                                                ]).map(({ label, field, icon, color, placeholder }) => (
                                                    <div key={field} className="rounded-lg border border-[#e3e3e0] p-3 dark:border-[#3E3E3A]">
                                                        <div className="mb-1 flex items-center gap-1.5">
                                                            <SvgIcon path={icon} className={`h-4 w-4 ${color}`}/>
                                                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{label}</span>
                                                        </div>
                                                        <input type="text" value={observationForm[field]}
                                                            onChange={e => setObservationForm(p => ({ ...p, [field]: e.target.value }))}
                                                            placeholder={placeholder}
                                                            className="w-full border-0 bg-transparent p-0 text-lg font-semibold text-[#1b1b18] focus:outline-none dark:text-[#EDEDEC]"/>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dernière observation enregistrée */}
                                        {selectedVisite.observations && (
                                            <div className="mb-6">
                                                <h4 className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Dernière observation</h4>
                                                <div className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                                    <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{selectedVisite.observations}</p>
                                                    {selectedVisite.visite_at && (
                                                        <p className="mt-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">{selectedVisite.visite_at}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Nouvelle observation */}
                                        <div className="mb-6">
                                            <h4 className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Observations de cette visite</h4>
                                            <textarea value={observationForm.observations}
                                                onChange={e => setObservationForm(p => ({ ...p, observations: e.target.value }))}
                                                rows={4} placeholder="Saisissez vos observations…"
                                                className={inputCls + ' resize-none'}/>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            <Link href={`/patients/${selectedVisite.patient_id}/prescriptions/create`}
                                                className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                                                <SvgIcon path="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5ZM9 12H15M9 16H13" className="h-4 w-4"/>
                                                Prescrire
                                            </Link>
                                            <Link href={`/patients/${selectedVisite.patient_id}/examens/create`}
                                                className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                                                <SvgIcon path="M9 3H15M10 3V8L5 18C4.5 19 5.2 20 6.5 20H17.5C18.8 20 19.5 19 19 18L14 8V3" className="h-4 w-4"/>
                                                Examens
                                            </Link>
                                            <button onClick={validerVisite} disabled={!!selectedVisite.visite_at}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-50">
                                                <SvgIcon path="M20 6L9 17L4 12" className="h-4 w-4"/>
                                                {selectedVisite.visite_at ? 'Visite validée' : 'Valider la visite'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Sélectionnez un patient pour voir ses détails</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-[#e3e3e0] bg-[#fafaf9] px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Progression : {selectedTournee.patients_vus}/{selectedTournee.patients_total} patients visités
                            </p>
                            <div className="flex items-center gap-3">
                                {selectedTournee.statut === 'en_cours' && (
                                    <button onClick={suspendre}
                                        className="rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                                        Suspendre
                                    </button>
                                )}
                                {selectedTournee.statut !== 'terminee' && selectedTournee.statut !== 'annulee' && (
                                    <button onClick={terminer}
                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">
                                        <SvgIcon path="M20 6L9 17L4 12" className="h-4 w-4"/>
                                        Terminer la tournée
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// ─── Composants UI ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{label}</label>
            {children}
        </div>
    );
}

function Modal({ title, subtitle, children, onClose, size = 'md' }: {
    title: string; subtitle?: string; children: React.ReactNode; onClose: () => void; size?: 'md' | 'lg';
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-[#161615] ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'}`}>
                <div className="flex items-start justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</h2>
                        {subtitle && <p className="mt-0.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="ml-4 rounded-lg p-1 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#3E3E3A]">
                        <SvgIcon path="M18 6L6 18M6 6L18 18" className="h-5 w-5"/>
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) {
    const colorMap: Record<string, string> = {
        blue:   'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        green:  'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        teal:   'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    };
    return (
        <div className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}>
                    <SvgIcon path={icon} className="h-5 w-5"/>
                </div>
                <div>
                    <p className="text-2xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{value}</p>
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{title}</p>
                </div>
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