import { Link, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface LitOption {
    id: number;
    numero: string;
    chambre: string | null;
    type: string;
    tarif_journalier: string | null;
    service: { id: number; nom: string; etage: string };
}

interface Patient {
    id: number;
    nom_complet: string;
    date_naissance: string | null;
    telephone: string | null;
}

interface Soignant {
    id: number;
    name: string;
}

interface Props {
    lit_preselectionne: LitOption | null;
    lits_disponibles: LitOption[];
    patients: Patient[];
    medecins: Soignant[];
    infirmiers: Soignant[];
    date_entree_defaut: string;
}

// ─── Config types de lit ──────────────────────────────────────────────────────

const typeLitLabel: Record<string, string> = {
    standard:     'Standard',
    vip:          'VIP',
    reanimation:  'Réanimation',
    isolement:    'Isolement',
    maternite:    'Maternité',
};

const typeLitColor: Record<string, string> = {
    standard:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    vip:         'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    reanimation: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    isolement:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    maternite:   'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

// ─── Composant principal ──────────────────────────────────────────────────────

export default function OccupationCreate({
    lit_preselectionne = null,
    lits_disponibles   = [],
    patients           = [],
    medecins           = [],
    infirmiers         = [],
    date_entree_defaut = '',
}: Partial<Props>) {
    const { flash } = usePage<{ flash?: { error?: string } }>().props;

    // ── Formulaire ───────────────────────────────────────────────────────
    const [form, setForm] = useState({
        lit_id:                lit_preselectionne?.id?.toString() ?? '',
        patient_id:            '',
        medecin_id:            '',
        infirmier_id:          '',
        diagnostic_principal:  '',
        notes_admission:       '',
        date_entree:           date_entree_defaut,
        date_sortie_prevue:    '',
    });

    const [errors,  setErrors]  = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // ── Recherche patients ───────────────────────────────────────────────
    const [searchPatient, setSearchPatient] = useState('');
    const [searchLit,     setSearchLit]     = useState('');
    const [showPatientDropdown, setShowPatientDropdown] = useState(false);
    const [showLitDropdown,     setShowLitDropdown]     = useState(false);

    const patientsFiltres = useMemo(() =>
        patients.filter(p =>
            p.nom_complet.toLowerCase().includes(searchPatient.toLowerCase()) ||
            (p.telephone ?? '').includes(searchPatient)
        ).slice(0, 8),
        [patients, searchPatient]
    );

    const litsFiltres = useMemo(() =>
        lits_disponibles.filter(l =>
            l.numero.toLowerCase().includes(searchLit.toLowerCase()) ||
            (l.chambre ?? '').toLowerCase().includes(searchLit.toLowerCase()) ||
            l.service.nom.toLowerCase().includes(searchLit.toLowerCase())
        ).slice(0, 10),
        [lits_disponibles, searchLit]
    );

    // ── Lit et patient sélectionnés ──────────────────────────────────────
    const litSelectionne = lits_disponibles.find(l => l.id === Number(form.lit_id))
        ?? lit_preselectionne
        ?? null;

    const patientSelectionne = patients.find(p => p.id === Number(form.patient_id)) ?? null;

    // ── Coût estimé ──────────────────────────────────────────────────────
    const coutEstime = useMemo(() => {
        if (!litSelectionne?.tarif_journalier || !form.date_entree || !form.date_sortie_prevue) return null;
        const debut = new Date(form.date_entree);
        const fin   = new Date(form.date_sortie_prevue);
        const jours = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)));
        const total = jours * parseFloat(litSelectionne.tarif_journalier);
        return { jours, total: total.toLocaleString('fr-FR') };
    }, [litSelectionne, form.date_entree, form.date_sortie_prevue]);

    // ── Soumission ───────────────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation client
        const errs: Record<string, string> = {};
        if (!form.lit_id)     errs.lit_id     = 'Sélectionnez un lit.';
        if (!form.patient_id) errs.patient_id  = 'Sélectionnez un patient.';
        if (!form.date_entree) errs.date_entree = "La date d'entrée est obligatoire.";
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        router.post('/lits/occupations', form, {
            preserveScroll: true,
            onError: (e) => { setErrors(e); setLoading(false); },
            onFinish: () => setLoading(false),
        });
    };

    // ─────────────────────────────────────────────────────────────────────
    // RENDU
    // ─────────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout title="Admettre un patient" subtitle="Nouvelle occupation — affectation d'un lit">

            {/* Flash error */}
            {flash?.error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {flash.error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── Colonne principale (2/3) ─────────────────────── */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* ── Sélection du lit ────────────────────────── */}
                        <Section title="Lit d'admission" icon="M19 3H5C3.895 3 3 3.895 3 5V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V5C21 3.895 20.105 3 19 3ZM3 9H21M9 21V9">

                            {litSelectionne ? (
                                /* Lit sélectionné — carte récapitulative */
                                <div className="flex items-start justify-between rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 11.08V12C21.999 14.156 21.3 16.255 20.009 17.982C18.718 19.709 16.903 20.972 14.835 21.584C12.767 22.195 10.557 22.122 8.534 21.375C6.512 20.627 4.785 19.246 3.611 17.437C2.437 15.628 1.88 13.488 2.022 11.336C2.164 9.185 2.997 7.136 4.398 5.497C5.799 3.858 7.693 2.715 9.796 2.24C11.9 1.765 14.1 1.982 16.07 2.86M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                                Lit {litSelectionne.numero}
                                                {litSelectionne.chambre && <span className="ml-1 text-sm font-normal text-[#706f6c] dark:text-[#A1A09A]">— {litSelectionne.chambre}</span>}
                                            </p>
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                                {litSelectionne.service.nom} · {litSelectionne.service.etage}
                                            </p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeLitColor[litSelectionne.type] ?? typeLitColor.standard}`}>
                                                    {typeLitLabel[litSelectionne.type] ?? litSelectionne.type}
                                                </span>
                                                {litSelectionne.tarif_journalier && (
                                                    <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                        {parseFloat(litSelectionne.tarif_journalier).toLocaleString('fr-FR')} FCFA/j
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setForm(p => ({ ...p, lit_id: '' })); setSearchLit(''); }}
                                        className="rounded-lg p-1.5 text-[#706f6c] hover:bg-green-100 dark:hover:bg-green-900/40">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    </button>
                                </div>
                            ) : (
                                /* Recherche lit */
                                <div className="relative">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c] dark:text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 21L15 15M17 11A6 6 0 111 11A6 6 0 0117 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchLit}
                                            onChange={e => { setSearchLit(e.target.value); setShowLitDropdown(true); }}
                                            onFocus={() => setShowLitDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowLitDropdown(false), 150)}
                                            placeholder="Chercher un lit par numéro, chambre ou service…"
                                            className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${errors.lit_id ? 'border-red-400' : 'border-[#e3e3e0] dark:border-[#3E3E3A]'}`}
                                        />
                                    </div>

                                    {showLitDropdown && litsFiltres.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#e3e3e0] bg-white shadow-xl dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            {/* Regroupement par service */}
                                            {Object.entries(
                                                litsFiltres.reduce((acc, l) => {
                                                    const key = l.service.nom;
                                                    if (!acc[key]) acc[key] = [];
                                                    acc[key].push(l);
                                                    return acc;
                                                }, {} as Record<string, typeof litsFiltres>)
                                            ).map(([serviceName, lits]) => (
                                                <div key={serviceName}>
                                                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">
                                                        {serviceName}
                                                    </p>
                                                    {lits.map(lit => (
                                                        <button key={lit.id} type="button"
                                                            onMouseDown={() => {
                                                                setForm(p => ({ ...p, lit_id: String(lit.id) }));
                                                                setSearchLit('');
                                                                setShowLitDropdown(false);
                                                            }}
                                                            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]"
                                                        >
                                                            <div>
                                                                <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                                    Lit {lit.numero}
                                                                </span>
                                                                {lit.chambre && <span className="ml-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">— {lit.chambre}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {lit.tarif_journalier && (
                                                                    <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                                        {parseFloat(lit.tarif_journalier).toLocaleString('fr-FR')} FCFA/j
                                                                    </span>
                                                                )}
                                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${typeLitColor[lit.type] ?? typeLitColor.standard}`}>
                                                                    {typeLitLabel[lit.type] ?? lit.type}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}

                                            <div className="border-t border-[#e3e3e0] px-3 py-2 dark:border-[#3E3E3A]">
                                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                    {lits_disponibles.length} lit{lits_disponibles.length > 1 ? 's' : ''} disponible{lits_disponibles.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {showLitDropdown && litsFiltres.length === 0 && searchLit && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#e3e3e0] bg-white p-4 shadow-xl dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucun lit disponible correspondant.</p>
                                        </div>
                                    )}

                                    {errors.lit_id && <p className="mt-1 text-xs text-red-500">{errors.lit_id}</p>}

                                    {lits_disponibles.length === 0 && (
                                        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            ⚠ Aucun lit disponible pour le moment.
                                            <Link href="/lits" className="ml-1 font-medium underline">Gérer les lits</Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Section>

                        {/* ── Sélection du patient ─────────────────────── */}
                        <Section title="Patient" icon="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z">

                            {patientSelectionne ? (
                                <div className="flex items-start justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-lg font-semibold dark:bg-blue-900/40 dark:text-blue-400">
                                            {patientSelectionne.nom_complet.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{patientSelectionne.nom_complet}</p>
                                            {patientSelectionne.date_naissance && (
                                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Né(e) le {patientSelectionne.date_naissance}</p>
                                            )}
                                            {patientSelectionne.telephone && (
                                                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">📞 {patientSelectionne.telephone}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { setForm(p => ({ ...p, patient_id: '' })); setSearchPatient(''); }}
                                        className="rounded-lg p-1.5 text-[#706f6c] hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#706f6c]" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 21L15 15M17 11A6 6 0 111 11A6 6 0 0117 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                        <input type="text" value={searchPatient}
                                            onChange={e => { setSearchPatient(e.target.value); setShowPatientDropdown(true); }}
                                            onFocus={() => setShowPatientDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                                            placeholder="Nom, prénom ou téléphone du patient…"
                                            className={`w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] ${errors.patient_id ? 'border-red-400' : 'border-[#e3e3e0] dark:border-[#3E3E3A]'}`}
                                        />
                                    </div>

                                    {showPatientDropdown && patientsFiltres.length > 0 && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#e3e3e0] bg-white shadow-xl dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            {patientsFiltres.map(p => (
                                                <button key={p.id} type="button"
                                                    onMouseDown={() => {
                                                        setForm(prev => ({ ...prev, patient_id: String(p.id) }));
                                                        setSearchPatient('');
                                                        setShowPatientDropdown(false);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]"
                                                >
                                                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {p.nom_complet.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{p.nom_complet}</p>
                                                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                            {p.date_naissance && `Né(e) ${p.date_naissance}`}
                                                            {p.date_naissance && p.telephone && ' · '}
                                                            {p.telephone}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {showPatientDropdown && patientsFiltres.length === 0 && searchPatient && (
                                        <div className="absolute z-20 mt-1 w-full rounded-xl border border-[#e3e3e0] bg-white p-4 shadow-xl dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucun patient trouvé.</p>
                                            <Link href="/patients/create" className="mt-1 block text-sm font-medium text-[#f53003] hover:underline">
                                                + Créer un nouveau patient
                                            </Link>
                                        </div>
                                    )}

                                    {errors.patient_id && <p className="mt-1 text-xs text-red-500">{errors.patient_id}</p>}
                                </div>
                            )}
                        </Section>

                        {/* ── Informations médicales ───────────────────── */}
                        <Section title="Informations médicales" icon="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15M9 5C9 3.895 9.895 3 11 3H13C14.105 3 15 3.895 15 5C15 6.105 14.105 7 13 7H11C9.895 7 9 6.105 9 5ZM9 12H15M9 16H13">
                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Médecin référent">
                                        <select value={form.medecin_id} onChange={e => setForm(p => ({ ...p, medecin_id: e.target.value }))} className={inputCls}>
                                            <option value="">Sélectionner un médecin…</option>
                                            {medecins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Infirmier(e) référent(e)">
                                        <select value={form.infirmier_id} onChange={e => setForm(p => ({ ...p, infirmier_id: e.target.value }))} className={inputCls}>
                                            <option value="">Sélectionner un(e) infirmier(e)…</option>
                                            {infirmiers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                        </select>
                                    </Field>
                                </div>

                                <Field label="Diagnostic principal">
                                    <input type="text" value={form.diagnostic_principal}
                                        onChange={e => setForm(p => ({ ...p, diagnostic_principal: e.target.value }))}
                                        placeholder="ex : Hypertension artérielle, Pneumonie aiguë…"
                                        className={inputCls}/>
                                </Field>

                                <Field label="Notes d'admission">
                                    <textarea value={form.notes_admission}
                                        onChange={e => setForm(p => ({ ...p, notes_admission: e.target.value }))}
                                        rows={4} placeholder="Antécédents importants, allergies, instructions particulières…"
                                        className={inputCls + ' resize-none'}/>
                                </Field>
                            </div>
                        </Section>

                        {/* ── Dates ────────────────────────────────────── */}
                        <Section title="Dates" icon="M8 7V3M16 7V3M3 11H21M5 21H19C20.105 21 21 20.105 21 19V7C21 5.895 20.105 5 19 5H5C3.895 5 3 5.895 3 7V19C3 20.105 3.895 21 5 21Z">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Date et heure d'entrée *">
                                    <input type="datetime-local" value={form.date_entree}
                                        onChange={e => setForm(p => ({ ...p, date_entree: e.target.value }))}
                                        className={`${inputCls} ${errors.date_entree ? 'border-red-400' : ''}`}/>
                                    {errors.date_entree && <p className="mt-1 text-xs text-red-500">{errors.date_entree}</p>}
                                </Field>
                                <Field label="Date de sortie prévue">
                                    <input type="date" value={form.date_sortie_prevue}
                                        onChange={e => setForm(p => ({ ...p, date_sortie_prevue: e.target.value }))}
                                        min={form.date_entree ? form.date_entree.slice(0, 10) : undefined}
                                        className={inputCls}/>
                                </Field>
                            </div>
                        </Section>
                    </div>

                    {/* ── Sidebar (1/3) ────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Récap */}
                        <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <h3 className="mb-4 text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Récapitulatif</h3>

                            <div className="space-y-3">
                                <RecapRow
                                    icon="M19 3H5C3.895 3 3 3.895 3 5V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V5C21 3.895 20.105 3 19 3ZM3 9H21M9 21V9"
                                    label="Lit"
                                    value={litSelectionne ? `Lit ${litSelectionne.numero}${litSelectionne.chambre ? ` — ${litSelectionne.chambre}` : ''}` : null}
                                    placeholder="Non sélectionné"
                                    error={!!errors.lit_id}
                                />
                                <RecapRow
                                    icon="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z"
                                    label="Patient"
                                    value={patientSelectionne?.nom_complet ?? null}
                                    placeholder="Non sélectionné"
                                    error={!!errors.patient_id}
                                />
                                <RecapRow
                                    icon="M8 7V3M16 7V3M3 11H21M5 21H19C20.105 21 21 20.105 21 19V7C21 5.895 20.105 5 19 5H5C3.895 5 3 5.895 3 7V19C3 20.105 3.895 21 5 21Z"
                                    label="Entrée"
                                    value={form.date_entree ? new Date(form.date_entree).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : null}
                                    placeholder="—"
                                />
                                {litSelectionne?.service && (
                                    <RecapRow
                                        icon="M3 9L12 2L21 9V20C21 20.552 20.552 21 20 21H15V16H9V21H4C3.448 21 3 20.552 3 20V9Z"
                                        label="Service"
                                        value={litSelectionne.service.nom}
                                    />
                                )}
                            </div>

                            {/* Coût estimé */}
                            {coutEstime && (
                                <div className="mt-4 rounded-lg bg-[#f5f5f3] p-3 dark:bg-[#1C1C1A]">
                                    <p className="text-xs font-medium uppercase text-[#706f6c] dark:text-[#A1A09A]">Coût estimé</p>
                                    <p className="mt-1 text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                        {coutEstime.total} FCFA
                                    </p>
                                    <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                        {coutEstime.jours} jour{coutEstime.jours > 1 ? 's' : ''} × {parseFloat(litSelectionne!.tarif_journalier!).toLocaleString('fr-FR')} FCFA/j
                                    </p>
                                </div>
                            )}

                            {/* Bouton soumettre */}
                            <button type="submit" disabled={loading || lits_disponibles.length === 0}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#f53003] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#d42a03] disabled:opacity-50">
                                {loading ? (
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12C21.999 14.156 21.3 16.255 20.009 17.982C18.718 19.709 16.903 20.972 14.835 21.584C12.767 22.195 10.557 22.122 8.534 21.375C6.512 20.627 4.785 19.246 3.611 17.437C2.437 15.628 1.88 13.488 2.022 11.336C2.164 9.185 2.997 7.136 4.398 5.497C5.799 3.858 7.693 2.715 9.796 2.24C11.9 1.765 14.1 1.982 16.07 2.86M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                                Admettre le patient
                            </button>
                        </div>

                        {/* Lien retour */}
                        <Link href="/lits" className="flex items-center gap-2 text-sm text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433]">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Retour aux lits
                        </Link>

                        {/* Info lits disponibles */}
                        {lits_disponibles.length > 0 && !litSelectionne && (
                            <div className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <p className="text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Lits disponibles</p>
                                <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{lits_disponibles.length}</p>
                                <div className="mt-2 space-y-1">
                                    {Object.entries(
                                        lits_disponibles.reduce((acc, l) => {
                                            acc[l.service.nom] = (acc[l.service.nom] ?? 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).slice(0, 4).map(([nom, count]) => (
                                        <div key={nom} className="flex items-center justify-between text-xs">
                                            <span className="text-[#706f6c] dark:text-[#A1A09A] truncate">{nom}</span>
                                            <span className="ml-2 font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f3] dark:bg-[#1C1C1A]">
                    <svg className="h-4 w-4 text-[#f53003]" viewBox="0 0 24 24" fill="none">
                        <path d={icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h3 className="text-sm font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{label}</label>
            {children}
        </div>
    );
}

function RecapRow({ icon, label, value, placeholder, error }: {
    icon: string; label: string; value: string | null; placeholder?: string; error?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <svg className={`mt-0.5 h-4 w-4 flex-shrink-0 ${value ? 'text-[#f53003]' : error ? 'text-red-400' : 'text-[#e3e3e0] dark:text-[#3E3E3A]'}`} viewBox="0 0 24 24" fill="none">
                <path d={icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="min-w-0">
                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{label}</p>
                <p className={`truncate text-sm font-medium ${value ? 'text-[#1b1b18] dark:text-[#EDEDEC]' : error ? 'text-red-500' : 'text-[#e3e3e0] dark:text-[#3E3E3A]'}`}>
                    {value ?? placeholder ?? '—'}
                </p>
            </div>
        </div>
    );
}