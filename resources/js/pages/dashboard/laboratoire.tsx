import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import DashboardLayout from './layout';

// ─── Types ────────────────────────────────────────────────────
interface LigneResultat {
    parametre: string;
    valeur: string;
    unite: string | null;
    valeur_reference: string | null;
    interpretation: 'normal' | 'bas' | 'eleve';
}

interface Analyse {
    id: number;
    numero: string;
    patient:       { id: number; nom: string; prenom: string; sexe: string };
    type:          string | null;
    categorie:     string | null;
    prescripteur:  string | null;
    technicien:    string | null;
    biologiste:    string | null;
    statut:        'prescrit' | 'preleve' | 'en_cours' | 'resultat_disponible' | 'valide' | 'annule';
    urgent:        boolean;
    date_prescription:  string | null;
    date_prelevement:   string | null;
    date_resultat:      string | null;
    resultat:           LigneResultat[];
    interpretation:     string | null;
    conclusion:         string | null;
    commentaire_medecin:string | null;
}

interface TypeAnalyse { id: number; nom: string; categorie: string | null }
interface Patient     { id: number; nom: string; prenom: string; sexe: string; date_naissance: string }
interface Medecin     { id: number; name: string }

interface Props {
    analyses:      { data: Analyse[]; total: number; last_page: number; links: any[] };
    stats:         { total: number; en_attente: number; en_cours: number; termines: number; urgents: number };
    typesAnalyses: TypeAnalyse[];
    categories:    string[];
    patients:      Patient[];
    medecins:      Medecin[];
    filters:       { search?: string; categorie?: string; statut?: string; urgent?: string };
}

const STATUT_LABELS: Record<string, string> = {
    prescrit:             'Prescrit',
    preleve:              'Prélevé',
    en_cours:             'En cours',
    resultat_disponible:  'Résultat dispo',
    valide:               'Validé',
    annule:               'Annulé',
};
const STATUT_COLORS: Record<string, string> = {
    prescrit:            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    preleve:             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    en_cours:            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    resultat_disponible: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    valide:              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    annule:              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
const STATUTS = ['prescrit', 'preleve', 'en_cours', 'resultat_disponible', 'valide', 'annule'] as const;

// ─── Modale Nouvelle Demande ──────────────────────────────────
function NouvelleDemande({ typesAnalyses, patients, medecins, onClose }: {
    typesAnalyses: TypeAnalyse[];
    patients: Patient[];
    medecins: Medecin[];
    onClose: () => void;
}) {
    const [form, setForm] = useState({
        patient_id: '', type_examen_id: '', medecin_prescripteur_id: '',
        urgent: false, commentaire_medecin: '',
    });
    const [processing, setProcessing] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/laboratoire', form as any, {
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
        });
    };

    const inp = "w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <h2 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Nouvelle demande d'analyse</h2>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Prescription d'examens biologiques</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Patient *</label>
                        <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}
                            className={inp} required>
                            <option value="">Sélectionner un patient...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.nom} {p.prenom} — {p.date_naissance} ({p.sexe})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Type d'analyse *</label>
                        <select value={form.type_examen_id} onChange={e => setForm(f => ({ ...f, type_examen_id: e.target.value }))}
                            className={inp} required>
                            <option value="">Sélectionner...</option>
                            {typesAnalyses.map(t => (
                                <option key={t.id} value={t.id}>{t.categorie ? `[${t.categorie}] ` : ''}{t.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Médecin prescripteur *</label>
                        <select value={form.medecin_prescripteur_id}
                            onChange={e => setForm(f => ({ ...f, medecin_prescripteur_id: e.target.value }))}
                            className={inp} required>
                            <option value="">Sélectionner...</option>
                            {medecins.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    </div>

                    {/* Urgence */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-[#e3e3e0] p-3 transition-colors hover:border-orange-400 dark:border-[#3E3E3A]"
                        style={{ borderColor: form.urgent ? '#f97316' : undefined, background: form.urgent ? 'rgb(255 247 237)' : undefined }}>
                        <input type="checkbox" checked={form.urgent}
                            onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))}
                            className="h-4 w-4 rounded text-orange-500" />
                        <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">⚡ Analyse urgente</span>
                    </label>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Commentaire médecin</label>
                        <textarea rows={3} value={form.commentaire_medecin}
                            onChange={e => setForm(f => ({ ...f, commentaire_medecin: e.target.value }))}
                            className={inp} placeholder="Contexte clinique, traitement en cours, hypothèse diagnostique..." />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border border-[#e3e3e0] px-6 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                            Annuler
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {processing ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modale Résultats ─────────────────────────────────────────
function ResultatsModal({ analyse, onClose }: { analyse: Analyse; onClose: () => void }) {
    const isReadOnly = analyse.statut === 'valide' || analyse.statut === 'annule';

    const [resultats, setResultats] = useState<LigneResultat[]>(
        analyse.resultat?.length > 0 ? analyse.resultat :
        [{ parametre: '', valeur: '', unite: '', valeur_reference: '', interpretation: 'normal' }]
    );
    const [interpretation, setInterpretation] = useState(analyse.interpretation ?? '');
    const [conclusion,     setConclusion]     = useState(analyse.conclusion ?? '');
    const [processing, setProcessing] = useState(false);

    const addRow    = () => setResultats(r => [...r, { parametre: '', valeur: '', unite: '', valeur_reference: '', interpretation: 'normal' }]);
    const removeRow = (i: number) => setResultats(r => r.filter((_, idx) => idx !== i));
    const updateRow = (i: number, key: keyof LigneResultat, val: string) =>
        setResultats(r => r.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

    const updateStatut = (statut: string) => {
        setProcessing(true);
        router.put(`/laboratoire/${analyse.id}/statut`, { statut }, {
            onFinish: () => setProcessing(false), onSuccess: onClose,
        });
    };

    const saveResultats = () => {
        setProcessing(true);
        router.post(`/laboratoire/${analyse.id}/resultats`, { resultat: resultats, interpretation, conclusion } as any, {
            onFinish: () => setProcessing(false), onSuccess: onClose,
        });
    };

    const valider = () => {
        setProcessing(true);
        router.put(`/laboratoire/${analyse.id}/valider`, {}, {
            onFinish: () => setProcessing(false), onSuccess: onClose,
        });
    };

    const inp = "rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]";
    const INTERP_COLORS: Record<string, string> = {
        normal: 'text-green-600 dark:text-green-400',
        bas:    'text-blue-600 dark:text-blue-400',
        eleve:  'text-red-600 dark:text-red-400',
    };
    const currentIndex = STATUTS.indexOf(analyse.statut as typeof STATUTS[number]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl dark:bg-[#161615] max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e3e3e0] bg-white px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Résultats d'analyse</h2>
                            {analyse.urgent && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">⚡ Urgent</span>}
                        </div>
                        <p className="font-mono text-sm text-[#f53003] dark:text-[#FF4433]">{analyse.numero}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 text-[#706f6c] hover:bg-[#e3e3e0] dark:text-[#A1A09A] dark:hover:bg-[#3E3E3A]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Patient + info */}
                    <div className="rounded-lg bg-[#f5f5f3] p-4 dark:bg-[#1C1C1A]">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 ${analyse.patient.sexe === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                    {analyse.patient.prenom[0]}{analyse.patient.nom[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.patient.prenom} {analyse.patient.nom}</p>
                                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{analyse.type}{analyse.categorie ? ` · ${analyse.categorie}` : ''}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div><span className="text-[#706f6c]">Prescrit par: </span><span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.prescripteur ?? '—'}</span></div>
                                <div><span className="text-[#706f6c]">Prescription: </span><span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.date_prescription ?? '—'}</span></div>
                                <div><span className="text-[#706f6c]">Prélèvement: </span><span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.date_prelevement ?? '—'}</span></div>
                                <div><span className="text-[#706f6c]">Résultat: </span><span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.date_resultat ?? '—'}</span></div>
                            </div>
                        </div>
                        {analyse.commentaire_medecin && (
                            <div className="mt-3 rounded-lg border border-[#e3e3e0] bg-white p-3 dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Commentaire médecin</p>
                                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.commentaire_medecin}</p>
                            </div>
                        )}
                    </div>

                    {/* Avancement statut */}
                    {!isReadOnly && (
                        <div>
                            <p className="mb-2 text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Avancement</p>
                            <div className="flex items-center gap-2">
                                {STATUTS.map((s, i) => (
                                    <button key={s} onClick={() => updateStatut(s)} disabled={processing}
                                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${i === currentIndex ? 'bg-[#f53003] text-white' : i < currentIndex ? 'bg-green-500 text-white' : 'bg-[#f5f5f3] text-[#706f6c] hover:bg-[#e3e3e0] dark:bg-[#1C1C1A] dark:text-[#A1A09A]'}`}>
                                        {STATUT_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tableau résultats */}
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Paramètres biologiques</p>
                            {!isReadOnly && (
                                <button onClick={addRow} className="flex items-center gap-1 text-sm text-[#f53003] hover:underline dark:text-[#FF4433]">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                    Ajouter ligne
                                </button>
                            )}
                        </div>
                        <div className="overflow-hidden rounded-lg border border-[#e3e3e0] dark:border-[#3E3E3A]">
                            <table className="w-full">
                                <thead className="bg-[#fafaf9] dark:bg-[#0a0a0a]">
                                    <tr>
                                        {['Paramètre', 'Résultat', 'Unité', 'Référence', 'Interprétation', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                    {resultats.map((r, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3">
                                                {isReadOnly
                                                    ? <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{r.parametre}</span>
                                                    : <input type="text" value={r.parametre} onChange={e => updateRow(i, 'parametre', e.target.value)}
                                                        className={inp + " w-full"} placeholder="Hémoglobine" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isReadOnly
                                                    ? <span className={`text-sm font-semibold ${INTERP_COLORS[r.interpretation]}`}>{r.valeur}</span>
                                                    : <input type="text" value={r.valeur} onChange={e => updateRow(i, 'valeur', e.target.value)}
                                                        className={inp + " w-24"} placeholder="12.5" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isReadOnly
                                                    ? <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{r.unite}</span>
                                                    : <input type="text" value={r.unite ?? ''} onChange={e => updateRow(i, 'unite', e.target.value)}
                                                        className={inp + " w-20"} placeholder="g/dL" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isReadOnly
                                                    ? <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{r.valeur_reference}</span>
                                                    : <input type="text" value={r.valeur_reference ?? ''} onChange={e => updateRow(i, 'valeur_reference', e.target.value)}
                                                        className={inp + " w-28"} placeholder="12-16" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                {isReadOnly ? (
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.interpretation === 'normal' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : r.interpretation === 'bas' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {r.interpretation === 'normal' ? '✓ Normal' : r.interpretation === 'bas' ? '↓ Bas' : '↑ Élevé'}
                                                    </span>
                                                ) : (
                                                    <select value={r.interpretation} onChange={e => updateRow(i, 'interpretation', e.target.value)} className={inp}>
                                                        <option value="normal">Normal</option>
                                                        <option value="bas">Bas</option>
                                                        <option value="eleve">Élevé</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {!isReadOnly && resultats.length > 1 && (
                                                    <button onClick={() => removeRow(i)} className="text-[#A1A09A] hover:text-red-500">
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Interprétation + Conclusion */}
                    {!isReadOnly && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Interprétation globale</label>
                                <textarea rows={3} value={interpretation} onChange={e => setInterpretation(e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Interprétation générale des résultats..." />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Conclusion du biologiste</label>
                                <textarea rows={3} value={conclusion} onChange={e => setConclusion(e.target.value)}
                                    className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                                    placeholder="Conclusion et recommandations..." />
                            </div>
                        </div>
                    )}

                    {/* Lecture seule interp/conclusion */}
                    {isReadOnly && (analyse.interpretation || analyse.conclusion) && (
                        <div className="grid gap-4 md:grid-cols-2">
                            {analyse.interpretation && (
                                <div className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                    <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Interprétation</p>
                                    <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.interpretation}</p>
                                </div>
                            )}
                            {analyse.conclusion && (
                                <div className="rounded-lg border border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
                                    <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Conclusion</p>
                                    <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{analyse.conclusion}</p>
                                    {analyse.biologiste && <p className="mt-2 text-xs text-[#706f6c]">— {analyse.biologiste}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#e3e3e0] bg-[#fafaf9] px-6 py-4 dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                    <button onClick={onClose}
                        className="rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                        Fermer
                    </button>
                    {analyse.statut === 'en_cours' && (
                        <button onClick={saveResultats} disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] disabled:opacity-60">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {processing ? 'Enregistrement...' : 'Enregistrer les résultats'}
                        </button>
                    )}
                    {analyse.statut === 'resultat_disponible' && (
                        <button onClick={valider} disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {processing ? 'Validation...' : 'Valider l\'analyse'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────
export default function Laboratoire({ analyses, stats, typesAnalyses, categories, patients, medecins, filters }: Props) {
    const { flash }: any = usePage().props;
    const [showNew,         setShowNew]         = useState(false);
    const [selectedAnalyse, setSelectedAnalyse] = useState<Analyse | null>(null);
    const [search,    setSearch]    = useState(filters.search    ?? '');
    const [categorie, setCategorie] = useState(filters.categorie ?? '');
    const [statut,    setStatut]    = useState(filters.statut    ?? '');
    const [urgent,    setUrgent]    = useState(filters.urgent    ?? '');

    const applyFilters = (overrides: object = {}) =>
        router.get('/laboratoire', { search, categorie, statut, urgent, ...overrides }, { preserveState: true, replace: true });

    const handleDelete = (a: Analyse) => {
        if (confirm(`Supprimer l'analyse ${a.numero} ?`)) router.delete(`/laboratoire/${a.id}`);
    };

    return (
        <DashboardLayout title="Laboratoire" subtitle="Gestion des analyses et examens biologiques">
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">{flash.success}</div>
            )}

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {[
                    { l: 'Total demandes',  v: stats.total,      icon: '🧪', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { l: 'Prescrits',       v: stats.en_attente, icon: '📋', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { l: 'En cours',        v: stats.en_cours,   icon: '🔄', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                    { l: 'Résultats dispo',        v: stats.termines,   icon: '✅', color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20' },
                    { l: 'Urgents',         v: stats.urgents,    icon: '⚡', color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/20' },
                ].map(s => (
                    <div key={s.l} className="rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                        <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg ${s.bg}`}>{s.icon}</div>
                        <p className={`text-2xl font-semibold ${s.color}`}>{s.v}</p>
                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.l}</p>
                    </div>
                ))}
            </div>

            {/* Filtres */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A09A]" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <input type="text" placeholder="N°, patient, prescripteur..." value={search}
                            onChange={e => { setSearch(e.target.value); applyFilters({ search: e.target.value }); }}
                            className="w-full rounded-lg border border-[#e3e3e0] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]" />
                    </div>
                    <select value={categorie} onChange={e => { setCategorie(e.target.value); applyFilters({ categorie: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Toutes catégories</option>
                        {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                        className="rounded-lg border border-[#e3e3e0] bg-white px-3 py-2.5 text-sm text-[#1b1b18] focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
                        <option value="">Tous statuts</option>
                        {Object.entries(STATUT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <button onClick={() => { const val = urgent === '1' ? '' : '1'; setUrgent(val); applyFilters({ urgent: val }); }}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${urgent === '1' ? 'border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 'border-[#e3e3e0] bg-white text-[#706f6c] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#A1A09A]'}`}>
                        ⚡ Urgents seulement
                    </button>
                </div>
                <button onClick={() => setShowNew(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03] dark:bg-[#FF4433]">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    Nouvelle demande
                </button>
            </div>

            {/* Tableau */}
            <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#e3e3e0] bg-[#fafaf9] dark:border-[#3E3E3A] dark:bg-[#0a0a0a]">
                                {['N° Analyse', 'Patient', 'Type / Catégorie', 'Prescripteur', 'Prescription', 'Statut', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#706f6c] dark:text-[#A1A09A]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                            {analyses.data.map(a => (
                                <tr key={a.id} className={`transition-colors hover:bg-[#fafaf9] dark:hover:bg-[#1C1C1A] ${a.urgent ? 'border-l-2 border-l-orange-400' : ''}`}>
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {a.urgent && <span className="text-orange-500" title="Urgent">⚡</span>}
                                            <span className="font-mono text-sm font-medium text-[#f53003] dark:text-[#FF4433]">{a.numero}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${a.patient.sexe === 'M' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                                {a.patient.prenom[0]}{a.patient.nom[0]}
                                            </div>
                                            <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{a.patient.prenom} {a.patient.nom}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{a.type ?? '—'}</p>
                                        {a.categorie && <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{a.categorie}</p>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{a.prescripteur ?? '—'}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">{a.date_prescription}</td>
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUT_COLORS[a.statut]}`}>
                                            {STATUT_LABELS[a.statut]}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setSelectedAnalyse(a)}
                                                className="rounded-lg p-2 text-[#706f6c] hover:bg-[#f5f5f3] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]" title="Voir / Résultats">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                                            </button>
                                            <button onClick={() => handleDelete(a)}
                                                className="rounded-lg p-2 text-[#706f6c] hover:bg-red-100 hover:text-red-600 dark:text-[#A1A09A] dark:hover:bg-red-900/30 dark:hover:text-red-400" title="Supprimer">
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6M19 6V20C19 20.55 18.55 21 18 21H6C5.45 21 5 20.55 5 20V6H19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {analyses.data.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Aucune analyse trouvée</p>
                        <p className="text-sm text-[#706f6c]">Modifiez vos filtres ou créez une nouvelle demande.</p>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                    <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{analyses.total}</span> analyses
                    </p>
                    {analyses.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {analyses.links.map((link, i) => (
                                <button key={i} disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${link.active ? 'bg-[#f53003] text-white' : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] disabled:opacity-40 dark:border-[#3E3E3A] dark:text-[#A1A09A]'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showNew && (
                <NouvelleDemande typesAnalyses={typesAnalyses} patients={patients} medecins={medecins}
                    onClose={() => setShowNew(false)} />
            )}
            {selectedAnalyse && (
                <ResultatsModal analyse={selectedAnalyse} onClose={() => setSelectedAnalyse(null)} />
            )}
        </DashboardLayout>
    );
}