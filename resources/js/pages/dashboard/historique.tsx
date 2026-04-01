import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';


// ─── Types ───────────────────────────────────────────────────────────────────

interface Service {
  id: number;
  nom: string;
}

interface HistoriqueEntry {
  id: number;
  action: string;
  ancien_statut: string | null;
  nouveau_statut: string;
  commentaire: string | null;
  effectue_le: string;
  lit: { id: number; numero: string } | null;
  service: { id: number; nom: string } | null;
  user: { id: number; name: string } | null;
  occupation: {
    id: number;
    patient: { nom_complet: string } | null;
  } | null;
  service_source: { nom: string } | null;
  service_destination: { nom: string } | null;
}

interface Pagination {
  data: HistoriqueEntry[];
  links: { url: string | null; label: string; active: boolean }[];
  meta: {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
}

interface Props {
  historique: Pagination;
  services: Service[];
  filters: {
    service_id?: string;
    action?: string;
    date_debut?: string;
    date_fin?: string;
  };
}

// ─── Config visuelles ────────────────────────────────────────────────────────

const actionConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  admission: {
    label: 'Admission',
    icon: 'M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16m-4 0h16M10 12h4',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  sortie: {
    label: 'Sortie',
    icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
  },
  transfert_source: {
    label: 'Transfert (départ)',
    icon: 'M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z',
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  transfert_destination: {
    label: 'Transfert (arrivée)',
    icon: 'M8 21h8m-4-4v4m-7-4h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  nettoyage_debut: {
    label: 'Nettoyage débuté',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  nettoyage_fin: {
    label: 'Nettoyage terminé',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  mise_hors_service: {
    label: 'Mis hors service',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  remise_en_service: {
    label: 'Remis en service',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: 'text-teal-700 dark:text-teal-400',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
  },
  creation: {
    label: 'Création lit',
    icon: 'M12 4v16m8-8H4',
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

const statutDot: Record<string, string> = {
  disponible:    'bg-green-500',
  occupe:        'bg-red-500',
  nettoyage:     'bg-yellow-500',
  'hors-service': 'bg-gray-400',
};

const statutLabel: Record<string, string> = {
  disponible:    'Disponible',
  occupe:        'Occupé',
  nettoyage:     'Nettoyage',
  'hors-service': 'Hors service',
};

// ─── Composant principal ─────────────────────────────────────────────────────

export default function Historique({ historique, services, filters }: Props) {
  const [form, setForm] = useState({
    service_id: filters.service_id ?? '',
    action:     filters.action ?? '',
    date_debut: filters.date_debut ?? '',
    date_fin:   filters.date_fin ?? '',
  });

  const applyFilters = () => {
    router.get('/lits/historique', form, { preserveScroll: true, replace: true });
  };

  const resetFilters = () => {
    const reset = { service_id: '', action: '', date_debut: '', date_fin: '' };
    setForm(reset);
    router.get('/lits/historique', {}, { preserveScroll: true, replace: true });
  };

  const hasActiveFilter = Object.values(form).some(Boolean);

  return (
    <DashboardLayout
      title="Historique des lits"
      subtitle="Journal de tous les événements et changements de statut"
    >
      {/* ── Filtres ──────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
        <div className="flex flex-wrap items-end gap-3">

          {/* Service */}
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Service</label>
            <select
              value={form.service_id}
              onChange={e => setForm(p => ({ ...p, service_id: e.target.value }))}
              className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
            >
              <option value="">Tous les services</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="flex-1 min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Type d'action</label>
            <select
              value={form.action}
              onChange={e => setForm(p => ({ ...p, action: e.target.value }))}
              className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(actionConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Date début */}
          <div className="min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Du</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={e => setForm(p => ({ ...p, date_debut: e.target.value }))}
              className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
            />
          </div>

          {/* Date fin */}
          <div className="min-w-[140px]">
            <label className="mb-1 block text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">Au</label>
            <input
              type="date"
              value={form.date_fin}
              onChange={e => setForm(p => ({ ...p, date_fin: e.target.value }))}
              className="w-full rounded-lg border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03]"
            >
              Filtrer
            </button>
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm font-medium text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A]"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Badge résumé si filtre actif */}
        {hasActiveFilter && (
          <p className="mt-2 text-xs text-[#706f6c] dark:text-[#A1A09A]">
            {historique.meta.total} résultat{historique.meta.total > 1 ? 's' : ''} trouvé{historique.meta.total > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────── */}
      {historique.data.length === 0 ? (
        <div className="rounded-xl border border-[#e3e3e0] bg-white py-20 text-center dark:border-[#3E3E3A] dark:bg-[#161615]">
          <svg className="mx-auto mb-4 h-12 w-12 text-[#e3e3e0] dark:text-[#3E3E3A]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Aucun événement trouvé pour ces filtres.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-[#e3e3e0] dark:bg-[#3E3E3A]" />

          <div className="space-y-3">
            {historique.data.map((entry) => {
              const cfg = actionConfig[entry.action] ?? {
                label: entry.action,
                icon: 'M12 8V12L15 15M12 3a9 9 0 100 18A9 9 0 0012 3z',
                color: 'text-gray-600 dark:text-gray-400',
                bg: 'bg-gray-100 dark:bg-gray-800',
              };

              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Icône de l'action */}
                  <div className={`relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0a] ${cfg.bg}`}>
                    <svg className={`h-5 w-5 ${cfg.color}`} viewBox="0 0 24 24" fill="none">
                      <path d={cfg.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0 rounded-xl border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
                    <div className="flex flex-wrap items-start justify-between gap-2">

                      {/* Titre + lit */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                          {entry.lit && (
                            <Link
                              href={`/lits/${entry.lit.id}`}
                              className="rounded-md border border-[#e3e3e0] px-2 py-0.5 text-xs font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]"
                            >
                              Lit {entry.lit.numero}
                            </Link>
                          )}
                          {entry.service && (
                            <span className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                              {entry.service.nom}
                            </span>
                          )}
                        </div>

                        {/* Patient lié */}
                        {entry.occupation?.patient && (
                          <p className="mt-0.5 text-sm text-[#1b1b18] dark:text-[#EDEDEC]">
                            👤 {entry.occupation.patient.nom_complet}
                            {entry.occupation.id && (
                              <Link
                                href={`/lits/occupations/${entry.occupation.id}`}
                                className="ml-2 text-xs text-[#f53003] hover:underline"
                              >
                                Voir l'occupation
                              </Link>
                            )}
                          </p>
                        )}

                        {/* Commentaire */}
                        {entry.commentaire && (
                          <p className="mt-1 text-xs text-[#706f6c] dark:text-[#A1A09A] italic">
                            {entry.commentaire}
                          </p>
                        )}

                        {/* Transfert info */}
                        {(entry.service_source || entry.service_destination) && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            {entry.service_source && <span>{entry.service_source.nom}</span>}
                            {entry.service_source && entry.service_destination && (
                              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                            {entry.service_destination && <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{entry.service_destination.nom}</span>}
                          </div>
                        )}
                      </div>

                      {/* Droite : statuts + date + user */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {/* Changement de statut */}
                        <div className="flex items-center gap-1.5">
                          {entry.ancien_statut && (
                            <>
                              <StatutBadge statut={entry.ancien_statut} />
                              <svg className="h-3 w-3 text-[#706f6c]" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12H19M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </>
                          )}
                          <StatutBadge statut={entry.nouveau_statut} />
                        </div>

                        {/* Date */}
                        <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                          {entry.effectue_le}
                        </p>

                        {/* Utilisateur */}
                        {entry.user && (
                          <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">
                            par <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{entry.user.name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {historique.links.length > 3 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
            {historique.meta.from}–{historique.meta.to} sur {historique.meta.total} événements
          </p>
          <div className="flex gap-1">
            {historique.links.map((link, i) => (
              <Link
                key={i}
                href={link.url ?? '#'}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  link.active
                    ? 'bg-[#f53003] text-white'
                    : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A] dark:hover:bg-[#1C1C1A]'
                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Lien retour ──────────────────────────────────────────────── */}
      <div className="mt-6">
        <Link
          href="/lits"
          className="inline-flex items-center gap-2 text-sm text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A] dark:hover:text-[#FF4433]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour aux lits
        </Link>
      </div>
    </DashboardLayout>
  );
}

// ─── Composant badge statut ───────────────────────────────────────────────────

function StatutBadge({ statut }: { statut: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#e3e3e0] bg-white px-2 py-0.5 text-[10px] font-medium text-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
      <span className={`h-1.5 w-1.5 rounded-full ${statutDot[statut] ?? 'bg-gray-400'}`} />
      {statutLabel[statut] ?? statut}
    </span>
  );
}