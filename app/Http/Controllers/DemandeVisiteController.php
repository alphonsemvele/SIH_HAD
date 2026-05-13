<?php

namespace App\Http\Controllers;

use App\Models\DemandeVisite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class DemandeVisiteController extends Controller
{
    /**
     * GET /api/demandes-visite?statut=en_attente|acceptees|terminees
     */
    public function index(Request $request)
    {
        $query = DemandeVisite::with('assignedTo:id,name');

        // Filtre par statut groupé
        if ($request->statut === 'en_attente') {
            $query->enAttente();
        } elseif ($request->statut === 'acceptees') {
            $query->acceptees();
        } elseif ($request->statut === 'terminees') {
            $query->terminees();
        } elseif ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par urgence
        if ($request->filled('urgence')) {
            $query->where('urgence', $request->urgence);
        }

        // Filtre "mes demandes"
        if ($request->boolean('mes_demandes')) {
            $query->where('assigned_to', $request->user()->id);
        }

        $demandes = $query->latest()->get()->map(fn ($d) => $this->formatDemande($d));

        $stats = [
            'total'      => DemandeVisite::count(),
            'en_attente' => DemandeVisite::enAttente()->count(),
            'acceptees'  => DemandeVisite::acceptees()->count(),
            'terminees'  => DemandeVisite::terminees()->count(),
            'critiques'  => DemandeVisite::enAttente()->critiques()->count(),
        ];

        return response()->json([
            'demandes' => $demandes,
            'stats'    => $stats,
        ]);
    }

    /**
     * POST /api/demandes-visite
     * Création d'une demande (par patient ou famille).
     * Pas besoin d'être authentifié (le patient peut être anonyme).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_nom'        => 'required|string|max:255',
            'patient_telephone'  => 'required|string|max:20',
            'patient_age'        => 'nullable|integer|min:0|max:150',
            'adresse'            => 'required|string',
            'quartier'           => 'nullable|string|max:100',
            'ville'              => 'nullable|string|max:100',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'symptomes'          => 'required|string',
            'duree_symptomes'    => 'nullable|string|max:50',
            'urgence'            => ['nullable', Rule::in(DemandeVisite::URGENCES)],
            'type'               => ['nullable', Rule::in(DemandeVisite::TYPES)],
            'demandeur_nom'      => 'nullable|string|max:255',
            'demandeur_relation' => 'nullable|string|max:50',
            'date_souhaitee'     => 'nullable|date',
            'heure_souhaitee'    => 'nullable|date_format:H:i',
        ]);

        $demande = DemandeVisite::create(array_merge($validated, [
            'urgence' => $validated['urgence'] ?? 'moyenne',
            'type'    => $validated['type'] ?? 'visite',
            'statut'  => 'en_attente',
        ]));

        Log::info('Nouvelle demande de visite', [
            'demande_id' => $demande->id,
            'patient'    => $demande->patient_nom,
            'urgence'    => $demande->urgence,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande créée avec succès',
            'data'    => $this->formatDemande($demande),
        ], 201);
    }

    /**
     * GET /api/demandes-visite/{id}
     */
    public function show(Request $request, $id)
    {
        $demande = DemandeVisite::with('assignedTo:id,name')->find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande introuvable'], 404);
        }
        return response()->json(['data' => $this->formatDemande($demande)]);
    }

    /**
     * POST /api/demandes-visite/{id}/accepter
     */
    public function accepter(Request $request, $id): JsonResponse
    {
        $demande = DemandeVisite::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande introuvable'], 404);
        }

        if ($demande->statut !== 'en_attente') {
            return response()->json([
                'error' => "Demande déjà en statut: {$demande->statut_libelle}",
            ], 422);
        }

        $validated = $request->validate([
            'date_visite'    => 'nullable|date',
            'heure_visite'   => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        $demande->update([
            'statut'          => 'acceptee',
            'assigned_to'     => $request->user()->id,
            'notes_infirmier' => $validated['notes'] ?? null,
        ]);

        Log::info('Demande acceptée', [
            'demande_id' => $demande->id,
            'soignant'   => $request->user()->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande acceptée',
            'data'    => $this->formatDemande($demande->fresh()),
        ]);
    }

    /**
     * POST /api/demandes-visite/{id}/refuser
     */
    public function refuser(Request $request, $id): JsonResponse
    {
        $demande = DemandeVisite::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande introuvable'], 404);
        }

        $validated = $request->validate([
            'raison' => 'required|string|max:500',
        ]);

        $demande->update([
            'statut'        => 'refusee',
            'raison_refus'  => $validated['raison'],
            'assigned_to'   => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande refusée',
            'data'    => $this->formatDemande($demande->fresh()),
        ]);
    }

    /**
     * POST /api/demandes-visite/{id}/terminer
     */
    public function terminer(Request $request, $id): JsonResponse
    {
        $demande = DemandeVisite::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande introuvable'], 404);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $demande->update([
            'statut'          => 'terminee',
            'notes_infirmier' => $validated['notes'] ?? $demande->notes_infirmier,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande terminée',
            'data'    => $this->formatDemande($demande->fresh()),
        ]);
    }

    /**
     * DELETE /api/demandes-visite/{id}
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $demande = DemandeVisite::find($id);
        if (!$demande) {
            return response()->json(['error' => 'Demande introuvable'], 404);
        }
        $demande->delete();
        return response()->json(['success' => true, 'message' => 'Demande supprimée']);
    }

    /**
     * Format une demande pour le JSON de sortie.
     */
    private function formatDemande(DemandeVisite $d): array
    {
        return [
            'id'                  => $d->id,
            'patient_nom'         => $d->patient_nom,
            'patient_telephone'   => $d->patient_telephone,
            'patient_age'         => $d->patient_age,
            'adresse'             => $d->adresse,
            'quartier'            => $d->quartier,
            'ville'               => $d->ville,
            'latitude'            => $d->latitude ? (float) $d->latitude : null,
            'longitude'           => $d->longitude ? (float) $d->longitude : null,
            'symptomes'           => $d->symptomes,
            'duree_symptomes'     => $d->duree_symptomes,
            'urgence'             => $d->urgence,
            'urgence_libelle'     => $d->urgence_libelle,
            'type'                => $d->type,
            'type_libelle'        => $d->type_libelle,
            'statut'              => $d->statut,
            'statut_libelle'      => $d->statut_libelle,
            'demandeur_nom'       => $d->demandeur_nom,
            'demandeur_relation'  => $d->demandeur_relation,
            'assigned_to'         => $d->assignedTo ? [
                'id'   => $d->assignedTo->id,
                'name' => $d->assignedTo->name,
            ] : null,
            'visite_id'           => $d->visite_id,
            'notes_infirmier'     => $d->notes_infirmier,
            'raison_refus'        => $d->raison_refus,
            'date_souhaitee'      => $d->date_souhaitee?->toDateString(),
            'heure_souhaitee'     => $d->heure_souhaitee,
            'created_at'          => $d->created_at?->toIso8601String(),
            'updated_at'          => $d->updated_at?->toIso8601String(),
        ];
    }
}
