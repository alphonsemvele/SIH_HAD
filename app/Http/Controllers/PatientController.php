<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientStoreRequest;
use App\Http\Requests\PatientUpdateRequest;
use App\Models\Patient;
use App\Models\DossierMedical;
use App\Services\Patient\PatientCreationService;
use App\Services\Patient\PatientSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function __construct(
        private PatientCreationService $patientCreationService,
        private PatientSearchService $patientSearchService
    ) {}

    public function index(Request $request)
    {
        // Utiliser le service de recherche
        $patients = $this->patientSearchService->search(
            $request->search ?? '',
            $request->get('per_page', 10)
        );

        // Appliquer les filtres supplémentaires
        $query = Patient::query();
        
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par service (si vous avez une relation service)
        if ($request->filled('service')) {
            $query->where('service_id', $request->service);
        }

        // Statistiques
        $stats = [
            'total' => Patient::count(),
            'hospitalises' => Patient::where('statut', Patient::STATUT_HOSPITALISE)->count(),
            'consultations' => Patient::where('statut', Patient::STATUT_CONSULTATION)->count(),
            'urgences' => Patient::where('statut', Patient::STATUT_URGENCE)->count(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'patients' => $patients,
                'stats' => $stats,
                'statuts' => Patient::getStatuts(),
            ]);
        }
        
        // Sinon (navigateur web) → Inertia
        return Inertia::render('dashboard/patients', [
            'patients' => $patients,
            'stats' => $stats,
            'filters' => $request->only(['search', 'statut', 'service']),
            'statuts' => Patient::getStatuts(),
        ]);
    }

    public function store(PatientStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        
        // Générer un numéro de dossier unique
        $numeroDossier = 'PAT-' . date('Y') . '-' . str_pad(Patient::count() + 1, 5, '0', STR_PAD_LEFT);
        
        // Convertir les allergies en array si c'est une string
        if (isset($data['allergies']) && is_string($data['allergies'])) {
            $data['allergies'] = array_map('trim', explode(',', $data['allergies']));
        }

        // Utiliser le service de création
        $patient = $this->patientCreationService->create([
            ...$data,
            'numero_dossier' => $numeroDossier,
            'statut' => $data['statut'] ?? Patient::STATUT_CONSULTATION,
        ]);

        // Créer automatiquement le dossier médical
        DossierMedical::create([
            'patient_id' => $patient->id,
            'numero_dossier_medical' => DossierMedical::generateNumeroDossier(),
            'date_ouverture' => now(),
            'groupe_sanguin' => $patient->groupe_sanguin,
            'allergies_confirmees' => $patient->allergies,
            'antecedents_medicaux' => $patient->antecedents_medicaux,
            'statut' => 'actif',
        ]);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Patient créé avec succès',
                'data' => $patient->load(['dossierMedical'])
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->route('patients.index')
            ->with('success', 'Patient créé avec succès.');
    }

    public function show(Patient $patient)
    {
        // load() retiré : relations 'admissions','consultations','prescriptions','insurance','dossierMedical' non implémentées

        // Si la requête vient de l'API mobile → JSON
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'patient' => $patient,
                'statuts' => Patient::getStatuts(),
            ]);
        }

        return Inertia::render('dashboard/patients/show', [
            'patient' => $patient,
            'statuts' => Patient::getStatuts(),
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('dashboard/patients/edit', [
            'patient' => $patient,
            'statuts' => Patient::getStatuts(),
        ]);
    }

    public function update(PatientUpdateRequest $request, Patient $patient): JsonResponse
    {
        $data = $request->validated();
        
        // Convertir les allergies en array si c'est une string
        if (isset($data['allergies']) && is_string($data['allergies'])) {
            $data['allergies'] = array_map('trim', explode(',', $data['allergies']));
        }

        $patient->update($data);

        // Synchroniser avec le dossier médical si existant
        if ($patient->dossierMedical) {
            $patient->dossierMedical->update([
                'groupe_sanguin' => $patient->groupe_sanguin,
                'allergies_confirmees' => $patient->allergies,
            ]);
        }

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Patient mis à jour avec succès',
                'data' => $patient->load(['dossierMedical'])
            ], 200);
        }
        
        // Pour Web: retourner redirect
        return redirect()->route('patients.index')
            ->with('success', 'Patient mis à jour avec succès.');
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        // Pour API: retourner JSON
        if (request()->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Patient supprimé avec succès',
            ], 200);
        }
        
        // Pour Web: retourner redirect
        return redirect()->route('patients.index')
            ->with('success', 'Patient supprimé avec succès.');
    }

    // Méthode pour changer rapidement le statut
    public function updateStatut(Request $request, Patient $patient): RedirectResponse
    {
        $request->validate([
            'statut' => ['required', 'in:' . implode(',', Patient::getStatuts())],
        ]);

        $patient->update(['statut' => $request->statut]);

        return redirect()->back()
            ->with('success', 'Statut mis à jour avec succès.');
    }

    /**
     * GET /api/patients/{patient}/dossier-medical
     * Retourne le dossier médical du patient pour le mobile.
     */
    public function dossierMedical(Patient $patient)
    {
        return response()->json([
            'patient_id' => $patient->id,
            'nom' => $patient->nom,
            'prenom' => $patient->prenom,
            'date_naissance' => $patient->date_naissance?->toDateString(),
            'antecedents' => $patient->antecedents ?? [],
            'allergies' => $patient->allergies ?? [],
            'traitements_en_cours' => $patient->traitements_en_cours ?? [],
            'message' => 'Dossier médical de base. Implémentation complète à venir.',
        ]);
    }

}