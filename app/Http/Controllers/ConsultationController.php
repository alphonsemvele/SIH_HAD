<?php

namespace App\Http\Controllers;

use App\Models\Anomalie;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $query = Consultation::with([
            'patient:id,nom,prenom,sexe,date_naissance',
            'medecin:id,name',
            'service:id,nom',
        ])
        ->when($request->search, function ($q) use ($request) {
            $q->where(function ($sub) use ($request) {
                $sub->where('numero', 'like', "%{$request->search}%")
                    ->orWhere('motif', 'like', "%{$request->search}%")
                    ->orWhereHas('patient', fn ($p) =>
                        $p->where('nom', 'like', "%{$request->search}%")
                          ->orWhere('prenom', 'like', "%{$request->search}%")
                    )
                    ->orWhereHas('medecin', fn ($m) =>
                        $m->where('name', 'like', "%{$request->search}%")
                    );
            });
        })
        ->when($request->type,   fn ($q) => $q->where('type',   $request->type))
        ->when($request->statut, fn ($q) => $q->where('statut', $request->statut))
        ->when($request->date,   fn ($q) => $q->whereDate('date_consultation', $request->date))
        ->orderBy('date_consultation', 'desc')
        ->orderBy('heure_debut', 'desc');

        $consultations = $query->paginate(15)->withQueryString();

        $stats = [
            'total'       => Consultation::count(),
            'aujourd_hui' => Consultation::whereDate('date_consultation', today())->count(),
            'en_cours'    => Consultation::where('statut', 'en_cours')->count(),
            'terminees'   => Consultation::where('statut', 'terminee')
                                          ->whereDate('date_consultation', today())->count(),
            'urgences'    => Consultation::where('type', 'urgence')
                                          ->whereDate('date_consultation', today())->count(),
        ];

        return Inertia::render('dashboard/consultation', [
            'consultations' => [
                'data'      => $consultations->map(fn (Consultation $c) => $this->formatConsultation($c)),
                'total'     => $consultations->total(),
                'last_page' => $consultations->lastPage(),
                'links'     => $consultations->linkCollection()->toArray(),
            ],
            'stats'     => $stats,
            'patients'  => Patient::orderBy('nom')->get(['id', 'nom', 'prenom', 'sexe', 'date_naissance']),
            'medecins'  => User::where('fonction', 'Médecin')->orderBy('name')->get(['id', 'name']),
            'services'  => Service::where('actif', true)->orderBy('nom')->get(['id', 'nom']),
            // Anomalies actives triées par catégorie puis par nom
            'anomalies' => Anomalie::actif()
                                    ->orderBy('categorie')
                                    ->orderBy('nom')
                                    ->get(['id', 'nom', 'categorie']),
            'filters'   => $request->only(['search', 'type', 'statut', 'date']),
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'medecin_id'        => 'required|exists:users,id',
            'service_id'        => 'nullable|exists:services,id',
            'motif'             => 'required|string|max:500',
            'anomalie_ids'      => 'nullable|array',
            'anomalie_ids.*'    => 'integer|exists:pharmacie_anomalies,id',
            'type'              => 'required|in:interne,externe,urgence,teleconsultation',
            'statut'            => 'required|in:en_attente,en_cours,terminee,annulee',
            'date_consultation' => 'required|date',
            'heure_debut'       => 'required|string|max:5',
            'heure_fin'         => 'nullable|string|max:5',
            'diagnostic'        => 'nullable|string|max:500',
            'ordonnance'        => 'boolean',
            'examens_demandes'  => 'boolean',
            'notes'             => 'nullable|string|max:3000',
        ]);

        $validated['numero'] = $this->genererNumero();

        Consultation::create($validated);

        return redirect()->back()->with('success', 'Consultation enregistrée avec succès.');
    }

    // ── Update ────────────────────────────────────────────────────────────

    public function update(Request $request, Consultation $consultation): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'medecin_id'        => 'required|exists:users,id',
            'service_id'        => 'nullable|exists:services,id',
            'motif'             => 'required|string|max:500',
            'anomalie_ids'      => 'nullable|array',
            'anomalie_ids.*'    => 'integer|exists:pharmacie_anomalies,id',
            'type'              => 'required|in:interne,externe,urgence,teleconsultation',
            'statut'            => 'required|in:en_attente,en_cours,terminee,annulee',
            'date_consultation' => 'required|date',
            'heure_debut'       => 'required|string|max:5',
            'heure_fin'         => 'nullable|string|max:5',
            'diagnostic'        => 'nullable|string|max:500',
            'ordonnance'        => 'boolean',
            'examens_demandes'  => 'boolean',
            'notes'             => 'nullable|string|max:3000',
        ]);

        $consultation->update($validated);

        return redirect()->back()->with('success', 'Consultation mise à jour.');
    }

    // ── Destroy ───────────────────────────────────────────────────────────

    public function destroy(Consultation $consultation): RedirectResponse
    {
        $consultation->delete();

        return redirect()->back()->with('success', 'Consultation supprimée.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function formatConsultation(Consultation $c): array
    {
        return [
            'id'                => $c->id,
            'numero'            => $c->numero,
            'motif'             => $c->motif,
            'anomalie_ids'      => $c->anomalie_ids ?? [],
            'type'              => $c->type,
            'statut'            => $c->statut,
            'date_consultation' => Carbon::parse($c->date_consultation)->format('d/m/Y'),
            'heure_debut'       => $c->heure_debut,
            'heure_fin'         => $c->heure_fin,
            'diagnostic'        => $c->diagnostic,
            'ordonnance'        => (bool) $c->ordonnance,
            'examens_demandes'  => (bool) $c->examens_demandes,
            'notes'             => $c->notes,
            'patient' => [
                'id'             => $c->patient->id,
                'nom'            => $c->patient->nom,
                'prenom'         => $c->patient->prenom,
                'sexe'           => $c->patient->sexe,
                'date_naissance' => $c->patient->date_naissance,
            ],
            'medecin' => [
                'id'   => $c->medecin->id,
                'name' => $c->medecin->name,
            ],
            'service' => $c->service ? [
                'id'  => $c->service->id,
                'nom' => $c->service->nom,
            ] : null,
        ];
    }

    private function genererNumero(): string
    {
        $prefix = 'CONS-' . now()->format('Ymd') . '-';
        $last   = Consultation::where('numero', 'like', $prefix . '%')
                               ->orderByDesc('numero')
                               ->value('numero');

        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}