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
        // Patients HAD France total
        $patientsHadFranceTotal = PatientHad::count();

        // Patients avec INS qualifiée
        $patientsAvecInsQualifiee = PatientHad::where('ins_qualifie', true)->count();

        // Taux INS qualifiée
        $tauxInsQualifie = $patientsHadFranceTotal > 0 
            ? round(($patientsAvecInsQualifiee / $patientsHadFranceTotal) * 100, 2)
            : 0;

        // Connexions PSC total (sessions créées dans la période)
        $connexionsPscTotal = PscSession::whereBetween('created_at', [$debut, $fin])->count();

        // Connexions password total (activity_log avec login password)
        $connexionsPasswordTotal = ActivityLog::where('subject_type', 'App\\Models\\User')
            ->where('description', 'login')
            ->whereJsonContains('properties->method', 'password')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        // Taux connexions PSC
        $totalConnexions = $connexionsPscTotal + $connexionsPasswordTotal;
        $tauxConnexionsPsc = $totalConnexions > 0 
            ? round(($connexionsPscTotal / $totalConnexions) * 100, 2)
            : 0;

        // Messages MSSanté
        $messagesMssanteEnvoyes = MssanteMessage::where('direction', 'sortant')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        $messagesMssanteRecus = MssanteMessage::where('direction', 'entrant')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        // Dépôts MES
        $depotsMesReussis = MesDepot::where('statut', 'depose')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        $depotsMesEchoues = MesDepot::where('statut', 'echec')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        $totalDepotsMes = $depotsMesReussis + $depotsMesEchoues;
        $tauxDepotMesReussite = $totalDepotsMes > 0 
            ? round(($depotsMesReussis / $totalDepotsMes) * 100, 2)
            : 0;

        // CR fin HAD validés
        $crFinHadValides = SegurDocument::where('source_type', 'cr_fin_had')
            ->where('statut', 'valide')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        // CR fin HAD déposés DMP
        $crFinHadDeposesDmp = SegurDocument::where('source_type', 'cr_fin_had')
            ->where('statut', 'depose')
            ->whereBetween('created_at', [$debut, $fin])
            ->count();

        $totalCrFinHad = $crFinHadValides + $crFinHadDeposesDmp;
        $tauxDepotCr = $totalCrFinHad > 0 
            ? round(($crFinHadDeposesDmp / $totalCrFinHad) * 100, 2)
            : 0;

        return [
            'periode' => [
                'debut' => $debut,
                'fin' => $fin,
            ],
            'patients_had_france_total' => $patientsHadFranceTotal,
            'patients_avec_ins_qualifiee' => $patientsAvecInsQualifiee,
            'taux_ins_qualifie_pct' => $tauxInsQualifie,
            'connexions_psc_total' => $connexionsPscTotal,
            'connexions_password_total' => $connexionsPasswordTotal,
            'taux_connexions_psc_pct' => $tauxConnexionsPsc,
            'messages_mssante_envoyes' => $messagesMssanteEnvoyes,
            'messages_mssante_recus' => $messagesMssanteRecus,
            'depots_mes_reussis' => $depotsMesReussis,
            'depots_mes_echoues' => $depotsMesEchoues,
            'taux_depot_mes_reussite_pct' => $tauxDepotMesReussite,
            'cr_fin_had_valides' => $crFinHadValides,
            'cr_fin_had_deposes_dmp' => $crFinHadDeposesDmp,
            'taux_depot_cr_pct' => $tauxDepotCr,
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
