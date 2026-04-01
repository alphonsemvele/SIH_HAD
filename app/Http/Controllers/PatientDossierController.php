<?php

namespace App\Http\Controllers;

use App\Models\DossierMedical;
use App\Models\Patient;
use App\Models\PatientDossier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientDossierController extends Controller
{
    /**
     * Liste de toutes les visites (avec filtres)
     */
    public function index(Request $request)
    {
        $query = PatientDossier::with(['dossierMedical.patient', 'medecin', 'consultation'])
            ->orderBy('date_entree', 'desc');

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('motif', 'like', "%{$search}%")
                  ->orWhere('diagnostic', 'like', "%{$search}%")
                  ->orWhereHas('dossierMedical.patient', function ($q) use ($search) {
                      $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('numero_dossier', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_entree', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_entree', '<=', $request->date_fin);
        }

        if ($request->filled('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }

        $visites = $query->paginate(20)->withQueryString();

        // Stats du jour
        $stats = [
            'total_aujourdhui' => PatientDossier::whereDate('date_entree', today())->count(),
            'en_cours' => PatientDossier::where('statut', 'En cours')->count(),
            'urgences' => PatientDossier::where('type', 'Urgence')
                ->orWhereIn('niveau_urgence', ['Urgent', 'Très urgent', 'Critique'])
                ->where('statut', 'En cours')
                ->count(),
            'terminees_aujourdhui' => PatientDossier::whereDate('date_sortie', today())
                ->where('statut', 'Terminé')
                ->count(),
        ];

        return Inertia::render('PatientDossiers/Index', [
            'visites' => $visites,
            'stats' => $stats,
            'types' => PatientDossier::TYPES,
            'statuts' => PatientDossier::STATUTS,
            'filters' => $request->only(['search', 'type', 'statut', 'date_debut', 'date_fin', 'medecin_id']),
        ]);
    }

    /**
     * Créer une nouvelle visite/entrée
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'medecin_id' => 'nullable|exists:users,id',
            'type' => 'required|in:' . implode(',', PatientDossier::TYPES),
            'date_entree' => 'nullable|date',
            'motif' => 'nullable|string',
            'symptomes' => 'nullable|string',
            'niveau_urgence' => 'nullable|in:' . implode(',', PatientDossier::NIVEAUX_URGENCE),
            'notes_medecin' => 'nullable|string',
        ]);

        // Récupérer le patient et son dossier médical
        $patient = Patient::findOrFail($validated['patient_id']);
        $dossier = $patient->getOrCreateDossierMedical();

        // Créer la visite
        $visite = $dossier->entrees()->create([
            'consultation_id' => $validated['consultation_id'] ?? null,
            'medecin_id' => $validated['medecin_id'] ?? auth()->id(),
            'reference' => PatientDossier::generateReference($validated['type']),
            'type' => $validated['type'],
            'date_entree' => $validated['date_entree'] ?? now(),
            'motif' => $validated['motif'] ?? null,
            'symptomes' => $validated['symptomes'] ?? null,
            'niveau_urgence' => $validated['niveau_urgence'] ?? 'Normal',
            'notes_medecin' => $validated['notes_medecin'] ?? null,
            'statut' => 'En cours',
        ]);

        return back()->with('success', 'Visite créée avec succès. Référence: ' . $visite->reference);
    }

    /**
     * Afficher une visite
     */
    public function show(PatientDossier $patientDossier)
    {
        $patientDossier->load([
            'dossierMedical.patient',
            'medecin',
            'consultation',
        ]);

        // Historique des visites du même patient
        $historique = PatientDossier::where('dossier_medical_id', $patientDossier->dossier_medical_id)
            ->where('id', '!=', $patientDossier->id)
            ->orderBy('date_entree', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('PatientDossiers/Show', [
            'visite' => $patientDossier,
            'historique' => $historique,
            'types' => PatientDossier::TYPES,
            'statuts' => PatientDossier::STATUTS,
            'niveaux_urgence' => PatientDossier::NIVEAUX_URGENCE,
            'statuts_paiement' => PatientDossier::STATUTS_PAIEMENT,
        ]);
    }

    /**
     * Mettre à jour une visite
     */
    public function update(Request $request, PatientDossier $patientDossier)
    {
        $validated = $request->validate([
            'medecin_id' => 'nullable|exists:users,id',
            'type' => 'sometimes|in:' . implode(',', PatientDossier::TYPES),
            'motif' => 'nullable|string',
            'symptomes' => 'nullable|string',
            'examen_clinique' => 'nullable|string',
            'diagnostic' => 'nullable|string',
            'diagnostic_secondaire' => 'nullable|string',
            'constantes_vitales' => 'nullable|array',
            'prescriptions' => 'nullable|array',
            'examens_demandes' => 'nullable|array',
            'resultats_examens' => 'nullable|array',
            'actes_medicaux' => 'nullable|array',
            'traitement_administre' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'date_prochain_rdv' => 'nullable|date',
            'notes_medecin' => 'nullable|string',
            'notes_infirmier' => 'nullable|string',
            'montant_total' => 'nullable|numeric|min:0',
            'statut_paiement' => 'nullable|in:' . implode(',', PatientDossier::STATUTS_PAIEMENT),
            'statut' => 'nullable|in:' . implode(',', PatientDossier::STATUTS),
            'niveau_urgence' => 'nullable|in:' . implode(',', PatientDossier::NIVEAUX_URGENCE),
        ]);

        // Si le statut passe à Terminé, ajouter la date de sortie
        if (isset($validated['statut']) && $validated['statut'] === 'Terminé' && !$patientDossier->date_sortie) {
            $validated['date_sortie'] = now();
        }

        $patientDossier->update($validated);

        return back()->with('success', 'Visite mise à jour avec succès.');
    }

    /**
     * Terminer une visite
     */
    public function terminer(PatientDossier $patientDossier)
    {
        $patientDossier->update([
            'statut' => 'Terminé',
            'date_sortie' => now(),
        ]);

        return back()->with('success', 'Visite terminée avec succès.');
    }

    /**
     * Ajouter une prescription
     */
    public function ajouterPrescription(Request $request, PatientDossier $patientDossier)
    {
        $validated = $request->validate([
            'medicament' => 'required|string',
            'dosage' => 'required|string',
            'frequence' => 'required|string',
            'duree' => 'required|string',
            'voie' => 'nullable|string',
            'instructions' => 'nullable|string',
        ]);

        $patientDossier->ajouterPrescription($validated);

        return back()->with('success', 'Prescription ajoutée avec succès.');
    }

    /**
     * Ajouter un examen
     */
    public function ajouterExamen(Request $request, PatientDossier $patientDossier)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'examen' => 'required|string',
            'urgence' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $patientDossier->ajouterExamen($validated);

        return back()->with('success', 'Examen demandé avec succès.');
    }

    /**
     * Mettre à jour les constantes vitales
     */
    public function updateConstantes(Request $request, PatientDossier $patientDossier)
    {
        $validated = $request->validate([
            'tension_arterielle' => 'nullable|string',
            'frequence_cardiaque' => 'nullable|integer|min:0|max:300',
            'temperature' => 'nullable|numeric|min:30|max:45',
            'saturation_o2' => 'nullable|integer|min:0|max:100',
            'frequence_respiratoire' => 'nullable|integer|min:0|max:100',
            'poids' => 'nullable|numeric|min:0|max:500',
            'taille' => 'nullable|numeric|min:0|max:300',
            'glycemie' => 'nullable|numeric|min:0',
        ]);

        $patientDossier->updateConstantes($validated);

        return back()->with('success', 'Constantes vitales mises à jour.');
    }

    /**
     * Supprimer une visite
     */
    public function destroy(PatientDossier $patientDossier)
    {
        $patientDossier->delete();

        return back()->with('success', 'Visite supprimée avec succès.');
    }
}