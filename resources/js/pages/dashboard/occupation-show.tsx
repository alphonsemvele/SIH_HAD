import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';


interface OccupationDetail {
  id: number;
  statut: string;
  diagnostic_principal?: string;
  notes_admission?: string;
  notes_sortie?: string;
  date_entree: string;
  date_sortie_prevue?: string;
  date_sortie?: string;
  motif_sortie?: string;
  duree_sejour: number;
  cout_sejour?: number;
  est_active: boolean;
  patient?: { id: number; nom_complet: string; date_naissance?: string; telephone?: string };
  lit?: { id: number; numero: string; chambre?: string };
  service?: { id: number; nom: string; etage?: string };
  medecin?: string;
  infirmier?: string;
  cree_par?: string;
  lit_destination?: { id: number; numero: string };
  service_destination?: string;
}

interface HistoriqueEntry {
  patient: string;
  diagnostic?: string;
  date_entree: string;
  date_sortie?: string;
  duree_jours: number;
  motif?: string;
}

interface Props {
  occupation: OccupationDetail;
  precedentes: HistoriqueEntry[];
}

const motifSortieOptions = [
  { value: 'guerison',             label: 'Guérison' },
  { value: 'transfert_externe',    label: 'Transfert externe' },
  { value: 'sortie_contre_avis',   label: 'Sortie contre avis médical' },
  { value: 'deces',                label: 'Décès' },
  { value: 'fuga',                 label: 'Fuga' },
  { value: 'autre',                label: 'Autre' },
];

export default function OccupationShow({ occupation, precedentes }: Props) {
  const [showSortie, setShowSortie]       = useState(false);
  const [showTransfert, setShowTransfert] = useState(false);
  const [motifSortie, setMotifSortie]     = useState('guerison');
  const [notesSortie, setNotesSortie]     = useState('');
  const [litDest, setLitDest]             = useState('');

  const submitSortie = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/lits/occupations/${occupation.id}/terminer`, {
      motif_sortie: motifSortie,
      notes_sortie: notesSortie,
    });
  };

  const submitTransfert = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(`/lits/occupations/${occupation.id}/transferer`, {
      lit_destination_id: litDest,
    });
  };

  const statutColor = {
    active:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    terminee: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    transfere:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    annulee:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }[occupation.statut] ?? '';

  return (
    <DashboardLayout
      title={`Occupation #${occupation.id}`}
      subtitle={`Lit ${occupation.lit?.numero} — ${occupation.service?.nom}`}
    >
      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Colonne principale (2/3) ───────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Résumé */}
          <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Informations d'occupation</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statutColor}`}>
                {occupation.statut}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <InfoRow label="Patient"        value={occupation.patient?.nom_complet ?? '—'} />
              <InfoRow label="Date de naissance" value={occupation.patient?.date_naissance ?? '—'} />
              <InfoRow label="Téléphone"      value={occupation.patient?.telephone ?? '—'} />
              <InfoRow label="Médecin"        value={occupation.medecin ?? '—'} />
              <InfoRow label="Infirmier(e)"   value={occupation.infirmier ?? '—'} />
              <InfoRow label="Entrée"         value={occupation.date_entree} />
              <InfoRow label="Sortie prévue"  value={occupation.date_sortie_prevue ?? '—'} />
              <InfoRow label="Sortie réelle"  value={occupation.date_sortie ?? '—'} />
              <InfoRow label="Durée"          value={`${occupation.duree_sejour} jour(s)`} />
              {occupation.cout_sejour != null && (
                <InfoRow label="Coût séjour" value={`${occupation.cout_sejour.toLocaleString()} FCFA`} />
              )}
              {occupation.motif_sortie && (
                <InfoRow label="Motif sortie" value={occupation.motif_sortie} />
              )}
              {occupation.service_destination && (
                <InfoRow label="Service destination" value={occupation.service_destination} />
              )}
            </div>

            {occupation.diagnostic_principal && (
              <div className="mt-4 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Diagnostic principal</p>
                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{occupation.diagnostic_principal}</p>
              </div>
            )}

            {occupation.notes_admission && (
              <div className="mt-4 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Notes d'admission</p>
                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] whitespace-pre-line">{occupation.notes_admission}</p>
              </div>
            )}

            {occupation.notes_sortie && (
              <div className="mt-4 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
                <p className="mb-1 text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Notes de sortie</p>
                <p className="text-sm text-[#1b1b18] dark:text-[#EDEDEC] whitespace-pre-line">{occupation.notes_sortie}</p>
              </div>
            )}
          </div>

          {/* Historique des anciens patients sur ce lit */}
          {precedentes.length > 0 && (
            <div className="rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
              <div className="border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                <h2 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                  Historique du lit {occupation.lit?.numero}
                </h2>
                <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Patients ayant occupé ce lit avant</p>
              </div>
              <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                {precedentes.map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div>
                      <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{h.patient}</p>
                      {h.diagnostic && <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{h.diagnostic}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#1b1b18] dark:text-[#EDEDEC]">
                        {h.date_entree} → {h.date_sortie ?? 'en cours'}
                      </p>
                      <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                        {h.duree_jours}j • {h.motif ?? '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne actions (1/3) ──────────────────────────────── */}
        <div className="space-y-4">

          {/* Lit / Service */}
          <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <h3 className="mb-3 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Localisation</h3>
            <div className="space-y-2 text-sm">
              <InfoRow label="Lit"     value={`Lit ${occupation.lit?.numero}${occupation.lit?.chambre ? ` — ${occupation.lit.chambre}` : ''}`} />
              <InfoRow label="Service" value={occupation.service?.nom ?? '—'} />
              <InfoRow label="Étage"   value={occupation.service?.etage ?? '—'} />
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/lits/occupations/lit/${occupation.lit?.id}`}
                className="flex-1 rounded-lg border border-[#e3e3e0] px-3 py-2 text-center text-xs font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                Voir le lit
              </Link>
            </div>
          </div>

          {/* Actions si occupation active */}
          {occupation.est_active && (
            <div className="rounded-xl border border-[#e3e3e0] bg-white p-5 dark:border-[#3E3E3A] dark:bg-[#161615]">
              <h3 className="mb-3 font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setShowSortie(true)}
                  className="w-full rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                  Sortie du patient
                </button>
                <button onClick={() => setShowTransfert(true)}
                  className="w-full rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  Transférer vers autre lit
                </button>
              </div>
            </div>
          )}

          {/* Lien retour */}
          <Link href="/lits" className="block rounded-xl border border-[#e3e3e0] bg-white px-5 py-3 text-center text-sm text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#A1A09A]">
            ← Retour aux lits
          </Link>
        </div>
      </div>

      {/* ── Modal : Sortie patient ─────────────────────────────────────── */}
      {showSortie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
            <div className="border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
              <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Sortie du patient</h2>
              <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                {occupation.patient?.nom_complet} — Lit {occupation.lit?.numero}
              </p>
            </div>
            <form onSubmit={submitSortie} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Motif de sortie *</label>
                <select value={motifSortie} onChange={e => setMotifSortie(e.target.value)}
                  className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                  {motifSortieOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Notes de sortie</label>
                <textarea value={notesSortie} onChange={e => setNotesSortie(e.target.value)} rows={3}
                  className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                  placeholder="Notes médicales, recommandations…" />
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                Le lit passera automatiquement en statut "nettoyage".
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowSortie(false)}
                  className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                  Annuler
                </button>
                <button type="submit" className="rounded-lg bg-[#f53003] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
                  Confirmer la sortie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal : Transfert ─────────────────────────────────────────── */}
      {showTransfert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#161615]">
            <div className="border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
              <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Transférer le patient</h2>
              <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{occupation.patient?.nom_complet}</p>
            </div>
            <form onSubmit={submitTransfert} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                  Numéro du lit destination *
                </label>
                <input value={litDest} onChange={e => setLitDest(e.target.value)} type="number"
                  placeholder="ID du lit disponible…" required
                  className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]" />
                <p className="mt-1 text-xs text-[#706f6c]">
                  <Link href="/lits" className="text-[#f53003] hover:underline">Consulter les lits disponibles</Link>
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowTransfert(false)}
                  className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                  Annuler
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  Transférer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{label}</p>
      <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{value}</p>
    </div>
  );
}