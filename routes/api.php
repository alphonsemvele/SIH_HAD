<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiAuthController;
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
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\RealisationVisiteController;
use App\Models\VisiteHad;

use App\Http\Controllers\Api\Patient\PatientAuthController;
use App\Http\Controllers\Api\Patient\PatientDemandeVisiteController;
use App\Http\Controllers\Api\Patient\PatientVisitsController;

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

// Création de demande de visite (publique - patient ou famille)
Route::post('/demandes-visite', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'store']);

// Routes protégées par token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::get('/me', [ApiAuthController::class, 'me']);
    Route::get('/me/stats', [ApiAuthController::class, 'meStats']);
    Route::post('/refresh', [ApiAuthController::class, 'refresh']);
    
    // Patients
    Route::get('/patients/search', [PatientController::class, 'search']);
    // Carte et Localisation (DOIVENT être AVANT apiResource('patients') sinon /patients/{patient} les capture)
    Route::get('/patients/map', [\App\Http\Controllers\Api\MapController::class, 'patientsMap']);
    Route::get('/patients/geolocalises', [\App\Http\Controllers\Api\MapController::class, 'patientsGeolocalises']);

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
    Route::get('/users/available-for-chat', [\App\Http\Controllers\Api\MessageController::class, 'getAvailableUsers']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('roles', RoleController::class);
    
    // Carte et Localisation
    Route::get('/patients/{patient}/geolocalisation', [\App\Http\Controllers\Api\MapController::class, 'patientGeolocalisation']);
    Route::put('/patients/{patient}/geolocalisation', [\App\Http\Controllers\Api\MapController::class, 'updatePatientGeolocalisation']);
    Route::get('/zones-visites', [\App\Http\Controllers\Api\MapController::class, 'zonesVisites']);
    Route::post('/itineraire/optimiser', [\App\Http\Controllers\Api\MapController::class, 'itineraireOptimise']);
    Route::get('/zones/statistiques', [\App\Http\Controllers\Api\MapController::class, 'statistiquesZones']);

    // Rapports
    Route::apiResource('rapports', \App\Http\Controllers\Api\RapportController::class);
    Route::get('/rapports/{rapport}/telecharger', [\App\Http\Controllers\Api\RapportController::class, 'telecharger']);
    Route::post('/rapports/generer', [\App\Http\Controllers\Api\RapportController::class, 'generer']);
    Route::get('/rapports/types', [\App\Http\Controllers\Api\RapportController::class, 'getTypes']);
    Route::get('/rapports/stats', [\App\Http\Controllers\Api\RapportController::class, 'getStats']);
    
    // Messagerie
    Route::get('/conversations', [\App\Http\Controllers\Api\MessageController::class, 'conversations']);
    Route::post('/conversations', [\App\Http\Controllers\Api\MessageController::class, 'createConversation']);
    Route::get('/conversations/{conversation}', [\App\Http\Controllers\Api\MessageController::class, 'showConversation']);
    Route::put('/conversations/{conversation}/mark-as-read', [\App\Http\Controllers\Api\MessageController::class, 'markConversationAsRead']);
    Route::delete('/conversations/{conversation}', [\App\Http\Controllers\Api\MessageController::class, 'deleteConversation']);
    Route::get('/conversations/{conversation}/messages', [\App\Http\Controllers\Api\MessageController::class, 'showConversation']);
    Route::post('/messages', [\App\Http\Controllers\Api\MessageController::class, 'sendMessage']);
    Route::put('/messages/{message}/mark-as-read', [\App\Http\Controllers\Api\MessageController::class, 'markAsRead']);
    
    // QR Codes HAD
    Route::post('/had/visites/{visite}/qr-code', [QrCodeController::class, 'store']);
    Route::get('/had/qr-codes/{uuid}/preview', [QrCodeController::class, 'preview']);
    Route::post('/had/qr-codes/{uuid}/scan', [QrCodeController::class, 'scan']);
    Route::post('/had/qr-codes/{uuid}/revoquer', [QrCodeController::class, 'revoquer']);
    Route::post('/had/qr-codes/{uuid}/regenerer', [QrCodeController::class, 'regenerer']);
    
    // Réalisation de visite
    Route::post('/had/visites/{visite}/realisation', [RealisationVisiteController::class, 'store']);
    Route::get('/had/visites/{visite}/preuve', function (int $visite) {
        $visiteHad = VisiteHad::findOrFail($visite);
        $preuve = \App\Models\PreuveVisite::where('visite_had_id', $visiteHad->id)
            ->latest()
            ->first();
        
        if (!$preuve) {
            return response()->json(['error' => 'Preuve non trouvee'], 404);
        }

        $fullPath = \Illuminate\Support\Facades\Storage::disk('local')->path($preuve->pdf_chemin);
        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'Fichier PDF manquant'], 404);
        }

        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="preuve_visite_' . $visiteHad->id . '.pdf"',
        ]);
    });
    Route::delete('/messages/{message}', [\App\Http\Controllers\Api\MessageController::class, 'deleteMessage']);
    Route::get('/messaging/stats', [\App\Http\Controllers\Api\MessageController::class, 'getStats']);
    
    // Planning
    Route::apiResource('planning', \App\Http\Controllers\Api\PlanningController::class);
    
    // Alertes
    Route::apiResource('alertes', \App\Http\Controllers\Api\AlerteController::class);
    
    // Anomalies
    Route::post('/anomalies', [\App\Http\Controllers\AnomalieController::class, 'store']);
    Route::get('/anomalies', [\App\Http\Controllers\AnomalieController::class, 'index']);
    Route::put('/anomalies/{anomalie}', [\App\Http\Controllers\AnomalieController::class, 'update']);
    
    // Dashboard
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    Route::get('/dashboard/tournees-actives', [\App\Http\Controllers\DashboardController::class, 'tourneesActives']);
    
    // Plans de soins HAD
    Route::prefix('/had')->group(function () {
        Route::post('/patients/{patientHad}/plans-soins', [\App\Http\Controllers\Api\PlanSoinsController::class, 'creer']);
        Route::get('/plans-soins/{plan}', [\App\Http\Controllers\Api\PlanSoinsController::class, 'afficher']);
        Route::post('/plans-soins/{plan}/activer', [\App\Http\Controllers\Api\PlanSoinsController::class, 'activer']);
        Route::post('/plans-soins/{plan}/reevaluer', [\App\Http\Controllers\Api\PlanSoinsController::class, 'reevaluer']);
        Route::get('/patients/{patientHad}/plans-soins/actuel', [\App\Http\Controllers\Api\PlanSoinsController::class, 'planActuel']);
        
        // Clôture HAD
        Route::post('/patients/{patientHad}/cloturer', [\App\Http\Controllers\Api\ClotureHadController::class, 'cloturer']);
        Route::post('/cr-fin-had/{cr}/valider', [\App\Http\Controllers\Api\ClotureHadController::class, 'valider']);
        Route::get('/cr-fin-had/{cr}/pdf', [\App\Http\Controllers\Api\ClotureHadController::class, 'pdf']);
    });

    // Tableau de bord Ségur (admin/coordinateur_segur uniquement)
    Route::middleware('segur.access')->group(function () {
        Route::get('/admin/segur/indicateurs', [\App\Http\Controllers\SegurDashboardController::class, 'indicateurs']);
    });

    // ─── DEMANDES DE VISITE À DOMICILE ───
    Route::get('/demandes-visite', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'index']);
    Route::get('/demandes-visite/{id}', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'show']);
    Route::post('/demandes-visite/{id}/accepter', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'accepter']);
    Route::post('/demandes-visite/{id}/refuser', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'refuser']);
    Route::post('/demandes-visite/{id}/terminer', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'terminer']);
    Route::delete('/demandes-visite/{id}', [\App\Http\Controllers\Api\DemandeVisiteController::class, 'destroy']);
});

// ─── APP PATIENT ──────────────────────────────────────────────────────
Route::prefix('patient')->group(function () {
    Route::post('/login', [PatientAuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'patient.only'])->group(function () {
        Route::get('/me',      [PatientAuthController::class, 'me']);
        Route::post('/logout', [PatientAuthController::class, 'logout']);
        Route::get('/visites', [PatientVisitsController::class, 'index']);
        Route::get('/demandes-visite', [PatientDemandeVisiteController::class, 'index']);
        Route::post('/demandes-visite', [PatientDemandeVisiteController::class, 'store']);
        Route::get('/demandes-visite/{id}', [PatientDemandeVisiteController::class, 'show']);
    });
});
