<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\MesDepot;
use App\Models\MssanteMessage;
use App\Models\PatientHad;
use App\Models\PscSession;
use App\Models\SegurDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SegurDashboardController extends Controller
{
    /**
     * Obtenir les indicateurs Ségur pour une période donnée
     */
    public function indicateurs(Request $request): JsonResponse
    {
        // Valider les paramètres de période
        $request->validate([
            'debut' => 'required|date',
            'fin' => 'required|date|after_or_equal:debut',
        ]);

        $debut = $request->input('debut');
        $fin = $request->input('fin');

        // Créer la clé de cache
        $cacheKey = "segur_indicateurs_{$debut}_{$fin}";

        // Mettre en cache pendant 1 heure
        $indicateurs = Cache::remember($cacheKey, 3600, function () use ($debut, $fin) {
            return $this->calculerIndicateurs($debut, $fin);
        });

        return response()->json($indicateurs);
    }

    /**
     * Calculer les indicateurs Ségur
     */
    private function calculerIndicateurs(string $debut, string $fin): array
    {
        // TODO(samedi): implémenter les vrais calculs après alignement schémas DB
        return [
            'periode' => ['debut' => $debut, 'fin' => $fin],
            'patients_had_france_total' => 0,
            'patients_avec_ins_qualifiee' => 0,
            'taux_ins_qualifie_pct' => 0,
            'connexions_psc_total' => 0,
            'connexions_password_total' => 0,
            'taux_connexions_psc_pct' => 0,
            'messages_mssante_envoyes' => 0,
            'messages_mssante_recus' => 0,
            'depots_mes_reussis' => 0,
            'depots_mes_echoues' => 0,
            'taux_depot_mes_reussite_pct' => 0,
            'cr_fin_had_valides' => 0,
            'cr_fin_had_deposes_dmp' => 0,
            'taux_depot_cr_pct' => 0,
        ];
    }

    /**
     * Page admin du tableau de bord Ségur
     */
    public function index(Request $request)
    {
        // Vérifier les permissions
        if (!$this->hasSegurPermission($request->user())) {
            abort(403, 'Accès non autorisé');
        }

        return inertia('Admin/Segur/Indicateurs', [
            'defaultPeriod' => [
                'debut' => now()->startOfMonth()->format('Y-m-d'),
                'fin' => now()->endOfMonth()->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Vérifier si l'utilisateur a les permissions Ségur
     */
    private function hasSegurPermission($user): bool
    {
        return $user->role === 'admin' || $user->role === 'coordinateur_segur';
    }
}
