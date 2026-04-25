<?php

namespace App\Http\Controllers;

use App\Http\Requests\LitStoreRequest;
use App\Http\Requests\LitUpdateRequest;
use App\Http\Resources\LitResource;
use App\Models\HistoriqueLit;
use App\Models\Lit;
use App\Models\OccupationRoom;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LitController extends Controller
{
    // ── Page principale : vue d'ensemble services + lits ─────────────

    public function index()
    {
        $services = Service::actif()
            ->with([
                'lits' => fn ($q) => $q->with([
                    'occupationActive.patient:id,nom,prenom',
                ]),
            ])
            ->get()
            ->map(fn (Service $s) => [
                'id'          => $s->id,
                'nom'         => $s->nom,
                'etage'       => $s->etage,
                'capacite'    => $s->lits->count(),
                'occupes'     => $s->lits->where('statut', 'occupe')->count(),
                'disponibles' => $s->lits->where('statut', 'disponible')->count(),
                'enNettoyage' => $s->lits->where('statut', 'nettoyage')->count(),
                'horsService' => $s->lits->where('statut', 'hors-service')->count(),
                'lits'        => $s->lits->map(fn (Lit $l) => [
                    'id'         => $l->id,
                    'numero'     => $l->numero,
                    'chambre'    => $l->chambre,
                    'type'       => $l->type,
                    'statut'     => $l->statut,
                    'occupation' => $l->occupationActive ? [
                        'id'         => $l->occupationActive->id,
                        'patient'    => $l->occupationActive->patient
                            ? $l->occupationActive->patient->nom . ' ' . $l->occupationActive->patient->prenom
                            : null,
                        'diagnostic' => $l->occupationActive->diagnostic_principal,
                        'date_entree' => $l->occupationActive->date_entree?->format('d/m/Y'),
                    ] : null,
                ]),
            ]);

        // Stats globales
        $totalCapacite    = $services->sum('capacite');
        $totalOccupes     = $services->sum('occupes');
        $totalDisponibles = $services->sum('disponibles');
        $totalNettoyage   = $services->sum('enNettoyage');
        $tauxOccupation   = $totalCapacite > 0
            ? round(($totalOccupes / $totalCapacite) * 100)
            : 0;

        return Inertia::render('dashboard/lits', [
            'services'         => $services,
            'stats'            => compact(
                'totalCapacite',
                'totalOccupes',
                'totalDisponibles',
                'totalNettoyage',
                'tauxOccupation'
            ),
        ]);
    }

    // ── Créer un lit ─────────────────────────────────────────────────

    public function store(LitStoreRequest $request): RedirectResponse
    {
        $lit = Lit::create($request->validated());

        HistoriqueLit::create([
            'lit_id'        => $lit->id,
            'service_id'    => $lit->service_id,
            'user_id'       => auth()->id(),
            'nouveau_statut' => $lit->statut,
            'action'        => 'creation',
            'commentaire'   => "Création du lit {$lit->numero}",
        ]);

        return back()->with('success', "Lit {$lit->numero} créé avec succès.");
    }

    // ── Détail d'un lit (historique des occupations) ──────────────────

    public function show(Lit $lit): Response
    {
        $lit->load([
            'service:id,nom,etage',
            'occupationActive.patient:id,nom,prenom,date_naissance',
            'occupationActive.medecin:id,name',
            'occupations.patient:id,nom,prenom',
            'occupations.medecin:id,name',
            'historique.user:id,name',
        ]);

        return Inertia::render('dashboard/occupation-show', [
            'lit'       => new LitResource($lit),
            'occupations' => $lit->occupations->map(fn (OccupationRoom $o) => [
                'id'           => $o->id,
                'statut'       => $o->statut,
                'patient'      => $o->patient
                    ? ['id' => $o->patient->id, 'nom' => $o->patient->nom . ' ' . $o->patient->prenom]
                    : null,
                'medecin'      => $o->medecin?->name,
                'diagnostic'   => $o->diagnostic_principal,
                'date_entree'  => $o->date_entree->format('d/m/Y H:i'),
                'date_sortie'  => $o->date_sortie?->format('d/m/Y H:i'),
                'duree_jours'  => $o->duree_sejour,
                'motif_sortie' => $o->motif_sortie,
                'cout_sejour'  => $o->cout_sejour,
            ]),
        ]);
    }

    // ── Modifier un lit ──────────────────────────────────────────────

    public function update(LitUpdateRequest $request, Lit $lit): RedirectResponse
    {
        $lit->update($request->validated());

        return back()->with('success', "Lit {$lit->numero} mis à jour.");
    }

    // ── Supprimer un lit ─────────────────────────────────────────────

    public function destroy(Lit $lit): RedirectResponse
    {
        if ($lit->statut === 'occupe') {
            return back()->with('error', 'Impossible de supprimer un lit occupé.');
        }

        $lit->delete();

        return back()->with('success', "Lit {$lit->numero} supprimé.");
    }

    // ── Marquer un lit en nettoyage ───────────────────────────────────

    public function marquerNettoyage(Request $request, Lit $lit): RedirectResponse
    {
        $occupation = $lit->occupationActive;

        if ($occupation) {
            $occupation->marquerNettoyage(auth()->id());
        } else {
            $ancienStatut = $lit->statut;
            $lit->update(['statut' => 'nettoyage']);

            HistoriqueLit::create([
                'lit_id'        => $lit->id,
                'service_id'    => $lit->service_id,
                'user_id'       => auth()->id(),
                'ancien_statut' => $ancienStatut,
                'nouveau_statut' => 'nettoyage',
                'action'        => 'nettoyage_debut',
                'commentaire'   => $request->commentaire ?? 'Marqué en nettoyage',
            ]);
        }

        return back()->with('success', "Lit {$lit->numero} marqué en nettoyage.");
    }

    // ── Marquer un lit comme disponible (nettoyage terminé) ───────────

    public function marquerDisponible(Request $request, Lit $lit): RedirectResponse
    {
        $lit->marquerDisponible(auth()->id());

        return back()->with('success', "Lit {$lit->numero} disponible.");
    }

    // ── Mettre hors service ──────────────────────────────────────────

    public function horsService(Request $request, Lit $lit): RedirectResponse
    {
        $request->validate(['raison' => 'nullable|string|max:255']);

        $lit->mettreHorsService($request->raison, auth()->id());

        return back()->with('success', "Lit {$lit->numero} mis hors service.");
    }

    // ── Transférer le lit vers un autre service ───────────────────────

    public function transfererLit(Request $request, Lit $lit): RedirectResponse
    {
        $request->validate([
            'service_destination_id' => 'required|exists:services,id|different:' . $lit->service_id,
            'commentaire'            => 'nullable|string|max:255',
        ]);

        $ancienServiceId = $lit->service_id;
        $lit->update(['service_id' => $request->service_destination_id]);

        HistoriqueLit::create([
            'lit_id'                 => $lit->id,
            'service_id'             => $request->service_destination_id,
            'user_id'                => auth()->id(),
            'ancien_statut'          => $lit->statut,
            'nouveau_statut'         => $lit->statut,
            'action'                 => 'transfert_source',
            'service_source_id'      => $ancienServiceId,
            'service_destination_id' => $request->service_destination_id,
            'commentaire'            => $request->commentaire ?? 'Transfert de lit entre services',
        ]);

        return back()->with('success', "Lit {$lit->numero} transféré.");
    }

    // ── Historique global des lits ───────────────────────────────────

    public function historique(Request $request): Response
    {
        $historique = HistoriqueLit::with([
            'lit:id,numero',
            'service:id,nom',
            'user:id,name',
            'occupation.patient:id,nom,prenom',
        ])
            ->when($request->service_id, fn ($q) => $q->where('service_id', $request->service_id))
            ->when($request->action,     fn ($q) => $q->where('action', $request->action))
            ->orderByDesc('effectue_le')
            ->paginate(50);

        return Inertia::render('dashboard/historique', [
            'historique' => $historique,
            'services'   => Service::actif()->select('id', 'nom')->get(),
            'filters'    => $request->only(['service_id', 'action']),
        ]);
    }
}