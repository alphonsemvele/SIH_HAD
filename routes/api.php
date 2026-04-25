<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiAuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TourneeController;
use App\Http\Controllers\LitController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\CategorieMedicamentController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\AnalyseLaboratoireController;
use App\Http\Controllers\ExamenImagerieController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques (pas besoin d'être connecté)
Route::post('/login', [ApiAuthController::class, 'login']);

// Routes protégées par token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::get('/me', [ApiAuthController::class, 'me']);
    Route::post('/refresh', [ApiAuthController::class, 'refresh']);
    
    // Patients
    Route::get('/patients/search', [PatientController::class, 'search']);
    Route::apiResource('patients', PatientController::class);
    Route::get('/patients/{patient}/dossier-medical', [PatientController::class, 'dossierMedical']);
    Route::post('/patients/{patient}/constantes', [PatientController::class, 'ajouterConstantes']);
    
    // Tournées
    Route::apiResource('tournees', TourneeController::class);
    Route::post('/tournees/{tournee}/demarrer', [TourneeController::class, 'demarrer']);
    Route::post('/tournees/{tournee}/terminer', [TourneeController::class, 'terminer']);
    Route::post('/tournees/{tournee}/suspendre', [TourneeController::class, 'suspendre']);
    Route::post('/tournees/{tournee}/annuler', [TourneeController::class, 'annuler']);
    Route::get('/tournees/{tournee}/visites', [TourneeController::class, 'visites']);
    Route::post('/tournees/{tournee}/visites/{visite}/valider', [TourneeController::class, 'validerVisite']);
    
    // Lits
    Route::get('/lits/occupations', [LitController::class, 'occupations']);
    Route::apiResource('lits', LitController::class);
    Route::post('/lits/{lit}/occuper', [LitController::class, 'occuper']);
    Route::post('/lits/{lit}/liberer', [LitController::class, 'liberer']);
    
    // Pharmacie
    Route::apiResource('medicaments', MedicamentController::class);
    Route::apiResource('categories', CategorieMedicamentController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    
    // Laboratoire
    Route::apiResource('analyses', AnalyseLaboratoireController::class);
    
    // Imagerie
    Route::apiResource('imagerie', ExamenImagerieController::class);
    Route::apiResource('modalite-imagerie', 'App\Http\Controllers\ModaliteImagerieController');
    
    // Services
    Route::apiResource('services', ServiceController::class);
    
    // Soignants
    Route::get('/soignants', function () {
        return \App\Models\User::select('id', 'name')->orderBy('name')->get();
    });
    
    // Administration
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    
    // Anomalies
    Route::post('/anomalies', [\App\Http\Controllers\AnomalieController::class, 'store']);
    Route::get('/anomalies', [\App\Http\Controllers\AnomalieController::class, 'index']);
    Route::put('/anomalies/{anomalie}', [\App\Http\Controllers\AnomalieController::class, 'update']);
    
    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    Route::get('/dashboard/tournees-actives', [\App\Http\Controllers\DashboardController::class, 'tourneesActives']);
});
