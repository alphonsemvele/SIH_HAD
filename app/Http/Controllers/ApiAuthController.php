<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ApiAuthController extends Controller
{
    /**
     * Login API user and return token
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Créer un token Sanctum pour l'utilisateur
        $token = $user->createToken('mobile-app-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role ?? 'infirmiere',
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Logout API user and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        // Révoquer le token actuel
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $serviceName = null;
        if ($user->service_id) {
            $serviceName = \DB::table('services')->where('id', $user->service_id)->value('nom');
        }
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id'            => $user->id,
                    'name'          => $user->name,
                    'email'         => $user->email,
                    'telephone'     => $user->telephone,
                    'matricule'     => $user->matricule,
                    'fonction'      => $user->fonction ?? 'Infirmier(ère) HAD',
                    'specialite'    => $user->specialite,
                    'service'       => $serviceName ?? 'Hospitalisation à Domicile',
                    'date_embauche' => $user->date_embauche,
                    'avatar'        => $user->avatar,
                    'role'          => $user->role ?? 'infirmiere',
                ],
            ],
        ]);
    }

    /**
     * GET /api/me/stats — stats personnelles de l'utilisateur connecté
     */
    public function meStats(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $visitesTotal = \App\Models\VisiteHad::whereHas('tournee', fn($q) => $q->where('soignant_id', $userId))
            ->whereNotNull('visite_at')
            ->count();

        $patientsUniques = \App\Models\VisiteHad::whereHas('tournee', fn($q) => $q->where('soignant_id', $userId))
            ->whereNotNull('visite_at')
            ->distinct('patient_id')
            ->count('patient_id');

        $tourneesTerminees = \App\Models\Tournee::where('soignant_id', $userId)
            ->where('statut', 'terminee')
            ->count();

        $actesRealises = \App\Models\ActeRealise::where('intervenant_id', $userId)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'visites_total'      => $visitesTotal,
                'patients_uniques'   => $patientsUniques,
                'tournees_terminees' => $tourneesTerminees,
                'actes_realises'     => $actesRealises,
                'note_moyenne'       => 4.9, // Placeholder (pas de système de notation pour l'instant)
            ],
        ]);
    }

    /**
     * Refresh token (optional)
     */
    public function refresh(Request $request): JsonResponse
    {
        // Révoquer l'ancien token
        $request->user()->currentAccessToken()->delete();
        
        // Créer un nouveau token
        $token = $request->user()->createToken('mobile-app-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refreshed',
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }
}
