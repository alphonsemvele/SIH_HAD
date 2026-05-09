<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\DossierMedicalController;
use App\Http\Controllers\CategorieMedicamentController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\TypeExamenController;
use App\Http\Controllers\LaboratoireController;
use App\Http\Controllers\ImagerieController;
use App\Http\Controllers\ModaliteImagerieController;
use App\Http\Controllers\LitController;
use App\Http\Controllers\OccupationRoomController;
use App\Http\Controllers\TourneeController;
use App\Http\Controllers\AnomalieController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminRoleController;
use App\Http\Controllers\SegurDashboardController;

Route::middleware(['auth', 'verified'])
    ->prefix('anomalies')
    ->name('anomalies.')
    ->group(function () {
        Route::get('/',              [AnomalieController::class, 'index'])  ->name('index');
        Route::post('/',             [AnomalieController::class, 'store'])  ->name('store');
        Route::put('/{anomalie}',    [AnomalieController::class, 'update']) ->name('update');
        Route::delete('/{anomalie}', [AnomalieController::class, 'destroy'])->name('destroy');
    });

Route::middleware(['auth'])->prefix('tournees')->name('tournees.')->group(function () {

    // CRUD de base
    Route::get('/',              [TourneeController::class, 'index'])   ->name('index');
    Route::post('/',             [TourneeController::class, 'store'])   ->name('store');
    Route::get('/{tournee}',     [TourneeController::class, 'show'])    ->name('show');
    Route::put('/{tournee}',     [TourneeController::class, 'update'])  ->name('update');
    Route::delete('/{tournee}',  [TourneeController::class, 'destroy']) ->name('destroy');

    // Actions métier
    Route::post('/{tournee}/demarrer',  [TourneeController::class, 'demarrer'])  ->name('demarrer');
    Route::post('/{tournee}/terminer',  [TourneeController::class, 'terminer'])  ->name('terminer');
    Route::post('/{tournee}/suspendre', [TourneeController::class, 'suspendre']) ->name('suspendre');
    Route::post('/{tournee}/annuler',   [TourneeController::class, 'annuler'])   ->name('annuler');

    // Visites individuelles
    Route::post('/{tournee}/visites/{visite}/valider', [TourneeController::class, 'validerVisite'])
         ->name('visites.valider');
});


Route::middleware(['auth', 'verified'])->prefix('lits/occupations')->name('occupations.')->group(function () {
    Route::get('/',                              [OccupationRoomController::class, 'index'])->name('index');

    // ↓ Routes statiques — TOUJOURS avant /{occupationRoom}
    Route::get('/create',                        [OccupationRoomController::class, 'create'])->name('create');
    Route::get('/lit/{lit}',                     [OccupationRoomController::class, 'parLit'])->name('par-lit');

    Route::post('/',                             [OccupationRoomController::class, 'store'])->name('store');

    // ↓ Route dynamique en dernier
    Route::get('/{occupationRoom}',              [OccupationRoomController::class, 'show'])->name('show');
    Route::post('/{occupationRoom}/terminer',    [OccupationRoomController::class, 'terminer'])->name('terminer');
    Route::post('/{occupationRoom}/transferer',  [OccupationRoomController::class, 'transferer'])->name('transferer');
});
Route::middleware(['auth', 'verified'])->prefix('lits')->name('lits.')->group(function () {

    // ── Vue principale ─────────────────────────────────────────────────
    Route::get('/',          [LitController::class, 'index'])->name('index');
    Route::get('/historique', [LitController::class, 'historique'])->name('historique');

    // ── CRUD Lits ──────────────────────────────────────────────────────
    Route::post('/',          [LitController::class, 'store'])->name('store');
    Route::get('/{lit}',      [LitController::class, 'show'])->name('show');
    Route::put('/{lit}',      [LitController::class, 'update'])->name('update');
    Route::delete('/{lit}',   [LitController::class, 'destroy'])->name('destroy');

    // ── Actions sur un lit ─────────────────────────────────────────────
    Route::post('/{lit}/nettoyage',   [LitController::class, 'marquerNettoyage'])->name('nettoyage');
    Route::post('/{lit}/disponible',  [LitController::class, 'marquerDisponible'])->name('disponible');
    Route::post('/{lit}/hors-service', [LitController::class, 'horsService'])->name('hors-service');
    Route::post('/{lit}/transferer',  [LitController::class, 'transfererLit'])->name('transferer-lit');

    // ── Occupations ─────────────────────────────────────────────────────
   

    // ── Vue chambres par service ────────────────────────────────────────
    Route::get('/service/{service}/chambres', [OccupationRoomController::class, 'chambre'])->name('chambres');

    // ── Services ────────────────────────────────────────────────────────
    Route::prefix('services')->name('services.')->group(function () {
        Route::post('/',               [ServiceController::class, 'store'])->name('store');
        Route::put('/{service}',       [ServiceController::class, 'update'])->name('update');
        Route::delete('/{service}',    [ServiceController::class, 'destroy'])->name('destroy');
    });
});
// Page d'accueil → login
Route::get('/', function () {
    return Inertia::render('index');
})->name('home');


// Route::get('/login', function () {
//     return Inertia::render('auth/login');
// })->name('login');

// Inclure les routes d'authentification
require __DIR__.'/auth.php';

// Routes protégées par auth
Route::middleware(['auth'])->group(function () {




    Route::get('/type-examens', [TypeExamenController::class, 'index'])->name('type-examens.index');
Route::post('/type-examens', [TypeExamenController::class, 'store'])->name('type-examens.store');
Route::put('/type-examens/{typeExamen}', [TypeExamenController::class, 'update'])->name('type-examens.update');
Route::delete('/type-examens/{typeExamen}', [TypeExamenController::class, 'destroy'])->name('type-examens.destroy');

// Laboratoire — utilise AnalyseLaboratoire
Route::get('/laboratoire', [LaboratoireController::class, 'index'])->name('laboratoire.index');
Route::post('/laboratoire', [LaboratoireController::class, 'store'])->name('laboratoire.store');
Route::put('/laboratoire/{analyseLaboratoire}/statut', [LaboratoireController::class, 'updateStatut'])->name('laboratoire.statut');
Route::post('/laboratoire/{analyseLaboratoire}/resultats', [LaboratoireController::class, 'storeResultats'])->name('laboratoire.resultats');
Route::put('/laboratoire/{analyseLaboratoire}/valider', [LaboratoireController::class, 'valider'])->name('laboratoire.valider');
Route::delete('/laboratoire/{analyseLaboratoire}', [LaboratoireController::class, 'destroy'])->name('laboratoire.destroy');

// Imagerie
Route::get('/imagerie', [ImagerieController::class, 'index'])->name('imagerie.index');
Route::post('/imagerie', [ImagerieController::class, 'store'])->name('imagerie.store');
Route::put('/imagerie/{examenImagerie}/statut', [ImagerieController::class, 'updateStatut'])->name('imagerie.statut');
Route::post('/imagerie/{examenImagerie}/conclusion', [ImagerieController::class, 'storeConclusion'])->name('imagerie.conclusion');
Route::delete('/imagerie/{examenImagerie}', [ImagerieController::class, 'destroy'])->name('imagerie.destroy');


// Modalités d'imagerie
Route::get('/modalite-imagerie', [ModaliteImagerieController::class, 'index'])->name('modalite-imagerie.index');
Route::post('/modalite-imagerie', [ModaliteImagerieController::class, 'store'])->name('modalite-imagerie.store');
Route::put('/modalite-imagerie/{modaliteImagerie}', [ModaliteImagerieController::class, 'update'])->name('modalite-imagerie.update');
Route::delete('/modalite-imagerie/{modaliteImagerie}', [ModaliteImagerieController::class, 'destroy'])->name('modalite-imagerie.destroy');



     Route::get('/categories',        [CategorieMedicamentController::class, 'index'])->name('categories.index');
    Route::post('/categories',       [CategorieMedicamentController::class, 'store'])->name('categories.store');
    Route::put('/categories/{categorieMedicament}',    [CategorieMedicamentController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{categorieMedicament}', [CategorieMedicamentController::class, 'destroy'])->name('categories.destroy');

    // Fournisseurs
    Route::get('/fournisseurs',        [FournisseurController::class, 'index'])->name('fournisseurs.index');
    Route::post('/fournisseurs',       [FournisseurController::class, 'store'])->name('fournisseurs.store');
    Route::put('/fournisseurs/{fournisseur}',    [FournisseurController::class, 'update'])->name('fournisseurs.update');
    Route::delete('/fournisseurs/{fournisseur}', [FournisseurController::class, 'destroy'])->name('fournisseurs.destroy');

    // Routes dossiers médicaux
Route::get('/dossiers-medicaux', [DossierMedicalController::class, 'index'])->name('dossiers-medicaux.index');
Route::get('/patients/{patient}/dossier-medical', [DossierMedicalController::class, 'show'])->name('patients.dossier-medical');
Route::put('/dossiers-medicaux/{dossier}', [DossierMedicalController::class, 'update'])->name('dossiers-medicaux.update');
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::resource('patients', PatientController::class);

      Route::resource('personnel', UserController::class)->parameters([
        'personnel' => 'user'
    ]);

     Route::resource('services', ServiceController::class);
    Route::patch('services/{service}/toggle-status', [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

 
  Route::get('/medicaments',              [MedicamentController::class, 'index'])->name('medicaments.index');
Route::post('/medicaments',             [MedicamentController::class, 'store'])->name('medicaments.store');
Route::put('/medicaments/{medicament}', [MedicamentController::class, 'update'])->name('medicaments.update');
Route::delete('/medicaments/{medicament}', [MedicamentController::class, 'destroy'])->name('medicaments.destroy');

 
Route::get('/admin/roles', [AdminRoleController::class, 'index'])->name('admin.roles.index');
Route::post('/admin/roles', [AdminRoleController::class, 'store'])->name('admin.roles.store');
Route::put('/admin/roles/{role}', [AdminRoleController::class, 'update'])->name('admin.roles.update');
Route::delete('/admin/roles/{role}', [AdminRoleController::class, 'destroy'])->name('admin.roles.destroy');

Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.utilisateurs.index');
Route::post('/admin/users', [AdminUserController::class, 'store'])->name('admin.utilisateurs.store');
Route::put('/admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.utilisateurs.update');
Route::patch('/admin/users/{user}/statut', [AdminUserController::class, 'updateStatut'])->name('admin.utilisateurs.statut');
Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.utilisateurs.destroy');

    // Route::get('/personnel', function () {
    //     return Inertia::render('dashboard/personnel');
    // })->name('personnel.index');

    Route::get('/prescription', function () {
        return Inertia::render('dashboard/prescription');
    })->name('prescriptions.index');

  Route::get('/admin/permissions', function () {
        return Inertia::render('admin/permission');
    })->name('permissions.index');





    Route::get('/agenda', function () {
        return Inertia::render('dashboard/agenda');
    })->name('agenda.index');

    // Admin routes
    Route::get('/admin', function () {
        return Inertia::render('admin/index');
    })->name('admin.index');

 

    Route::get('/admin/role', function () {
        return Inertia::render('admin/role');
    })->name('admin.role');

    Route::get('/admin/services', function () {
        return Inertia::render('admin/services');
    })->name('admin.services');

    Route::get('/admin/parameters', function () {
        return Inertia::render('admin/parameters');
    })->name('admin.parameters');

    Route::get('/admin/session', function () {
        return Inertia::render('admin/session');
    })->name('admin.session');

    Route::get('/admin/room', function () {
        return Inertia::render('admin/room');
    })->name('admin.room');

    Route::get('/admin/patient', function () {
        return Inertia::render('admin/patient');
    })->name('admin.patient');

    Route::get('/admin/agenda', function () {
        return Inertia::render('admin/agenda');
    })->name('admin.agenda');

    // Tableau de bord Ségur
    Route::get('/admin/segur/indicateurs', [SegurDashboardController::class, 'index'])
        ->middleware('permission:admin|coordinateur_segur')
        ->name('admin.segur.indicateurs');
});