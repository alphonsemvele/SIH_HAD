<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\OccupationRoom;
use App\Models\RendezVous;
use App\Models\Lit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Stats ─────────────────────────────────────────────────────
        $stats = [
            'patients_actifs'    => Patient::whereNotIn('statut', ['decede'])->count(),
            'lits_occupes'       => Lit::where('statut', 'occupe')->count(),
            'lits_total'         => Lit::count(),
            'rdv_aujourd_hui'    => RendezVous::whereDate('date_heure', today())->count(),
            'rdv_en_attente'     => RendezVous::whereDate('date_heure', today())
                                        ->where('statut', 'en_attente')->count(),
            'tournees_had'       => \App\Models\Tournee::whereDate('date', today())->count(),
            'tournees_terminees' => \App\Models\Tournee::whereDate('date', today())
                                        ->where('statut', 'terminee')->count(),
            'admissions_ce_mois' => OccupationRoom::whereMonth('date_entree', now()->month)
                                        ->whereYear('date_entree', now()->year)
                                        ->count(),
        ];

        // ── Dernières admissions ──────────────────────────────────────
        $dernieres_admissions = OccupationRoom::with([
                'patient:id,nom,prenom',
                'lit:id,numero,chambre',
                'service:id,nom',
            ])
            ->where('statut', 'active')
            ->orderByDesc('date_entree')
            ->limit(5)
            ->get()
            ->map(fn (OccupationRoom $o) => [
                'id'      => $o->id,
                'initials' => $o->patient
                    ? mb_strtoupper(mb_substr($o->patient->prenom, 0, 1) . mb_substr($o->patient->nom, 0, 1))
                    : '?',
                'name'    => $o->patient
                    ? $o->patient->prenom . ' ' . $o->patient->nom
                    : '—',
                'room'    => trim(($o->lit?->chambre ?? '') . ' Lit ' . ($o->lit?->numero ?? '—')),
                'service' => $o->service?->nom ?? '—',
                'status'  => 'Stable',   // à connecter aux constantes vitales
            ]);

        return Inertia::render('dashboard/index', [
            'stats'               => $stats,
            'dernieres_admissions' => $dernieres_admissions,
        ]);
    }
}