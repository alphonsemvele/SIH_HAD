import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from './layout';


interface Patient { id: number; nom_complet: string; date_naissance?: string; telephone?: string; }
interface Lit     { id: number; numero: string; chambre?: string; }
interface Service  { id: number; nom: string; etage?: string; }

interface Occupation {
  id: number;
  statut: 'active' | 'terminee' | 'transfere' | 'annulee';
  diagnostic_principal?: string;
  date_entree: string;
  date_sortie?: string;
  date_sortie_prevue?: string;
  motif_sortie?: string;
  duree_sejour: number;
  cout_sejour?: number;
  est_active: boolean;
  patient?: Patient;
  lit?: Lit;
  service?: Service;
  medecin?: string;
  infirmier?: string;
}

interface Props {
  occupations: { data: Occupation[]; links: any[]; meta: any };
  services: Service[];
  filters: { statut?: string; service_id?: string; search?: string };
}

const statutBadge = {
  active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  terminee: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  transfere:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  annulee:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statutLabel = {
  active: 'Active', terminee: 'Terminée', transfere: 'Transféré', annulee: 'Annulée',
};

export default function OccupationsIndex({ occupations, services, filters }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');

  const applyFilter = (key: string, value: string) => {
    router.get('/lits/occupations', { ...filters, [key]: value || undefined }, { preserveScroll: true, replace: true });
  };

  return (
    <DashboardLayout title="Occupations des chambres" subtitle="Historique et occupation actuelle des lits">
      {/* Barre de filtres */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilter('search', search)}
          placeholder="Rechercher un patient…"
          className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm focus:border-[#f53003] focus:outline-none dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
        />
        <select
          value={filters.statut ?? ''}
          onChange={e => applyFilter('statut', e.target.value)}
          className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="terminee">Terminées</option>
          <option value="transfere">Transférées</option>
        </select>
        <select
          value={filters.service_id ?? ''}
          onChange={e => applyFilter('service_id', e.target.value)}
          className="rounded-lg border border-[#e3e3e0] px-4 py-2 text-sm dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]"
        >
          <option value="">Tous les services</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
        <Link
          href="/lits/occupations/create"
          className="ml-auto flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2 text-sm font-medium text-white hover:bg-[#d42a03]"
        >
          + Nouvelle admission
        </Link>
      </div>

      {/* Tableau */}
      <div className="overflow-hidden rounded-xl border border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e3e3e0] dark:border-[#3E3E3A]">
            <tr className="text-left text-xs font-medium text-[#706f6c] dark:text-[#A1A09A]">
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Lit / Service</th>
              <th className="px-4 py-3">Diagnostic</th>
              <th className="px-4 py-3">Entrée</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
            {occupations.data.map(occ => (
              <tr key={occ.id} className="hover:bg-[#f5f5f3] dark:hover:bg-[#1C1C1A]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{occ.patient?.nom_complet ?? '—'}</p>
                  <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{occ.patient?.telephone}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">Lit {occ.lit?.numero}</p>
                  <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{occ.service?.nom}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#1b1b18] dark:text-[#EDEDEC] truncate max-w-[160px]">{occ.diagnostic_principal ?? '—'}</p>
                </td>
                <td className="px-4 py-3 text-[#1b1b18] dark:text-[#EDEDEC] whitespace-nowrap">{occ.date_entree}</td>
                <td className="px-4 py-3 text-[#1b1b18] dark:text-[#EDEDEC]">{occ.duree_sejour}j</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutBadge[occ.statut]}`}>
                    {statutLabel[occ.statut]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/lits/occupations/${occ.id}`} className="text-[#f53003] hover:underline text-xs font-medium">
                      Voir
                    </Link>
                    {occ.est_active && (
                      <>
                        <span className="text-[#e3e3e0]">|</span>
                        <Link href={`/lits/occupations/${occ.id}#terminer`} className="text-gray-500 hover:text-red-600 text-xs">
                          Sortie
                        </Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {occupations.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                  Aucune occupation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {occupations.links.length > 3 && (
        <div className="mt-4 flex justify-center gap-1">
          {occupations.links.map((link, i) => (
            <Link
              key={i}
              href={link.url ?? '#'}
              className={`rounded px-3 py-1.5 text-sm ${
                link.active
                  ? 'bg-[#f53003] text-white'
                  : 'border border-[#e3e3e0] text-[#706f6c] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#A1A09A]'
              } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}