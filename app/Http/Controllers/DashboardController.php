<?php

namespace App\Http\Controllers;

use App\Models\Anomalie;
use App\Models\Medicament;
use App\Models\OccupationRoom;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\RendezVous;
use App\Models\Lit;
use App\Models\Service;
use App\Models\Tournee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Détection dynamique des colonnes disponibles ──────────────
        $anomalieColumns  = Schema::getColumnListing('pharmacie_anomalies');
        $hasSeverite      = in_array('severite', $anomalieColumns);
        $hasStatutAnomaly = in_array('statut',   $anomalieColumns);

        // ── Stats ─────────────────────────────────────────────────────
        $anomaliesCritiques = 0;
        try {
            $q = Anomalie::query();
            if ($hasStatutAnomaly) {
                $q->whereNotIn('statut', ['traite', 'ferme', 'resolu']);
            }
            if ($hasSeverite) {
                $q->where('severite', 'critique');
            }
            $anomaliesCritiques = $q->count();
        } catch (\Throwable) {}

        $prescriptionsEnAttente = 0;
        try {
            $prescriptionsEnAttente = Prescription::where('statut', 'en_attente')->count();
        } catch (\Throwable) {}

        $stats = [
            'patients_actifs'          => $this->safe(fn () => Patient::whereNotIn('statut', ['decede'])->count()),
            'lits_occupes'             => $this->safe(fn () => Lit::where('statut', 'occupe')->count()),
            'lits_total'               => $this->safe(fn () => Lit::count()),
            'rdv_aujourd_hui'          => $this->safe(fn () => RendezVous::whereDate('date_heure', today())->count()),
            'rdv_en_attente'           => $this->safe(fn () => RendezVous::whereDate('date_heure', today())->where('statut', 'en_attente')->count()),
            'tournees_had'             => $this->safe(fn () => Tournee::whereDate('date', today())->count()),
            'tournees_terminees'       => $this->safe(fn () => Tournee::whereDate('date', today())->where('statut', 'terminee')->count()),
            'admissions_ce_mois'       => $this->safe(fn () => OccupationRoom::whereMonth('date_entree', now()->month)->whereYear('date_entree', now()->year)->count()),
            'prescriptions_en_attente' => $prescriptionsEnAttente,
            'anomalies_critiques'      => $anomaliesCritiques,
        ];

        // ── Dernières admissions ──────────────────────────────────────
        $dernieres_admissions = $this->safe(fn () =>
            OccupationRoom::with(['patient:id,nom,prenom', 'lit:id,numero,chambre', 'service:id,nom'])
                ->where('statut', 'active')
                ->orderByDesc('date_entree')
                ->limit(6)
                ->get()
                ->map(fn (OccupationRoom $o) => [
                    'id'          => $o->id,
                    'initials'    => $o->patient
                        ? mb_strtoupper(mb_substr($o->patient->prenom, 0, 1) . mb_substr($o->patient->nom, 0, 1))
                        : '?',
                    'name'        => $o->patient ? $o->patient->prenom . ' ' . $o->patient->nom : '—',
                    'room'        => trim(($o->lit?->chambre ?? '') . ' Lit ' . ($o->lit?->numero ?? '—')),
                    'service'     => $o->service?->nom ?? '—',
                    'status'      => 'Stable',
                    'date_entree' => $o->date_entree?->diffForHumans() ?? '—',
                ]), []
        );

        // ── Tournées HAD du jour ──────────────────────────────────────
        $tournees_jour = $this->safe(fn () =>
            Tournee::with(['soignant:id,name', 'service:id,nom'])
                ->whereDate('date', today())
                ->orderBy('heure_debut_prevue')
                ->limit(5)
                ->get()
                ->map(fn (Tournee $t) => [
                    'id'             => $t->id,
                    'service'        => $t->service?->nom ?? '—',
                    'soignant'       => $t->soignant?->name ?? '—',
                    'heure_debut'    => $t->heure_debut_prevue?->format('H:i') ?? '—',
                    'statut'         => $t->statut,
                    'patients_total' => $t->visiteHads()->count(),
                    'patients_vus'   => $t->visiteHads()->whereNotNull('visite_at')->count(),
                ]), []
        );

        // ── Anomalies actives ─────────────────────────────────────────
        $anomalies_actives = $this->safe(function () use ($hasSeverite, $hasStatutAnomaly) {
            $q = Anomalie::with(['patient:id,nom,prenom']);

            if ($hasStatutAnomaly) {
                $q->whereNotIn('statut', ['traite', 'ferme', 'resolu']);
            }

            if ($hasSeverite) {
                $q->orderByRaw("FIELD(severite, 'critique', 'elevee', 'moderee', 'faible')");
            } else {
                $q->latest();
            }

            return $q->limit(5)->get()->map(fn (Anomalie $a) => [
                'id'         => $a->id,
                'titre'      => $a->titre,
                'severite'   => $hasSeverite ? ($a->severite ?? 'moderee') : 'moderee',
                'patient'    => $a->patient ? $a->patient->prenom . ' ' . $a->patient->nom : '—',
                'created_at' => $a->created_at?->diffForHumans() ?? '—',
            ]);
        }, []);

        // ── Prescriptions récentes en attente ─────────────────────────
        $prescriptions_recentes = $this->safe(fn () =>
            Prescription::with(['patient:id,nom,prenom', 'medecin:id,name,lastname'])
                ->where('statut', 'en_attente')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (Prescription $p) => [
                    'id'      => $p->id,
                    'numero'  => $p->numero,
                    'patient' => $p->patient ? $p->patient->prenom . ' ' . $p->patient->nom : '—',
                    'medecin' => $p->medecin ? 'Dr. ' . ($p->medecin->lastname ?? $p->medecin->name) : '—',
                    'date'    => $p->created_at?->format('d/m/Y') ?? '—',
                ]), []
        );

        // ── Occupation par service ────────────────────────────────────
        $services_occupation = $this->safe(fn () =>
            Service::with(['lits'])
                ->actif()
                ->limit(6)
                ->get()
                ->map(fn (Service $s) => [
                    'id'      => $s->id,
                    'nom'     => $s->nom,
                    'total'   => $s->lits->count(),
                    'occupes' => $s->lits->where('statut', 'occupe')->count(),
                ])
                ->filter(fn ($s) => $s['total'] > 0)
                ->values(), []
        );

        // ── Activité 7 derniers jours ─────────────────────────────────
        $activite_7j = collect(range(6, 0))->map(function ($i) {
            $date = now()->subDays($i);
            return [
                'jour'          => $date->locale('fr')->isoFormat('ddd'),
                'admissions'    => $this->safe(fn () => OccupationRoom::whereDate('date_entree', $date)->count()),
                'prescriptions' => $this->safe(fn () => Prescription::whereDate('created_at', $date)->count()),
                'tournees'      => $this->safe(fn () => Tournee::whereDate('date', $date)->count()),
            ];
        });

        return Inertia::render('dashboard/index', [
            'stats'                  => $stats,
            'dernieres_admissions'   => $dernieres_admissions,
            'tournees_jour'          => $tournees_jour,
            'anomalies_actives'      => $anomalies_actives,
            'prescriptions_recentes' => $prescriptions_recentes,
            'services_occupation'    => $services_occupation,
            'activite_7j'            => $activite_7j,
        ]);
    }

    /**
     * Exécute un callback et retourne $default en cas d'erreur.
     * Évite les crash si une table/colonne n'existe pas encore.
     */
    private function safe(callable $fn, mixed $default = 0): mixed
    {
        try {
            return $fn();
        } catch (\Throwable) {
            return $default;
        }
    }
}