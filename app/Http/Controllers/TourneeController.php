<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Tournee;
use App\Models\VisiteHad;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourneeController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $tournees = Tournee::with([
            'soignant:id,name',
            'service:id,nom,etage',
            'visiteHads' => fn ($q) => $q->with('patient:id,nom,prenom,sexe,age')
                                         ->orderBy('ordre'),
        ])
            ->when($request->service_id,  fn ($q) => $q->where('service_id',  $request->service_id))
            ->when($request->soignant_id, fn ($q) => $q->where('soignant_id', $request->soignant_id))
            ->when($request->statut,      fn ($q) => $q->where('statut',      $request->statut))
            ->whereDate('date', today())        // par défaut : tournées du jour
            ->orderBy('heure_debut_prevue')
            ->get()
            ->map(fn (Tournee $t) => $this->formatTournee($t));

        $stats = [
            'tournees_jour'       => $tournees->count(),
            'en_cours'            => $tournees->where('statut', 'en_cours')->count(),
            'terminees'           => $tournees->where('statut', 'terminee')->count(),
            'patients_a_visiter'  => $tournees->sum('patients_total'),
            'patients_vus'        => $tournees->sum('patients_vus'),
        ];
        return Inertia::render('dashboard/tourne', [
            'tournees'  => $tournees,
            'stats'     => $stats,
            'services'  => Service::actif()->select('id', 'nom', 'etage')->get()->map(fn ($s) => [
                'id'               => $s->id,
                'nom'              => $s->nom,
                'etage'            => $s->etage,
                'patients_actuels' => $s->occupationsActives()->count(),
            ]),
            'soignants' => User::select('id', 'name')->orderBy('name')->get(),
            'filters'   => $request->only(['service_id', 'soignant_id', 'statut']),
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'soignant_id'         => 'required|exists:users,id',
            'service_id'          => 'required|exists:services,id',
            'date'                => 'required|date',
            'heure_debut_prevue'  => 'required|date_format:H:i',
            'heure_fin_prevue'    => 'nullable|date_format:H:i|after:heure_debut_prevue',
            'vehicule'            => 'nullable|string|max:30',
            'type'                => 'required|in:complete,cas_critiques,chambre_specifique',
            'notes'               => 'nullable|string|max:2000',
        ]);

        $tournee = Tournee::create($validated);

        // Si c'est une tournée "complète", on pré-remplit les visites
        // avec tous les patients actifs du service, triés par chambre/lit.
        if ($tournee->type === Tournee::TYPE_COMPLETE) {
            $this->genererVisites($tournee);
        }

        return redirect()->back()->with('success', 'Tournée planifiée avec succès.');
    }

    // ── Show ──────────────────────────────────────────────────────────────

    public function show(Tournee $tournee): Response
    {
        $tournee->load([
            'soignant:id,name',
            'service:id,nom,etage',
            'visiteHads' => fn ($q) => $q->with('patient:id,nom,prenom,sexe,age')
                                         ->orderBy('ordre'),
        ]);

        return Inertia::render('Tournees/Show', [
            'tournee' => $this->formatTournee($tournee),
        ]);
    }

    // ── Update ────────────────────────────────────────────────────────────

    public function update(Request $request, Tournee $tournee): RedirectResponse
    {
        $this->authorize('update', $tournee);

        $validated = $request->validate([
            'soignant_id'        => 'sometimes|exists:users,id',
            'service_id'         => 'sometimes|exists:services,id',
            'date'               => 'sometimes|date',
            'heure_debut_prevue' => 'sometimes|date_format:H:i',
            'heure_fin_prevue'   => 'nullable|date_format:H:i',
            'vehicule'           => 'nullable|string|max:30',
            'notes'              => 'nullable|string|max:2000',
        ]);

        $tournee->update($validated);

        return redirect()->back()->with('success', 'Tournée mise à jour.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────

    public function destroy(Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut === Tournee::STATUT_EN_COURS,
            403,
            'Impossible de supprimer une tournée en cours.'
        );

        $tournee->delete();

        return redirect()->route('tournees.index')->with('success', 'Tournée supprimée.');
    }

    // ── Actions métier ────────────────────────────────────────────────────

    /** POST /tournees/{tournee}/demarrer */
    public function demarrer(Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut !== Tournee::STATUT_PLANIFIEE,
            403,
            'Seule une tournée planifiée peut être démarrée.'
        );

        $tournee->demarrer();

        return redirect()->back()->with('success', 'Tournée démarrée.');
    }

    /** POST /tournees/{tournee}/terminer */
    public function terminer(Tournee $tournee): RedirectResponse
    {
        abort_if(
            !in_array($tournee->statut, [Tournee::STATUT_PLANIFIEE, Tournee::STATUT_EN_COURS]),
            403,
            'Cette tournée ne peut pas être terminée.'
        );

        $tournee->terminer();

        return redirect()->back()->with('success', 'Tournée terminée.');
    }

    /** POST /tournees/{tournee}/suspendre */
    public function suspendre(Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut !== Tournee::STATUT_EN_COURS,
            403,
            'Seule une tournée en cours peut être suspendue.'
        );

        $tournee->suspendre();

        return redirect()->back()->with('success', 'Tournée suspendue.');
    }

    /** POST /tournees/{tournee}/annuler */
    public function annuler(Request $request, Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut === Tournee::STATUT_TERMINEE,
            403,
            'Impossible d\'annuler une tournée déjà terminée.'
        );

        $raison = $request->validate(['raison' => 'nullable|string|max:500'])['raison'] ?? '';
        $tournee->annuler($raison);

        return redirect()->back()->with('success', 'Tournée annulée.');
    }

    // ── Visites ───────────────────────────────────────────────────────────

    /** POST /tournees/{tournee}/visites/{visite}/valider */
    public function validerVisite(Request $request, Tournee $tournee, VisiteHad $visite): RedirectResponse
    {
        abort_if($visite->tournee_id !== $tournee->id, 404);
        abort_if($visite->visite_at !== null, 403, 'Cette visite a déjà été validée.');

        $validated = $request->validate([
            'observations'   => 'nullable|string|max:3000',
            'notes_soignant' => 'nullable|string|max:3000',
            'temperature'    => 'nullable|string|max:10',
            'tension'        => 'nullable|string|max:20',
            'pouls'          => 'nullable|string|max:20',
            'saturation'     => 'nullable|string|max:10',
        ]);

        $visite->valider($validated);

        // Si tous les patients ont été visités → terminer automatiquement
        if ($tournee->visiteHads()->whereNull('visite_at')->doesntExist()) {
            $tournee->terminer();
            return redirect()->back()->with('success', 'Dernière visite validée. Tournée terminée automatiquement.');
        }

        return redirect()->back()->with('success', 'Visite de ' . $visite->patient->nom_complet . ' validée.');
    }

    // ── Helpers privés ────────────────────────────────────────────────────

    /**
     * Transforme un modèle Tournee en tableau pour le frontend.
     * Ajoute les champs calculés attendus par le composant React.
     */
    private function formatTournee(Tournee $t): array
    {
        return [
            'id'                     => $t->id,
            'soignant_id'            => $t->soignant_id,
            'service_id'             => $t->service_id,
            'date'                   => $t->date->format('d/m/Y'),
            'vehicule'               => $t->vehicule,
            'heure_debut_prevue'     => $t->heure_debut_prevue,
            'heure_fin_prevue'       => $t->heure_fin_prevue,
            'heure_debut_effective'  => $t->heure_debut_effective?->format('H:i'),
            'heure_fin_effective'    => $t->heure_fin_effective?->format('H:i'),
            'kilometres'             => $t->kilometres,
            'type'                   => $t->type,
            'notes'                  => $t->notes,
            'statut'                 => $t->statut,
            // Calculés
            'patients_total'         => $t->visiteHads->count(),
            'patients_vus'           => $t->visiteHads->whereNotNull('visite_at')->count(),
            // Relations
            'soignant'               => ['id' => $t->soignant->id, 'name' => $t->soignant->name],
            'service'                => ['id' => $t->service->id, 'nom' => $t->service->nom, 'etage' => $t->service->etage],
            'visite_hads'            => $t->visiteHads->map(fn (VisiteHad $v) => [
                'id'                    => $v->id,
                'patient_id'            => $v->patient_id,
                'ordre'                 => $v->ordre,
                'priorite'              => $v->priorite,
                'chambre'               => $v->chambre,
                'lit'                   => $v->lit,
                'diagnostic'            => $v->diagnostic,
                'jours_hospitalisation' => $v->jours_hospitalisation,
                'observations'          => $v->observations,
                'visite_at'             => $v->visite_at?->format('d/m/Y H:i'),
                'notes_soignant'        => $v->notes_soignant,
                'temperature'           => $v->temperature,
                'tension'               => $v->tension,
                'pouls'                 => $v->pouls,
                'saturation'            => $v->saturation,
                'patient'               => [
                    'id'     => $v->patient->id,
                    'nom'    => $v->patient->nom,
                    'prenom' => $v->patient->prenom,
                    'sexe'   => $v->patient->sexe,
                    'age'    => $v->patient->age,
                ],
            ])->values()->all(),
        ];
    }

    /**
     * Génère automatiquement les VisiteHad pour une tournée "complète"
     * à partir des occupations actives du service.
     */
    private function genererVisites(Tournee $tournee): void
    {
        $occupations = $tournee->service
            ->occupationsActives()
            ->with('patient:id,nom,prenom,sexe,age', 'lit:id,numero,chambre')
            ->orderBy('chambre')
            ->orderBy('lit_id')
            ->get();

        $visites = $occupations->map(fn ($occupation, $index) => [
            'tournee_id'             => $tournee->id,
            'patient_id'             => $occupation->patient_id,
            'ordre'                  => $index + 1,
            'priorite'               => 'normal',
            'chambre'                => $occupation->lit->chambre ?? '',
            'lit'                    => $occupation->lit->numero  ?? '',
            'diagnostic'             => $occupation->diagnostic_principal,
            'jours_hospitalisation'  => $occupation->created_at->diffInDays(now()),
            'created_at'             => now(),
            'updated_at'             => now(),
        ])->all();

        VisiteHad::insert($visites);
    }
}