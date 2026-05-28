<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Models\DemandeVisite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PatientDemandeVisiteController extends Controller
{
    /** Urgences autorisées côté patient (sans 'critique' réservé au tri soignant) */
    private const URGENCES_PATIENT = ['faible', 'moyenne', 'urgente'];

    /**
     * POST /api/patient/demandes-visite
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->patient_id) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun dossier patient associé à ce compte',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'symptomes'       => 'required|string|min:5|max:2000',
            'urgence'         => 'nullable|string|in:'.implode(',', self::URGENCES_PATIENT),
            'date_souhaitee'  => 'nullable|date|after_or_equal:today',
            'heure_souhaitee' => 'nullable|date_format:H:i',
            'duree_symptomes' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Pré-remplir les infos du patient depuis sa fiche
        $patient = DB::table('patients')->where('id', $user->patient_id)->first();
        if (! $patient) {
            return response()->json([
                'success' => false,
                'message' => 'Fiche patient introuvable',
            ], 404);
        }

        $data = $validator->validated();

        $demande = DemandeVisite::create([
            'patient_id'        => $patient->id,
            'patient_nom'       => trim(($patient->prenom ?? '').' '.($patient->nom ?? '')),
            'patient_telephone' => $patient->telephone ?? '—',
            'patient_age'       => $patient->date_naissance
                ? \Carbon\Carbon::parse($patient->date_naissance)->age
                : null,
            'adresse'           => $patient->adresse ?? '—',
            'quartier'          => $patient->quartier,
            'ville'             => $patient->ville ?? 'Yaoundé',
            'latitude'          => $patient->latitude ?? null,
            'longitude'         => $patient->longitude ?? null,
            'symptomes'         => $data['symptomes'],
            'duree_symptomes'   => $data['duree_symptomes'] ?? null,
            'urgence'           => $data['urgence'] ?? 'moyenne',
            'type'              => 'visite',
            'statut'            => 'en_attente',
            'demandeur_nom'     => $user->name,
            'demandeur_relation'=> 'patient',
            'date_souhaitee'    => $data['date_souhaitee'] ?? null,
            'heure_souhaitee'   => $data['heure_souhaitee'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande envoyée — un soignant va la traiter',
            'data'    => $this->format($demande),
        ], 201);
    }

    /**
     * GET /api/patient/demandes-visite
     * Liste des demandes du patient connecté (la plus récente en tête).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->patient_id) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $demandes = DemandeVisite::with('assignedTo:id,name')
            ->where('patient_id', $user->patient_id)
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($d) => $this->format($d));

        return response()->json([
            'success' => true,
            'data'    => $demandes,
        ]);
    }

    /**
     * GET /api/patient/demandes-visite/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $demande = DemandeVisite::with('assignedTo:id,name')->find($id);

        if (! $demande || $demande->patient_id !== $user->patient_id) {
            return response()->json([
                'success' => false,
                'message' => 'Demande introuvable',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $this->format($demande),
        ]);
    }

    private function format(DemandeVisite $d): array
    {
        return [
            'id'               => $d->id,
            'symptomes'        => $d->symptomes,
            'duree_symptomes'  => $d->duree_symptomes,
            'urgence'          => $d->urgence,
            'urgence_libelle'  => $d->urgence_libelle ?? ucfirst($d->urgence),
            'statut'           => $d->statut,
            'statut_libelle'   => $d->statut_libelle ?? ucfirst(str_replace('_', ' ', $d->statut)),
            'date_souhaitee'   => $d->date_souhaitee?->toDateString(),
            'heure_souhaitee'  => $d->heure_souhaitee,
            'notes_infirmier'  => $d->notes_infirmier,
            'raison_refus'     => $d->raison_refus,
            'soignant'         => $d->assignedTo ? [
                'id'   => $d->assignedTo->id,
                'name' => $d->assignedTo->name,
            ] : null,
            'created_at'       => $d->created_at?->toIso8601String(),
            'updated_at'       => $d->updated_at?->toIso8601String(),
        ];
    }
}
