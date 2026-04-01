<?php

namespace App\Http\Controllers;

use App\Http\Requests\OccupationStoreRequest;
use App\Http\Resources\OccupationRoomResource;
use App\Models\Lit;
use App\Models\OccupationRoom;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OccupationRoomController extends Controller
{
    // ── Liste de toutes les occupations (actives + historique) ────────

    public function index(Request $request): Response
    {
        $occupations = OccupationRoom::with([
            'lit:id,numero,chambre',
            'service:id,nom,etage',
            'patient:id,nom,prenom,date_naissance,telephone',
            'medecin:id,name',
            'infirmier:id,name',
        ])
            ->when($request->statut,     fn ($q) => $q->where('statut', $request->statut))
            ->when($request->service_id, fn ($q) => $q->where('service_id', $request->service_id))
            ->when($request->search, fn ($q, $s) => $q->whereHas(
                'patient',
                fn ($p) => $p->where('nom', 'like', "%{$s}%")->orWhere('prenom', 'like', "%{$s}%")
            ))
            ->orderByDesc('date_entree')
            ->paginate(20);

        return Inertia::render('dashboard/occupations-index', [
            'occupations' => OccupationRoomResource::collection($occupations),
            'services'    => Service::actif()->select('id', 'nom')->get(),
            'filters'     => $request->only(['statut', 'service_id', 'search']),
        ]);
    }

    // ── Détail d'une occupation ──────────────────────────────────────

    public function show(OccupationRoom $occupationRoom): Response
    {
        $occupationRoom->load([
            'lit.service:id,nom,etage',
            'service:id,nom,etage',
            'patient',
            'medecin:id,name',
            'infirmier:id,name',
            'creePar:id,name',
            'litDestination:id,numero',
            'serviceDestination:id,nom',
        ]);

        // Occupations précédentes sur ce même lit
        $precedentes = OccupationRoom::where('lit_id', $occupationRoom->lit_id)
            ->where('id', '!=', $occupationRoom->id)
            ->whereIn('statut', ['terminee', 'transfere'])
            ->with('patient:id,nom,prenom')
            ->orderByDesc('date_entree')
            ->take(10)
            ->get()
            ->map(fn (OccupationRoom $o) => [
                'id'           => $o->id,
                'patient'      => $o->patient ? $o->patient->nom . ' ' . $o->patient->prenom : '—',
                'diagnostic'   => $o->diagnostic_principal,
                'date_entree'  => $o->date_entree->format('d/m/Y'),
                'date_sortie'  => $o->date_sortie?->format('d/m/Y'),
                'duree_jours'  => $o->duree_sejour,
                'motif_sortie' => $o->motif_sortie,
            ]);

        return Inertia::render('dashboard/occupations-show', [
            'occupation'  => new OccupationRoomResource($occupationRoom),
            'precedentes' => $precedentes,
        ]);
    }

    // ── Formulaire d'admission ────────────────────────────────────────

    public function create(Request $request): Response
    {
        // Pré-sélection du lit si passé en query string (?lit_id=X)
        $litPreselectionne = null;
        if ($request->lit_id) {
            $lit = Lit::with('service:id,nom,etage')->find($request->lit_id);
            if ($lit && $lit->est_disponible) {
                $litPreselectionne = [
                    'id'              => $lit->id,
                    'numero'         => $lit->numero,
                    'chambre'        => $lit->chambre,
                    'type'           => $lit->type,
                    'tarif_journalier' => $lit->tarif_journalier,
                    'service'        => ['id' => $lit->service->id, 'nom' => $lit->service->nom, 'etage' => $lit->service->etage],
                ];
            }
        }

        $litsDisponibles = Lit::disponible()
            ->with('service:id,nom,etage')
            ->orderBy('service_id')
            ->orderBy('chambre')
            ->orderBy('numero')
            ->get()
            ->map(fn (Lit $l) => [
                'id'              => $l->id,
                'numero'          => $l->numero,
                'chambre'         => $l->chambre,
                'type'            => $l->type,
                'tarif_journalier' => $l->tarif_journalier,
                'service'         => ['id' => $l->service->id, 'nom' => $l->service->nom, 'etage' => $l->service->etage],
            ]);

        return Inertia::render('dashboard/occupation-create', [
            'lit_preselectionne' => $litPreselectionne,
            'lits_disponibles'   => $litsDisponibles,
            'patients'           => \App\Models\Patient::select('id', 'nom', 'prenom', 'date_naissance', 'telephone')
                                        ->orderBy('nom')->orderBy('prenom')
                                        ->get()
                                        ->map(fn ($p) => [
                                            'id'             => $p->id,
                                            'nom_complet'    => $p->nom . ' ' . $p->prenom,
                                            'date_naissance' => $p->date_naissance?->format('d/m/Y'),
                                            'telephone'      => $p->telephone,
                                        ]),
            'medecins'           => \App\Models\User::select('id', 'name')
                                        ->where('fonction', 'medecin')
                                        ->orderBy('name')->get(),
            'infirmiers'         => \App\Models\User::select('id', 'name')
                                        ->whereIn('fonction', ['infirmier', 'infirmiere'])
                                        ->orderBy('name')->get(),
            'date_entree_defaut' => now()->format('Y-m-d\TH:i'),
        ]);
    }

    // ── Créer une occupation (admettre un patient dans un lit) ────────

    public function store(OccupationStoreRequest $request): RedirectResponse
    {
        $lit = Lit::findOrFail($request->lit_id);

        if (!$lit->est_disponible) {
            return back()->with('error', "Le lit {$lit->numero} n'est pas disponible.");
        }

        $occupation = $lit->admettre(
            patientId: $request->patient_id,
            data: $request->validated(),
            userId: auth()->id()
        );

        return redirect()
            ->route('occupations.show', $occupation)
            ->with('success', 'Patient admis avec succès.');
    }

    // ── Terminer une occupation (sortie patient) ──────────────────────

    public function terminer(Request $request, OccupationRoom $occupationRoom): RedirectResponse
    {
        $request->validate([
            'motif_sortie' => 'required|in:guerison,transfert_externe,sortie_contre_avis,deces,fuga,autre',
            'notes_sortie' => 'nullable|string|max:1000',
        ]);

        if (!$occupationRoom->est_active) {
            return back()->with('error', 'Cette occupation est déjà terminée.');
        }

        $occupationRoom->terminer(
            motif: $request->motif_sortie,
            notesSortie: $request->notes_sortie,
            userId: auth()->id()
        );

        return redirect()
            ->route('lits.index')
            ->with('success', 'Patient sorti. Lit passé en nettoyage.');
    }

    // ── Transférer un patient vers un autre lit ──────────────────────

    public function transferer(Request $request, OccupationRoom $occupationRoom): RedirectResponse
    {
        $request->validate([
            'lit_destination_id' => [
                'required',
                'exists:lits,id',
                fn ($attr, $value, $fail) => Lit::find($value)?->est_disponible
                    ? null
                    : $fail('Le lit de destination n\'est pas disponible.'),
            ],
            'commentaire' => 'nullable|string|max:255',
        ]);

        if (!$occupationRoom->est_active) {
            return back()->with('error', 'Cette occupation est déjà terminée.');
        }

        $litDestination = Lit::findOrFail($request->lit_destination_id);

        $nouvelleOccupation = $occupationRoom->transferer(
            litDestination: $litDestination,
            commentaire: $request->commentaire,
            userId: auth()->id()
        );

        return redirect()
            ->route('lits.occupations.show', $nouvelleOccupation)
            ->with('success', 'Patient transféré avec succès.');
    }

    // ── Historique des occupations d'un lit spécifique ─────────────────

    public function parLit(Lit $lit): Response
    {
        $lit->load('service:id,nom,etage', 'occupationActive.patient');

        $occupations = OccupationRoom::where('lit_id', $lit->id)
            ->with([
                'patient:id,nom,prenom',
                'medecin:id,name',
                'serviceDestination:id,nom',
            ])
            ->orderByDesc('date_entree')
            ->paginate(15);

        return Inertia::render('Lits/Occupations/ParLit', [
            'lit'         => [
                'id'        => $lit->id,
                'numero'    => $lit->numero,
                'chambre'   => $lit->chambre,
                'statut'    => $lit->statut,
                'type'      => $lit->type,
                'service'   => ['nom' => $lit->service->nom, 'etage' => $lit->service->etage],
                'occupation_active' => $lit->occupationActive ? [
                    'patient' => $lit->occupationActive->patient?->nom . ' ' . $lit->occupationActive->patient?->prenom,
                    'diagnostic' => $lit->occupationActive->diagnostic_principal,
                    'date_entree' => $lit->occupationActive->date_entree->format('d/m/Y'),
                ] : null,
            ],
            'occupations' => OccupationRoomResource::collection($occupations),
        ]);
    }

    // ── Vue chambre : occupation actuelle + historique ─────────────────

    public function chambre(Service $service): Response
    {
        $service->load([
            'lits' => fn ($q) => $q->with([
                'occupationActive' => fn ($q) => $q->with([
                    'patient:id,nom,prenom,date_naissance,telephone',
                    'medecin:id,name',
                    'infirmier:id,name',
                ]),
                'occupations' => fn ($q) => $q
                    ->whereIn('statut', ['terminee', 'transfere'])
                    ->with('patient:id,nom,prenom')
                    ->orderByDesc('date_entree')
                    ->limit(5),
            ]),
        ]);

        return Inertia::render('Lits/Chambres/Show', [
            'service' => [
                'id'    => $service->id,
                'nom'   => $service->nom,
                'etage' => $service->etage,
                'stats' => [
                    'capacite'    => $service->capacite,
                    'occupes'     => $service->occupes,
                    'disponibles' => $service->disponibles,
                    'enNettoyage' => $service->en_nettoyage,
                ],
            ],
            'lits' => $service->lits->map(fn (Lit $lit) => [
                'id'      => $lit->id,
                'numero'  => $lit->numero,
                'chambre' => $lit->chambre,
                'type'    => $lit->type,
                'statut'  => $lit->statut,
                'tarif_journalier' => $lit->tarif_journalier,
                'occupation_active' => $lit->occupationActive ? [
                    'id'                 => $lit->occupationActive->id,
                    'patient'            => $lit->occupationActive->patient ? [
                        'id'              => $lit->occupationActive->patient->id,
                        'nom_complet'     => $lit->occupationActive->patient->nom . ' ' . $lit->occupationActive->patient->prenom,
                        'date_naissance'  => $lit->occupationActive->patient->date_naissance?->format('d/m/Y'),
                        'telephone'       => $lit->occupationActive->patient->telephone,
                    ] : null,
                    'medecin'            => $lit->occupationActive->medecin?->name,
                    'infirmier'          => $lit->occupationActive->infirmier?->name,
                    'diagnostic'         => $lit->occupationActive->diagnostic_principal,
                    'date_entree'        => $lit->occupationActive->date_entree->format('d/m/Y H:i'),
                    'date_sortie_prevue' => $lit->occupationActive->date_sortie_prevue?->format('d/m/Y'),
                    'duree_jours'        => $lit->occupationActive->duree_sejour,
                ] : null,
                'historique_recent' => $lit->occupations->map(fn (OccupationRoom $o) => [
                    'patient'     => $o->patient ? $o->patient->nom . ' ' . $o->patient->prenom : '—',
                    'date_entree' => $o->date_entree->format('d/m/Y'),
                    'date_sortie' => $o->date_sortie?->format('d/m/Y'),
                    'motif'       => $o->motif_sortie,
                ]),
            ]),
        ]);
    }
}