import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import DashboardLayout from './layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Occupation {
  id: number;
  patient: string | null;
  diagnostic: string | null;
  date_entree: string | null;
}

interface Lit {
  id: number;
  numero: string;
  chambre: string | null;
  type: string;
  statut: 'disponible' | 'occupe' | 'nettoyage' | 'horsservice';
  occupation: Occupation | null;
}

interface Service {
  id: number;
  nom: string;
  etage: string;
  capacite: number;
  occupes: number;
  disponibles: number;
  enNettoyage: number;
  horsService: number;
  lits: Lit[];
}

interface Props {
  services: Service[];
}

// ─── Config statuts ───────────────────────────────────────────────────────────

const statutConfig = {
  disponible:  { bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-200 dark:border-green-900/50',  text: 'text-green-700 dark:text-green-400',  dot: 'bg-green-500',  label: 'Disponible'   },
  occupe:      { bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-900/50',      text: 'text-red-700 dark:text-red-400',      dot: 'bg-red-500',    label: 'Occupé'       },
  nettoyage:   { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-900/50',text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: 'Nettoyage'    },
  horsservice: { bg: 'bg-gray-50 dark:bg-gray-800',        border: 'border-gray-200 dark:border-gray-700',       text: 'text-gray-500 dark:text-gray-400',    dot: 'bg-gray-400',   label: 'Hors service' },
} as const;

type Statut = keyof typeof statutConfig;

// ─── Helpers — mise à jour locale sans rechargement ───────────────────────────

/** Recalcule les compteurs d'un service depuis ses lits. */
function recalculer(s: Service): Service {
  return {
    ...s,
    capacite:    s.lits.length,
    occupes:     s.lits.filter(l => l.statut === 'occupe').length,
    disponibles: s.lits.filter(l => l.statut === 'disponible').length,
    enNettoyage: s.lits.filter(l => l.statut === 'nettoyage').length,
    horsService: s.lits.filter(l => l.statut === 'horsservice').length,
  };
}

/** Change le statut d'un lit et recalcule les compteurs du service. */
function changerStatut(
  services: Service[],
  serviceId: number,
  litId: number,
  nouveauStatut: Statut,
  effacerOccupation = false,
): Service[] {
  return services.map(s => {
    if (s.id !== serviceId) return s;
    const lits = s.lits.map(l =>
      l.id !== litId ? l : { ...l, statut: nouveauStatut, occupation: effacerOccupation ? null : l.occupation }
    );
    return recalculer({ ...s, lits });
  });
}

/** Déplace un lit d'un service source vers un service destination. */
function deplacerLit(services: Service[], srcId: number, litId: number, dstId: number): Service[] {
  let litRef: Lit | null = null;

  const apresRetrait = services.map(s => {
    if (s.id !== srcId) return s;
    const lits = s.lits.filter(l => { if (l.id === litId) { litRef = l; return false; } return true; });
    return recalculer({ ...s, lits });
  });

  if (!litRef) return services;

  return apresRetrait.map(s => {
    if (s.id !== dstId) return s;
    const litReset: Lit = { ...litRef!, statut: 'disponible', occupation: null };
    return recalculer({ ...s, lits: [...s.lits, litReset] });
  });
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function LitsIndex({ services: initialServices }: Props) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

  // État local — mis à jour immédiatement à chaque action
  const [services, setServices] = useState<Service[]>(initialServices);

  // Re-sync si Inertia re-render la page (navigation retour, etc.)
  useEffect(() => { setServices(initialServices); }, [initialServices]);

  // ── Toast inline ─────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modals ───────────────────────────────────────────────────────────
  const [showAddService,  setShowAddService]  = useState(false);
  const [showAddLit,      setShowAddLit]      = useState<number | null>(null);
  const [showNettoyage,   setShowNettoyage]   = useState<{ serviceId: number; lit: Lit } | null>(null);
  const [showDisponible,  setShowDisponible]  = useState<{ serviceId: number; lit: Lit } | null>(null);
  const [showHorsService, setShowHorsService] = useState<{ serviceId: number; lit: Lit } | null>(null);
  const [showTransferer,  setShowTransferer]  = useState<{ serviceId: number; lit: Lit } | null>(null);
  const [showOccupation,  setShowOccupation]  = useState<{ serviceId: number; lit: Lit } | null>(null);

  // ── Formulaires ──────────────────────────────────────────────────────
  const [newService,        setNewService]        = useState({ nom: '', etage: '', code: '', description: '' });
  const [newLit,            setNewLit]            = useState({ numero: '', chambre: '', type: 'standard', statut: 'disponible', tarif_journalier: '' });
  const [transferServiceId, setTransferServiceId] = useState<number | ''>('');
  const [horsServiceRaison, setHorsServiceRaison] = useState('');
  const [loading,           setLoading]           = useState(false);

  // ─────────────────────────────────────────────────────────────────────
  // SOUMISSIONS — pattern : snapshot → mise à jour locale immédiate → rollback si erreur
  // ─────────────────────────────────────────────────────────────────────

  const submitService = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    router.post('/lits/services', newService, {
      preserveScroll: true,
      onSuccess: page => {
        const fresh = (page.props as any).services as Service[];
        const dernier = fresh.at(-1);
        if (dernier) setServices(prev => [...prev, dernier]);
        setShowAddService(false);
        setNewService({ nom: '', etage: '', code: '', description: '' });
        showToast(true, `Service « ${newService.nom} » créé.`);
      },
      onError: () => showToast(false, 'Erreur lors de la création du service.'),
      onFinish: () => setLoading(false),
    });
  };

  const submitLit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLit) return;
    const serviceId = showAddLit;
    setLoading(true);
    router.post('/lits', { ...newLit, service_id: serviceId }, {
      preserveScroll: true,
      onSuccess: page => {
        const fresh = (page.props as any).services as Service[];
        const serviceFrais = fresh.find(s => s.id === serviceId);
        if (serviceFrais) setServices(prev => prev.map(s => s.id === serviceId ? serviceFrais : s));
        setShowAddLit(null);
        setNewLit({ numero: '', chambre: '', type: 'standard', statut: 'disponible', tarif_journalier: '' });
        showToast(true, `Lit « ${newLit.numero} » ajouté.`);
      },
      onError: () => showToast(false, 'Numéro déjà utilisé ou données invalides.'),
      onFinish: () => setLoading(false),
    });
  };

  const submitNettoyage = () => {
    if (!showNettoyage) return;
    const { serviceId, lit } = showNettoyage;
    const snap = services;
    // Mise à jour immédiate
    setServices(prev => changerStatut(prev, serviceId, lit.id, 'nettoyage', true));
    setShowNettoyage(null);
    showToast(true, `Lit ${lit.numero} → en nettoyage.`);
    router.post(`/lits/${lit.id}/nettoyage`, {}, {
      preserveScroll: true,
      onError: () => { setServices(snap); showToast(false, 'Erreur. Changement annulé.'); },
    });
  };

  const submitDisponible = () => {
    if (!showDisponible) return;
    const { serviceId, lit } = showDisponible;
    const snap = services;
    setServices(prev => changerStatut(prev, serviceId, lit.id, 'disponible'));
    setShowDisponible(null);
    showToast(true, `Lit ${lit.numero} → disponible.`);
    router.post(`/lits/${lit.id}/disponible`, {}, {
      preserveScroll: true,
      onError: () => { setServices(snap); showToast(false, 'Erreur. Changement annulé.'); },
    });
  };

  const submitHorsService = () => {
    if (!showHorsService) return;
    const { serviceId, lit } = showHorsService;
    const snap = services;
    const raison = horsServiceRaison;
    setServices(prev => changerStatut(prev, serviceId, lit.id, 'horsservice'));
    setShowHorsService(null);
    setHorsServiceRaison('');
    showToast(true, `Lit ${lit.numero} → hors service.`);
    router.post(`/lits/${lit.id}/hors-service`, { raison }, {
      preserveScroll: true,
      onError: () => { setServices(snap); showToast(false, 'Erreur. Changement annulé.'); },
    });
  };

  const submitTransferer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTransferer || transferServiceId === '') return;
    const { serviceId, lit } = showTransferer;
    const dstId = transferServiceId as number;
    const dstNom = services.find(s => s.id === dstId)?.nom ?? 'service';
    const snap = services;
    setServices(prev => deplacerLit(prev, serviceId, lit.id, dstId));
    setShowTransferer(null);
    setTransferServiceId('');
    showToast(true, `Lit ${lit.numero} → ${dstNom}.`);
    router.post(`/lits/${lit.id}/transferer`, { service_destination_id: dstId }, {
      preserveScroll: true,
      onError: () => { setServices(snap); showToast(false, 'Erreur. Transfert annulé.'); },
    });
  };

  // ── Stats calculées en temps réel depuis l'état local ────────────────
  const totalCapacite    = services.reduce((a, s) => a + s.capacite, 0);
  const totalOccupes     = services.reduce((a, s) => a + s.occupes, 0);
  const totalDisponibles = services.reduce((a, s) => a + s.disponibles, 0);
  const totalNettoyage   = services.reduce((a, s) => a + s.enNettoyage, 0);
  const tauxOccupation   = totalCapacite > 0 ? Math.round((totalOccupes / totalCapacite) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout title="Lits & Occupation" subtitle="Gestion des lits et taux d'occupation par service">

      {/* Toast + flash */}
      {(toast || flash?.success || flash?.error) && (
        <div className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
          (!toast?.ok || flash?.error)
            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {(!toast?.ok || flash?.error)
            ? <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            : <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          <span>{toast?.msg ?? flash?.success ?? flash?.error}</span>
        </div>
      )}

      {/* Stats globales */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Capacité totale', value: `${totalCapacite} lits`, icon: 'M19 3H5C3.895 3 3 3.895 3 5V19C3 20.105 3.895 21 5 21H19C20.105 21 21 20.105 21 19V5C21 3.895 20.105 3 19 3ZM3 9H21M9 21V9',
            col: 'text-[#f53003]', bg: 'bg-[#fff2f2] dark:bg-[#1D0002]', vc: 'text-[#1b1b18] dark:text-[#EDEDEC]' },
          { label: 'Occupés',         value: totalOccupes,
            icon: 'M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z',
            col: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', vc: 'text-red-600 dark:text-red-400' },
          { label: 'Disponibles',     value: totalDisponibles,
            icon: 'M22 11.08V12C21.999 14.156 21.3 16.255 20.009 17.982C18.718 19.709 16.903 20.972 14.835 21.584C12.767 22.195 10.557 22.122 8.534 21.375C6.512 20.627 4.785 19.246 3.611 17.437C2.437 15.628 1.88 13.488 2.022 11.336C2.164 9.185 2.997 7.136 4.398 5.497C5.799 3.858 7.693 2.715 9.796 2.24C11.9 1.765 14.1 1.982 16.07 2.86M22 4L12 14.01L9 11.01',
            col: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', vc: 'text-green-600 dark:text-green-400' },
          { label: 'En nettoyage',    value: totalNettoyage,
            icon: 'M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12',
            col: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', vc: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Taux occupation', value: `${tauxOccupation}%`,
            icon: 'M18 20V10M12 20V4M6 20V14',
            col: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', vc: 'text-blue-600 dark:text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                <svg className={`h-5 w-5 ${s.col}`} viewBox="0 0 24 24" fill="none">
                  <path d={s.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{s.label}</p>
                <p className={`text-xl font-semibold tabular-nums transition-all duration-300 ${s.vc}`}>{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Légende */}
      <div className="mb-6 flex flex-wrap items-center gap-6 rounded-lg border border-[#e3e3e0] bg-white p-4 dark:border-[#3E3E3A] dark:bg-[#161615]">
        <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">Légende :</span>
        {Object.entries(statutConfig).map(([k, cfg]) => (
          <div key={k} className="flex items-center gap-2">
            <span className={`h-4 w-4 rounded ${cfg.dot}`}/>
            <span className="text-sm text-[#1b1b18] dark:text-[#EDEDEC]">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={() => setShowAddService(true)}
          className="flex items-center gap-2 rounded-lg bg-[#f53003] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#d42a03]">
          <PlusIcon/> Nouveau service
        </button>
        <Link href="/lits/occupations"
          className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 16.791 15.209 15 13 15H5C2.791 15 1 16.791 1 19V21M9 11C11.209 11 13 9.209 13 7C13 4.791 11.209 3 9 3C6.791 3 5 4.791 5 7C5 9.209 6.791 11 9 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Occupations
        </Link>
        <Link href="/lits/historique"
          className="flex items-center gap-2 rounded-lg border border-[#e3e3e0] bg-white px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:bg-[#161615] dark:text-[#EDEDEC]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
          Historique
        </Link>
      </div>

      {/* Grille des services */}
      <div className="grid gap-6 lg:grid-cols-2">
        {services.map(service => (
          <ServiceCard key={service.id} service={service}
            onAddLit={() => setShowAddLit(service.id)}
            onNettoyage={lit => setShowNettoyage({ serviceId: service.id, lit })}
            onDisponible={lit => setShowDisponible({ serviceId: service.id, lit })}
            onHorsService={lit => setShowHorsService({ serviceId: service.id, lit })}
            onTransferer={lit => setShowTransferer({ serviceId: service.id, lit })}
            onVoirOccupation={lit => setShowOccupation({ serviceId: service.id, lit })}
          />
        ))}
      </div>

      {/* ════ MODALS ════════════════════════════════════════════════════ */}

      {showAddService && (
        <Modal title="Nouveau service" subtitle="Ajoutez un nouveau service hospitalier" onClose={() => setShowAddService(false)}>
          <form onSubmit={submitService} className="space-y-5">
            <Field label="Nom du service *"><Input value={newService.nom}  onChange={v => setNewService(p => ({ ...p, nom: v }))}   placeholder="ex : Réanimation…" required/></Field>
            <Field label="Code (optionnel)"><Input value={newService.code} onChange={v => setNewService(p => ({ ...p, code: v }))} placeholder="ex : CARD, PNEUMO…"/></Field>
            <Field label="Étage / Localisation *"><Input value={newService.etage} onChange={v => setNewService(p => ({ ...p, etage: v }))} placeholder="ex : 2ème étage…" required/></Field>
            <Field label="Description">
              <textarea value={newService.description} onChange={e => setNewService(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"
                placeholder="Description optionnelle…"/>
            </Field>
            <ModalFooter onCancel={() => setShowAddService(false)} submitLabel="Créer le service" loading={loading}/>
          </form>
        </Modal>
      )}

      {showAddLit !== null && (
        <Modal title="Ajouter un lit" subtitle={services.find(s => s.id === showAddLit)?.nom} onClose={() => setShowAddLit(null)}>
          <form onSubmit={submitLit} className="space-y-5">
            <Field label="Numéro du lit *"><Input value={newLit.numero}  onChange={v => setNewLit(p => ({ ...p, numero: v }))}  placeholder="ex : 405A, M12…" required/></Field>
            <Field label="Chambre"><Input value={newLit.chambre} onChange={v => setNewLit(p => ({ ...p, chambre: v }))} placeholder="ex : Chambre 4…"/></Field>
            <Field label="Type de lit">
              <Select value={newLit.type} onChange={v => setNewLit(p => ({ ...p, type: v }))}>
                <option value="standard">Standard</option><option value="vip">VIP</option>
                <option value="reanimation">Réanimation</option><option value="isolement">Isolement</option>
                <option value="maternite">Maternité</option>
              </Select>
            </Field>
            <Field label="Statut initial">
              <Select value={newLit.statut} onChange={v => setNewLit(p => ({ ...p, statut: v }))}>
                <option value="disponible">Disponible</option><option value="nettoyage">En nettoyage</option>
                <option value="horsservice">Hors service</option>
              </Select>
            </Field>
            <Field label="Tarif journalier (FCFA)"><Input type="number" value={newLit.tarif_journalier} onChange={v => setNewLit(p => ({ ...p, tarif_journalier: v }))} placeholder="ex : 15000"/></Field>
            <ModalFooter onCancel={() => setShowAddLit(null)} submitLabel="Ajouter le lit" loading={loading}/>
          </form>
        </Modal>
      )}

      {showNettoyage && (
        <Modal title="Marquer en nettoyage" onClose={() => setShowNettoyage(null)}>
          <div className="space-y-6">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Le lit <strong>{showNettoyage.lit.numero}</strong> passera en nettoyage.
                {showNettoyage.lit.occupation?.patient && <span className="mt-1 block">Patient <strong>{showNettoyage.lit.occupation.patient}</strong> dissocié.</span>}
              </p>
            </div>
            <ModalFooter onCancel={() => setShowNettoyage(null)} onConfirm={submitNettoyage} submitLabel="Confirmer" submitColor="bg-yellow-600 hover:bg-yellow-700"/>
          </div>
        </Modal>
      )}

      {showDisponible && (
        <Modal title="Marquer comme disponible" onClose={() => setShowDisponible(null)}>
          <div className="space-y-6">
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
              Confirmez que le lit <strong className="text-[#1b1b18] dark:text-[#EDEDEC]">{showDisponible.lit.numero}</strong> est nettoyé et prêt ?
            </p>
            <ModalFooter onCancel={() => setShowDisponible(null)} onConfirm={submitDisponible} submitLabel="Confirmer" submitColor="bg-green-600 hover:bg-green-700"/>
          </div>
        </Modal>
      )}

      {showHorsService && (
        <Modal title="Mettre hors service" onClose={() => setShowHorsService(null)}>
          <div className="space-y-5">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">Le lit <strong>{showHorsService.lit.numero}</strong> sera mis hors service.</p>
            </div>
            <Field label="Raison (optionnelle)"><Input value={horsServiceRaison} onChange={setHorsServiceRaison} placeholder="ex : Maintenance…"/></Field>
            <ModalFooter onCancel={() => setShowHorsService(null)} onConfirm={submitHorsService} submitLabel="Mettre hors service" submitColor="bg-gray-700 hover:bg-gray-800"/>
          </div>
        </Modal>
      )}

      {showTransferer && (
        <Modal title="Transférer le lit" subtitle={`Lit ${showTransferer.lit.numero}`} onClose={() => { setShowTransferer(null); setTransferServiceId(''); }}>
          <form onSubmit={submitTransferer} className="space-y-5">
            <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">Service destination :</p>
            <Select value={String(transferServiceId)} onChange={v => setTransferServiceId(v ? Number(v) : '')}>
              <option value="">Sélectionner un service…</option>
              {services.filter(s => s.id !== showTransferer.serviceId).map(s => (
                <option key={s.id} value={s.id}>{s.nom} — {s.etage} ({s.disponibles} libres / {s.capacite})</option>
              ))}
            </Select>
            <ModalFooter onCancel={() => { setShowTransferer(null); setTransferServiceId(''); }} submitLabel="Transférer" submitColor="bg-blue-600 hover:bg-blue-700" disabled={transferServiceId === ''}/>
          </form>
        </Modal>
      )}

      {showOccupation?.lit.occupation && (
        <Modal title="Occupation actuelle" subtitle={`Lit ${showOccupation.lit.numero}`} onClose={() => setShowOccupation(null)} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Patient"    value={showOccupation.lit.occupation.patient ?? '—'}/>
              <InfoRow label="Diagnostic" value={showOccupation.lit.occupation.diagnostic ?? '—'}/>
              <InfoRow label="Entrée"     value={showOccupation.lit.occupation.date_entree ?? '—'}/>
            </div>
            <div className="flex gap-3 border-t border-[#e3e3e0] pt-4 dark:border-[#3E3E3A]">
              <Link href={`/lits/occupations/${showOccupation.lit.occupation.id}`}
                className="flex-1 rounded-lg bg-[#f53003] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#d42a03]">
                Voir le dossier
              </Link>
              <button onClick={() => setShowOccupation(null)}
                className="flex-1 rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

    </DashboardLayout>
  );
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────

interface ServiceCardProps {
  service: Service;
  onAddLit: () => void;
  onNettoyage: (l: Lit) => void;
  onDisponible: (l: Lit) => void;
  onHorsService: (l: Lit) => void;
  onTransferer: (l: Lit) => void;
  onVoirOccupation: (l: Lit) => void;
}

function ServiceCard({ service, onAddLit, onNettoyage, onDisponible, onHorsService, onTransferer, onVoirOccupation }: ServiceCardProps) {
  const taux = service.capacite > 0 ? Math.round((service.occupes / service.capacite) * 100) : 0;
  const cap  = Math.max(service.capacite, 1);

  return (
    <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
      <div className="flex items-center justify-between border-b border-[#e3e3e0] p-4 dark:border-[#3E3E3A]">
        <div>
          <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{service.nom}</h3>
          <p className="text-sm text-[#706f6c] dark:text-[#A1A09A]">{service.etage}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums text-[#1b1b18] dark:text-[#EDEDEC]">{service.occupes}/{service.capacite}</p>
            <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{taux}% occupé</p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors duration-300 ${
            service.disponibles === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : service.disponibles <= 2 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
          }`}>
            {service.disponibles}
          </div>
        </div>
      </div>

      {/* Barre animée */}
      <div className="px-4 pt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e3e3e0] dark:bg-[#3E3E3A]">
          <div className="flex h-2">
            <div className="bg-red-500    transition-[width] duration-500" style={{ width: `${(service.occupes     / cap) * 100}%` }}/>
            <div className="bg-yellow-500 transition-[width] duration-500" style={{ width: `${(service.enNettoyage / cap) * 100}%` }}/>
            <div className="bg-green-500  transition-[width] duration-500" style={{ width: `${(service.disponibles / cap) * 100}%` }}/>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {service.lits.map(lit => (
            <LitCell key={lit.id} lit={lit}
              onNettoyage={() => onNettoyage(lit)}
              onDisponible={() => onDisponible(lit)}
              onHorsService={() => onHorsService(lit)}
              onTransferer={() => onTransferer(lit)}
              onVoirOccupation={() => onVoirOccupation(lit)}
            />
          ))}
          <button onClick={onAddLit}
            className="group flex h-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e3e3e0] text-xs font-medium text-[#706f6c] transition-all hover:border-[#f53003] hover:text-[#f53003] dark:border-[#3E3E3A] dark:hover:border-[#FF4433]">
            <PlusIcon className="h-6 w-6"/><span className="mt-1">Ajouter</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#e3e3e0] px-4 py-3 dark:border-[#3E3E3A]">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#706f6c] dark:text-[#A1A09A]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"/>{service.occupes} occupés</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"/>{service.disponibles} libres</span>
          {service.enNettoyage > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"/>{service.enNettoyage} nettoyage</span>}
          {service.horsService  > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400"/>{service.horsService} hors service</span>}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/lits/service/${service.id}/chambres`} className="text-sm font-medium text-[#706f6c] hover:text-[#f53003] dark:text-[#A1A09A]">Chambres</Link>
          <Link href={`/lits/occupations?service_id=${service.id}`} className="text-sm font-medium text-[#f53003] hover:underline dark:text-[#FF4433]">Voir détails →</Link>
        </div>
      </div>
    </div>
  );
}

// ─── LitCell ──────────────────────────────────────────────────────────────────

interface LitCellProps {
  lit: Lit;
  onNettoyage: () => void;
  onDisponible: () => void;
  onHorsService: () => void;
  onTransferer: () => void;
  onVoirOccupation: () => void;
}

function LitCell({ lit, onNettoyage, onDisponible, onHorsService, onTransferer, onVoirOccupation }: LitCellProps) {
  const cfg = statutConfig[lit.statut] ?? statutConfig.horsservice;

  return (
    <div className={`group relative flex h-20 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-all duration-300 hover:scale-105 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <span className="font-semibold text-sm">{lit.numero}</span>
      <span className="text-[10px] opacity-75">{cfg.label}</span>

      {/* Menu contextuel */}
      <div className="absolute inset-0 hidden flex-col items-center justify-center gap-1 rounded-lg bg-black/50 p-1 group-hover:flex">
        {lit.statut === 'occupe' && <>
          <button onClick={onVoirOccupation} className="w-full rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white backdrop-blur hover:bg-white/30">👁 Voir patient</button>
          <button onClick={onNettoyage}      className="w-full rounded bg-yellow-600/90 px-1.5 py-0.5 text-[10px] text-white hover:bg-yellow-700">🧹 Nettoyage</button>
        </>}
        {lit.statut === 'nettoyage' &&
          <button onClick={onDisponible} className="w-full rounded bg-green-600/90 px-1.5 py-0.5 text-[10px] text-white hover:bg-green-700">✅ Disponible</button>
        }
        {lit.statut === 'disponible' && <>
          <Link href={`/lits/occupations/create?lit_id=${lit.id}`} className="w-full rounded bg-[#f53003]/90 px-1.5 py-0.5 text-center text-[10px] text-white hover:bg-[#d42a03]">+ Admettre</Link>
          <button onClick={onHorsService} className="w-full rounded bg-gray-600/90 px-1.5 py-0.5 text-[10px] text-white hover:bg-gray-700">⚠ Hors service</button>
        </>}
        {lit.statut === 'horsservice' &&
          <button onClick={onDisponible} className="w-full rounded bg-blue-600/90 px-1.5 py-0.5 text-[10px] text-white hover:bg-blue-700">🔄 Réactiver</button>
        }
        <button onClick={onTransferer} className="w-full rounded bg-blue-600/90 px-1.5 py-0.5 text-[10px] text-white hover:bg-blue-700">↗ Transférer</button>
      </div>

      {/* Tooltip patient */}
      {lit.occupation?.patient && (
        <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden w-52 -translate-x-1/2 rounded-lg border border-[#e3e3e0] bg-white p-3 shadow-xl group-hover:block dark:border-[#3E3E3A] dark:bg-[#1C1C1A]">
          <p className="truncate font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{lit.occupation.patient}</p>
          <p className="mt-0.5 truncate text-xs text-[#706f6c] dark:text-[#A1A09A]">{lit.occupation.diagnostic}</p>
          <p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">Depuis : {lit.occupation.date_entree}</p>
        </div>
      )}
    </div>
  );
}

// ─── UI Primitives ────────────────────────────────────────────────────────────

function Modal({ title, subtitle, children, onClose, size = 'md' }: {
  title: string; subtitle?: string; children: React.ReactNode; onClose: () => void; size?: 'md' | 'lg';
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full rounded-xl bg-white shadow-2xl dark:bg-[#161615] ${size === 'lg' ? 'max-w-xl' : 'max-w-md'}`}>
        <div className="flex items-start justify-between border-b border-[#e3e3e0] p-6 dark:border-[#3E3E3A]">
          <div>
            <h2 className="text-lg font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="ml-4 rounded-lg p-1 text-[#706f6c] hover:bg-[#f5f5f3] dark:hover:bg-[#3E3E3A]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{label}</label>{children}</div>;
}

function Input({ value, onChange, placeholder, required, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]"/>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#e3e3e0] px-4 py-2.5 text-sm focus:border-[#f53003] focus:outline-none focus:ring-1 focus:ring-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
      {children}
    </select>
  );
}

function ModalFooter({ onCancel, onConfirm, submitLabel, submitColor = 'bg-[#f53003] hover:bg-[#d42a03]', disabled = false, loading = false }: {
  onCancel: () => void; onConfirm?: () => void; submitLabel: string; submitColor?: string; disabled?: boolean; loading?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel}
        className="rounded-lg border border-[#e3e3e0] px-5 py-2.5 text-sm font-medium text-[#1b1b18] hover:bg-[#f5f5f3] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:bg-[#1C1C1A]">
        Annuler
      </button>
      <button type={onConfirm ? 'button' : 'submit'} onClick={onConfirm} disabled={disabled || loading}
        className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${submitColor}`}>
        {loading && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>}
        {submitLabel}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-[#706f6c] dark:text-[#A1A09A]">{label}</p><p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">{value}</p></div>;
}

function PlusIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}