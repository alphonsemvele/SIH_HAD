<?php

namespace App\Http\Controllers;

use App\Http\Requests\TourneeStoreRequest;
use App\Http\Requests\TourneeUpdateRequest;
use App\Models\Service;
use App\Models\Tournee;
use App\Models\VisiteHad;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TourneeController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'aujourdhui');

        $query = Tournee::with([
            'soignant:id,name',
            'service:id,nom,etage',
            'visiteHads' => fn ($q) => $q->with('patient:id,nom,prenom,sexe,date_naissance')
                                         ->orderBy('ordre'),
        ])
        ->when($request->service_id,  fn ($q) => $q->where('service_id',  $request->service_id))
        ->when($request->soignant_id, fn ($q) => $q->where('soignant_id', $request->soignant_id))
        ->when($request->statut,      fn ($q) => $q->where('statut',      $request->statut));

        $tournees = match ($tab) {

            // Planning semaine : ordre chronologique (lun→dim, matin→soir)
            'planning' => $query->deLaSemaine(
                              Carbon::parse($request->input('semaine', now()->startOfWeek()))
                          )
                          ->orderBy('date', 'asc')
                          ->orderBy('heure_debut_prevue', 'asc')
                          ->get(),

            // Historique : plus récent en premier
            'historique' => $query->where('date', '<', today())
                            ->orderBy('date', 'desc')
                            ->orderBy('heure_debut_prevue', 'desc')
                            ->limit(100)
                            ->get(),

            // Aujourd'hui : heure la plus récente en premier
            default => $query->whereDate('date', today())
                        ->orderBy('heure_debut_prevue', 'desc')
                        ->get(),
        };

        $formatted = $tournees->map(fn (Tournee $t) => $this->formatTournee($t));

        $statsQuery = Tournee::whereDate('date', today());
        $stats = [
            'tournees_jour'      => $statsQuery->count(),
            'en_cours'           => $statsQuery->clone()->where('statut', 'en_cours')->count(),
            'terminees'          => $statsQuery->clone()->where('statut', 'terminee')->count(),
            'patients_a_visiter' => (clone $statsQuery)->withCount('visiteHads')->get()->sum('visite_hads_count'),
            'patients_vus'       => (clone $statsQuery)->withCount('visitesEffectuees')->get()->sum('visites_effectuees_count'),
        ];

        return Inertia::render('dashboard/tourne', [
            'tournees'  => $formatted,
            'stats'     => $stats,
            'services'  => Service::actif()->select('id', 'nom', 'etage')->get()->map(fn ($s) => [
                'id'               => $s->id,
                'nom'              => $s->nom,
                'etage'            => $s->etage,
                'patients_actuels' => $s->occupationsActives()->count(),
            ]),
            'soignants' => User::select('id', 'name')->orderBy('name')->get(),
            'filters'   => $request->only(['service_id', 'soignant_id', 'statut', 'tab']),
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────

    public function store(TourneeStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $tournee = Tournee::create($validated);

        if ($tournee->type === Tournee::TYPE_COMPLETE) {
            $this->genererVisites($tournee);
        }

        $nbOccurrences = 0;
        if ($tournee->estRecurrente()) {
            $nbOccurrences = $tournee->genererOccurrences();
        }

        $msg = 'Tournée planifiée avec succès.';
        if ($nbOccurrences > 0) {
            $msg .= " {$nbOccurrences} occurrence(s) générée(s) automatiquement.";
        }

        return redirect()->back()->with('success', $msg);
    }

    // ── Show ──────────────────────────────────────────────────────────────

    public function show(Tournee $tournee): Response
    {
        $tournee->load([
            'soignant:id,name',
            'service:id,nom,etage',
            'visiteHads' => fn ($q) => $q->with('patient:id,nom,prenom,sexe,date_naissance')
                                         ->orderBy('ordre'),
            'parent:id,date,heure_debut_prevue',
        ]);

        return Inertia::render('Tournees/Show', [
            'tournee' => $this->formatTournee($tournee),
        ]);
    }

    // ── Update ────────────────────────────────────────────────────────────

    public function update(TourneeUpdateRequest $request, Tournee $tournee): RedirectResponse
    {
        $validated = $request->validated();

        $recurrenceChangee = isset($validated['recurrence'])
            && $validated['recurrence'] !== $tournee->recurrence
            && $validated['recurrence'] !== Tournee::REC_UNIQUE;

        $tournee->update($validated);

        if ($recurrenceChangee) {
            $tournee->occurrences()
                    ->where('date', '>', today())
                    ->where('statut', Tournee::STATUT_PLANIFIEE)
                    ->delete();

            $nb = $tournee->genererOccurrences();
            return redirect()->back()->with('success', "Tournée mise à jour. {$nb} occurrence(s) régénérée(s).");
        }

        return redirect()->back()->with('success', 'Tournée mise à jour.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────

    public function destroy(Request $request, Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut === Tournee::STATUT_EN_COURS,
            403,
            'Impossible de supprimer une tournée en cours.'
        );

        if ($request->boolean('supprimer_occurrences') && $tournee->estRecurrente()) {
            $tournee->occurrences()
                    ->where('date', '>=', today())
                    ->where('statut', Tournee::STATUT_PLANIFIEE)
                    ->delete();
        }

        $tournee->delete();

        return redirect()->route('tournees.index')->with('success', 'Tournée supprimée.');
    }

    // ── Actions métier ────────────────────────────────────────────────────

    public function demarrer(Tournee $tournee): RedirectResponse
    {
        // Idempotent : déjà en cours → on passe sans erreur
        if ($tournee->statut === Tournee::STATUT_EN_COURS) {
            return redirect()->back();
        }

        abort_if(
            $tournee->statut !== Tournee::STATUT_PLANIFIEE,
            403,
            'Seule une tournée planifiée peut être démarrée.'
        );

        $tournee->demarrer();

        return redirect()->back()->with('success', 'Tournée démarrée.');
    }

    public function terminer(Tournee $tournee): RedirectResponse
    {
        // Idempotent : déjà terminée → on passe sans erreur
        if ($tournee->statut === Tournee::STATUT_TERMINEE) {
            return redirect()->back();
        }

        abort_if(
            $tournee->statut === Tournee::STATUT_ANNULEE,
            403,
            'Impossible de terminer une tournée annulée.'
        );

        $tournee->terminer();

        return redirect()->back()->with('success', 'Tournée terminée.');
    }

    public function suspendre(Tournee $tournee): RedirectResponse
    {
        // Idempotent : déjà planifiée (suspendue) → on passe sans erreur
        if ($tournee->statut === Tournee::STATUT_PLANIFIEE) {
            return redirect()->back();
        }

        abort_if(
            $tournee->statut !== Tournee::STATUT_EN_COURS,
            403,
            'Seule une tournée en cours peut être suspendue.'
        );

        $tournee->suspendre();

        return redirect()->back()->with('success', 'Tournée suspendue.');
    }

    public function annuler(Request $request, Tournee $tournee): RedirectResponse
    {
        abort_if(
            $tournee->statut === Tournee::STATUT_TERMINEE,
            403,
            'Impossible d\'annuler une tournée déjà terminée.'
        );

        // Idempotent : déjà annulée → on passe sans erreur
        if ($tournee->statut === Tournee::STATUT_ANNULEE) {
            return redirect()->back();
        }

        $raison = $request->validate(['raison' => 'nullable|string|max:500'])['raison'] ?? '';
        $tournee->annuler($raison);

        return redirect()->back()->with('success', 'Tournée annulée.');
    }

    // ── Visites ───────────────────────────────────────────────────────────

    public function validerVisite(Request $request, Tournee $tournee, VisiteHad $visite): RedirectResponse
    {
        abort_if($visite->tournee_id !== $tournee->id, 404);

        // Idempotent : visite déjà validée → on passe sans erreur
        if ($visite->visite_at !== null) {
            return redirect()->back();
        }

        $validated = $request->validate([
            'observations'   => 'nullable|string|max:3000',
            'notes_soignant' => 'nullable|string|max:3000',
            'temperature'    => 'nullable|string|max:10',
            'tension'        => 'nullable|string|max:20',
            'pouls'          => 'nullable|string|max:20',
            'saturation'     => 'nullable|string|max:10',
        ]);

        $visite->valider($validated);

        if ($tournee->visiteHads()->whereNull('visite_at')->doesntExist()) {
            $tournee->terminer();
            return redirect()->back()->with('success', 'Dernière visite validée. Tournée terminée automatiquement.');
        }

        return redirect()->back()->with('success', 'Visite de ' . $visite->patient->nom_complet . ' validée.');
    }

    // ── Helpers privés ────────────────────────────────────────────────────

    private function formatTournee(Tournee $t): array
    {
        return [
            'id'                     => $t->id,
            'soignant_id'            => $t->soignant_id,
            'service_id'             => $t->service_id,
            // date est castée 'date' → Carbon → format OK
            'date'                   => $t->date->format('Y-m-d'),
            'vehicule'               => $t->vehicule,
            // heures castées 'string' → valeur brute "HH:MM", pas besoin de ->format()
            'heure_debut_prevue'     => $t->heure_debut_prevue,
            'heure_fin_prevue'       => $t->heure_fin_prevue,
            'heure_debut_effective'  => $t->heure_debut_effective,
            'heure_fin_effective'    => $t->heure_fin_effective,
            'heure_debut_2'          => $t->heure_debut_2,
            'heure_debut_3'          => $t->heure_debut_3,
            'kilometres'             => $t->kilometres,
            'type'                   => $t->type,
            'notes'                  => $t->notes,
            'statut'                 => $t->statut,
            'recurrence'             => $t->recurrence,
            'jours_actifs'           => $t->jours_actifs ?? [],
            'frequence_journaliere'  => $t->frequence_journaliere ?? 1,
            // date_fin_recurrence est castée 'date' → Carbon → format OK
            'date_fin_recurrence'    => $t->date_fin_recurrence?->format('Y-m-d'),
            'recurrence_parent_id'   => $t->recurrence_parent_id,
            'patients_total'         => $t->visiteHads->count(),
            'patients_vus'           => $t->visiteHads->whereNotNull('visite_at')->count(),
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
                    'age'    => $v->patient->date_naissance
                                    ? Carbon::parse($v->patient->date_naissance)->age
                                    : null,
                ],
            ])->values()->all(),
        ];
    }

    private function genererVisites(Tournee $tournee): void
    {
        $occupations = $tournee->service
            ->occupationsActives()
            ->with('patient:id,nom,prenom,sexe,date_naissance', 'lit:id,numero,chambre')
            ->orderBy('chambre')
            ->orderBy('lit_id')
            ->get();

        $visites = $occupations->map(fn ($occ, $index) => [
            'tournee_id'            => $tournee->id,
            'patient_id'            => $occ->patient_id,
            'ordre'                 => $index + 1,
            'priorite'              => 'normal',
            'chambre'               => $occ->lit->chambre ?? '',
            'lit'                   => $occ->lit->numero  ?? '',
            'diagnostic'            => $occ->diagnostic_principal,
            'jours_hospitalisation' => $occ->created_at->diffInDays(now()),
            'created_at'            => now(),
            'updated_at'            => now(),
        ])->all();

        VisiteHad::insert($visites);
    }
}