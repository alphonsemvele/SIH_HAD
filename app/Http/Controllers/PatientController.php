<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientStoreRequest;
use App\Http\Requests\PatientUpdateRequest;
use App\Models\Patient;
use App\Models\DossierMedical;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Patient::query();

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('prenom', 'like', "%{$search}%")
                  ->orWhere('numero_dossier', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
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

        $patients = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('dashboard/patients', [
            'patients' => $patients,
            'stats' => $stats,
            'filters' => $request->only(['search', 'statut', 'service']),
            'statuts' => Patient::getStatuts(),
        ]);
    }

    public function store(PatientStoreRequest $request): RedirectResponse
    {
        // Générer un numéro de dossier unique
        $numeroDossier = 'PAT-' . date('Y') . '-' . str_pad(Patient::count() + 1, 5, '0', STR_PAD_LEFT);

        $data = $request->validated();
        
        // Convertir les allergies en array si c'est une string
        if (isset($data['allergies']) && is_string($data['allergies'])) {
            $data['allergies'] = array_map('trim', explode(',', $data['allergies']));
        }

        $patient = Patient::create([
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
            'statut' => 'Actif',
        ]);

        return redirect()->route('patients.index')
            ->with('success', 'Patient créé avec succès.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['admissions', 'consultations', 'prescriptions', 'assurance', 'dossierMedical']);

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

    public function update(PatientUpdateRequest $request, Patient $patient): RedirectResponse
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

        return redirect()->route('patients.index')
            ->with('success', 'Patient mis à jour avec succès.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $patient->delete();

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
}