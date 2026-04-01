<?php

namespace App\Http\Controllers;

use App\Models\AnalyseLaboratoire;
use App\Models\TypeExamen;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoireController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AnalyseLaboratoire::with(['patient', 'typeExamen', 'medecinPrescripteur', 'technicien', 'biologiste'])
            ->when(
                $request->search,
                fn($q) =>
                $q->where('numero', 'like', "%{$request->search}%")
                    ->orWhereHas(
                        'patient',
                        fn($p) =>
                        $p->where('nom', 'like', "%{$request->search}%")
                            ->orWhere('prenom', 'like', "%{$request->search}%")
                    )
                    ->orWhereHas(
                        'medecinPrescripteur',
                        fn($m) =>
                        $m->where('name', 'like', "%{$request->search}%")
                    )
            )
            ->when(
                $request->categorie,
                fn($q) =>
                $q->whereHas('typeExamen', fn($t) => $t->where('categorie', $request->categorie))
            )
            ->when($request->statut, fn($q) => $q->where('statut', $request->statut))
            ->when($request->urgent === '1', fn($q) => $q->where('urgent', true))
            ->orderBy('created_at', 'desc');

        $analyses = $query->paginate(15)->withQueryString()
            ->through(fn($a) => [
                'id'                  => $a->id,
                'numero'              => $a->numero,
                'patient'             => [
                    'id'     => $a->patient->id,
                    'nom'    => $a->patient->nom,
                    'prenom' => $a->patient->prenom,
                    'sexe'   => $a->patient->sexe,
                ],
                'type'                => $a->typeExamen?->nom,
                'categorie'           => $a->typeExamen?->categorie,
                'prescripteur'        => $a->medecinPrescripteur?->name,
                'technicien'          => $a->technicien?->name,
                'biologiste'          => $a->biologiste?->name,
                'statut'              => $a->statut,
                'urgent'              => $a->urgent,
                'date_prescription'   => $a->date_prescription?->format('d/m/Y'),
                'date_prelevement'    => $a->date_prelevement?->format('d/m/Y H:i'),
                'date_resultat'       => $a->date_resultat?->format('d/m/Y H:i'),
                'resultat'            => $a->resultat ?? [],
                'interpretation'      => $a->interpretation,
                'conclusion'          => $a->conclusion,
                'commentaire_medecin' => $a->commentaire_medecin,
            ]);

        $stats = [
            'total'      => AnalyseLaboratoire::count(),
            'en_attente' => AnalyseLaboratoire::where('statut', 'prescrit')->count(),
            'en_cours'   => AnalyseLaboratoire::whereIn('statut', ['preleve', 'en_cours'])->count(),
            'termines'   => AnalyseLaboratoire::whereIn('statut', ['resultat_disponible', 'valide'])->count(),
            'urgents'    => AnalyseLaboratoire::where('urgent', true)->count(),
        ];

        $typesAnalyses = TypeExamen::where('module', 'laboratoire')
            ->where('actif', true)
            ->orderBy('categorie')->orderBy('nom')
            ->get(['id', 'nom', 'categorie']);

        $categories = TypeExamen::where('module', 'laboratoire')
            ->distinct()->pluck('categorie')->filter()->values();

        $patients = Patient::orderBy('nom')->get(['id', 'nom', 'prenom', 'sexe', 'date_naissance']);
        $medecins = \App\Models\User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('dashboard/laboratoire', [
            'analyses'      => $analyses,
            'stats'         => $stats,
            'typesAnalyses' => $typesAnalyses,
            'categories'    => $categories,
            'patients'      => $patients,
            'medecins'      => $medecins,
            'filters'       => $request->only(['search', 'categorie', 'statut', 'urgent']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'              => 'required|exists:patients,id',
            'type_examen_id'          => 'required|exists:type_examens,id',
            'medecin_prescripteur_id' => 'required|exists:users,id',
            'consultation_id'         => 'nullable|exists:consultations,id',
            'urgent'                  => 'boolean',
            'commentaire_medecin'     => 'nullable|string',
        ]);

        $validated['numero']            = 'LAB-' . date('Y') . '-' . str_pad(AnalyseLaboratoire::withTrashed()->count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['statut']            = 'en_attente';
        $validated['date_prescription'] = now();

        AnalyseLaboratoire::create($validated);

        return back()->with('success', 'Demande d\'analyse envoyée.');
    }

    public function updateStatut(Request $request, AnalyseLaboratoire $analyseLaboratoire)
    {
        $request->validate(['statut' => 'required|in:prescrit,preleve,en_cours,resultat_disponible,valide,annule']);

        $data = ['statut' => $request->statut];
        if ($request->statut === 'preleve')
            $data['date_prelevement'] = now();
        if (in_array($request->statut, ['resultat_disponible', 'valide']))
            $data['date_resultat'] = now();

        $analyseLaboratoire->update($data);

        return back()->with('success', 'Statut mis à jour.');
    }

    public function storeResultats(Request $request, AnalyseLaboratoire $analyseLaboratoire)
    {
        $request->validate([
            'resultat'                    => 'required|array|min:1',
            'resultat.*.parametre'        => 'required|string',
            'resultat.*.valeur'           => 'required|string',
            'resultat.*.unite'            => 'nullable|string',
            'resultat.*.valeur_reference' => 'nullable|string',
            'resultat.*.interpretation'   => 'required|in:normal,bas,eleve',
            'interpretation'              => 'nullable|string',
            'conclusion'                  => 'nullable|string',
        ]);

        $analyseLaboratoire->update([
            'resultat'       => $request->resultat,
            'interpretation' => $request->interpretation,
            'conclusion'     => $request->conclusion,
            'statut'         => 'resultat_disponible',
            'date_resultat'  => now(),
        ]);

        return back()->with('success', 'Résultats enregistrés.');
    }

    public function valider(AnalyseLaboratoire $analyseLaboratoire)
    {
        $analyseLaboratoire->update(['statut' => 'valide']);
        return back()->with('success', 'Analyse validée.');
    }

    public function destroy(AnalyseLaboratoire $analyseLaboratoire)
    {
        $analyseLaboratoire->delete();
        return back()->with('success', 'Analyse supprimée.');
    }
}