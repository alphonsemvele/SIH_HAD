<?php

namespace App\Http\Controllers\Api\Patient;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class PatientAuthController extends Controller
{
    /**
     * POST /api/patient/login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)
                    ->where('fonction', 'patient')
                    ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect',
            ], 401);
        }

        $token = $user->createToken('patient-app-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'data' => [
                'user' => $this->userPayload($user),
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * GET /api/patient/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $this->userPayload($request->user()),
            ],
        ]);
    }

    /**
     * POST /api/patient/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
        ]);
    }

    private function userPayload(User $user): array
    {
        $patient = $user->patient_id
            ? \DB::table('patients')->where('id', $user->patient_id)->first()
            : null;

        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'role'           => $user->fonction,
            'patient_id'     => $user->patient_id,
            'numero_dossier' => $patient->numero_dossier ?? null,
            'nom'            => $patient->nom            ?? null,
            'prenom'         => $patient->prenom         ?? null,
        ];
    }
}
