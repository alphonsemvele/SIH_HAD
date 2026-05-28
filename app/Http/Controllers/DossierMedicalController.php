<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DossierMedicalController extends Controller
{
    public function index(Request $request)
    {
        $query = DossierMedical::with(['patient', 'entrees' => function ($q) {
            $q->latest('date_entree')->limit(1);
        }])
        ->withCount('entrees');

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_dossier_medical', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q) use ($search) {
                      $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('numero_dossier', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par statut
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // Stats
        $stats = [
            'total' => DossierMedical::count(),
            'actifs' => DossierMedical::where('statut', 'actif')->count(),
            'archives' => DossierMedical::where('statut', 'archive')->count(),
            'mis_a_jour_aujourdhui' => DossierMedical::whereDate('updated_at', today())->count(),
        ];

        $dossiers = $query->latest()->paginate(10)->withQueryString();

        // Transformer pour ajouter derniere_entree
        $dossiers->getCollection()->transform(function ($dossier) {
            $dossier->derniere_entree = $dossier->entrees->first();
            unset($dossier->entrees);
            return $dossier;
        });

        // Patients sans dossier (normalement tous en ont un, mais au cas où)
        $patients = Patient::select('id', 'numero_dossier', 'nom', 'prenom', 'sexe', 'date_naissance', 'telephone')
            ->orderBy('nom')
            ->get();

        // Liste des médecins
        $medecins = User::where('fonction', 'medecin')
            ->orWhere('fonction', 'admin')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('dashboard/dossiers', [
            'dossiers' => $dossiers,
            'stats' => $stats,
            'patients' => $patients,
            'medecins' => $medecins,
            'filters' => $request->only(['search', 'statut', 'medecin_id']),
        ]);
    }

    public function show(Patient $patient)
    {
        $dossier = $patient->dossierMedical;

        if (!$dossier) {
            $dossier = $patient->getOrCreateDossierMedical();
        }

        $dossier->load(['patient', 'entrees' => function ($query) {
            $query->with('medecin')->orderBy('date_entree', 'desc');
        }]);

        return Inertia::render('dashboard/dossiers/show', [
            'patient' => $patient,
            'dossier' => $dossier,
        ]);
    }

    public function update(Request $request, DossierMedical $dossier)
    {
        $validated = $request->validate([
            'groupe_sanguin' => 'nullable|string|max:10',
            'allergies_confirmees' => 'nullable|array',
            'antecedents_medicaux' => 'nullable|array',
            'maladies_chroniques' => 'nullable|array',
            'notes_generales' => 'nullable|string',
            'statut' => 'nullable|in:actif,inactif,archive,transfere',
        ]);

        $dossier->update($validated);

        return back()->with('success', 'Dossier médical mis à jour.');
    }
}