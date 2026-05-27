<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PatientVisitsController extends Controller
{
    /**
     * GET /api/patient/visites
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->patient_id) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Aucun dossier patient associé',
            ]);
        }

        // Choisir une colonne de tri qui existe vraiment
        $orderBy = collect(['date_visite', 'date_prevue', 'visite_at', 'created_at'])
            ->first(fn($c) => Schema::hasColumn('visite_hads', $c)) ?? 'id';

        $visites = DB::table('visite_hads')
            ->leftJoin('tournees', 'visite_hads.tournee_id', '=', 'tournees.id')
            ->leftJoin('users',    'tournees.soignant_id',  '=', 'users.id')
            ->where('visite_hads.patient_id', $user->patient_id)
            ->orderByDesc("visite_hads.$orderBy")
            ->limit(20)
            ->select([
                'visite_hads.*',
                'users.name as soignant_name',
            ])
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $visites,
        ]);
    }
}
