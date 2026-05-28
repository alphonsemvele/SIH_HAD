<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ConsultationController;
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
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\RapportController;

// ─── Page d'accueil ────────────────────────────────────────────────────────────

Route::get('/', function () {
    return Inertia::render('index');
})->name('home');

// ─── Authentification ─────────────────────────────────────────────────────────

require __DIR__.'/auth.php';

// ─── Anomalies ────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])
    ->prefix('anomalies')
    ->name('anomalies.')
    ->group(function () {
        Route::get('/',              [AnomalieController::class, 'index'])  ->name('index');
        Route::post('/',             [AnomalieController::class, 'store'])  ->name('store');
        Route::put('/{anomalie}',    [AnomalieController::class, 'update']) ->name('update');
        Route::delete('/{anomalie}', [AnomalieController::class, 'destroy'])->name('destroy');
    });

// ─── Tournées ─────────────────────────────────────────────────────────────────

Route::middleware(['auth'])
    ->prefix('tournees')
    ->name('tournees.')
    ->group(function () {
        Route::get('/',    [TourneeController::class, 'index'])  ->name('index');
        Route::post('/',   [TourneeController::class, 'store'])  ->name('store');
        Route::get('/{tournee}',   [TourneeController::class, 'show'])    ->name('show');
        Route::put('/{tournee}',   [TourneeController::class, 'update'])  ->name('update');
        Route::delete('/{tournee}',[TourneeController::class, 'destroy']) ->name('destroy');

        // Actions métier
        Route::post('/{tournee}/demarrer',  [TourneeController::class, 'demarrer'])  ->name('demarrer');
        Route::post('/{tournee}/terminer',  [TourneeController::class, 'terminer'])  ->name('terminer');
        Route::post('/{tournee}/suspendre', [TourneeController::class, 'suspendre']) ->name('suspendre');
        Route::post('/{tournee}/annuler',   [TourneeController::class, 'annuler'])   ->name('annuler');

        // Visites
        Route::post('/{tournee}/visites/{visite}/valider',
            [TourneeController::class, 'validerVisite'])->name('visites.valider');
    });

// ─── Occupations de lits ──────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])
    ->prefix('lits/occupations')
    ->name('occupation.')
    ->group(function () {
        Route::get('/',                    [OccupationRoomController::class, 'index'])    ->name('index');
        Route::get('/create',              [OccupationRoomController::class, 'create'])   ->name('create');
        Route::get('/lit/{lit}',           [OccupationRoomController::class, 'parLit'])   ->name('par-lit');
        Route::post('/',                   [OccupationRoomController::class, 'store'])    ->name('store');
        Route::get('/{occupationRoom}',    [OccupationRoomController::class, 'show'])     ->name('show');
        Route::post('/{occupationRoom}/terminer',   [OccupationRoomController::class, 'terminer'])  ->name('terminer');
        Route::post('/{occupationRoom}/transferer', [OccupationRoomController::class, 'transferer'])->name('transferer');
    });

// ─── Rapports ─────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])
    ->prefix('rapports')
    ->name('rapports.')
    ->group(function () {
        Route::get('/',                            [RapportController::class, 'index'])         ->name('index');
        Route::get('/telecharger',                 [RapportController::class, 'telecharger'])   ->name('telecharger');
        Route::get('/{rapport}/retelecharger',     [RapportController::class, 'retelecharger']) ->name('retelecharger');
        Route::delete('/{rapport}',                [RapportController::class, 'destroy'])       ->name('destroy');
    });

// ─── Lits ─────────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])
    ->prefix('lits')
    ->name('lits.')
    ->group(function () {
        Route::get('/',           [LitController::class, 'index'])    ->name('index');
        Route::get('/historique', [LitController::class, 'historique'])->name('historique');
        Route::post('/',          [LitController::class, 'store'])    ->name('store');
        Route::get('/{lit}',      [LitController::class, 'show'])     ->name('show');
        Route::put('/{lit}',      [LitController::class, 'update'])   ->name('update');
        Route::delete('/{lit}',   [LitController::class, 'destroy'])  ->name('destroy');

        Route::post('/{lit}/nettoyage',    [LitController::class, 'marquerNettoyage']) ->name('nettoyage');
        Route::post('/{lit}/disponible',   [LitController::class, 'marquerDisponible'])->name('disponible');
        Route::post('/{lit}/hors-service', [LitController::class, 'horsService'])      ->name('hors-service');
        Route::post('/{lit}/transferer',   [LitController::class, 'transfererLit'])    ->name('transferer-lit');

        Route::get('/service/{service}/chambres',
            [OccupationRoomController::class, 'chambre'])->name('chambres');

        Route::prefix('services')->name('services.')->group(function () {
            Route::post('/',            [ServiceController::class, 'store'])  ->name('store');
            Route::put('/{service}',    [ServiceController::class, 'update']) ->name('update');
            Route::delete('/{service}', [ServiceController::class, 'destroy'])->name('destroy');
        });
    });

// ─── Routes protégées (auth) ──────────────────────────────────────────────────

Route::middleware(['auth'])->group(function () {

    // ── Dashboard ─────────────────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Patients ──────────────────────────────────────────────────────────
    Route::get('/patients/{patient}/anomalies-actives',
        [PrescriptionController::class, 'anomaliesActives']);

    Route::resource('patients', PatientController::class);

    // ── Consultations ─────────────────────────────────────────────────────
    Route::resource('consultations', ConsultationController::class)
         ->except(['show', 'create', 'edit']);

    // ── Dossiers médicaux ─────────────────────────────────────────────────
    Route::get('/dossiers-medicaux',
        [DossierMedicalController::class, 'index'])->name('dossiers-medicaux.index');
    Route::get('/patients/{patient}/dossier-medical',
        [DossierMedicalController::class, 'show'])->name('patients.dossier-medical');
    Route::put('/dossiers-medicaux/{dossier}',
        [DossierMedicalController::class, 'update'])->name('dossiers-medicaux.update');

    // ── Personnel ─────────────────────────────────────────────────────────
    Route::resource('personnel', UserController::class)
         ->parameters(['personnel' => 'user']);

    // ── Services ──────────────────────────────────────────────────────────
    Route::resource('services', ServiceController::class);
    Route::patch('services/{service}/toggle-status',
        [ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

    // ── Médicaments ───────────────────────────────────────────────────────
    Route::get('/medicaments',               [MedicamentController::class, 'index'])  ->name('medicaments.index');
    Route::post('/medicaments',              [MedicamentController::class, 'store'])  ->name('medicaments.store');
    Route::put('/medicaments/{medicament}',  [MedicamentController::class, 'update']) ->name('medicaments.update');
    Route::delete('/medicaments/{medicament}',[MedicamentController::class, 'destroy'])->name('medicaments.destroy');

    // ── Catégories médicaments ────────────────────────────────────────────
    Route::get('/categories',                       [CategorieMedicamentController::class, 'index'])  ->name('categories.index');
    Route::post('/categories',                      [CategorieMedicamentController::class, 'store'])  ->name('categories.store');
    Route::put('/categories/{categorieMedicament}', [CategorieMedicamentController::class, 'update']) ->name('categories.update');
    Route::delete('/categories/{categorieMedicament}',[CategorieMedicamentController::class, 'destroy'])->name('categories.destroy');

    // ── Fournisseurs ──────────────────────────────────────────────────────
    Route::get('/fournisseurs',            [FournisseurController::class, 'index'])  ->name('fournisseurs.index');
    Route::post('/fournisseurs',           [FournisseurController::class, 'store'])  ->name('fournisseurs.store');
    Route::put('/fournisseurs/{fournisseur}',  [FournisseurController::class, 'update']) ->name('fournisseurs.update');
    Route::delete('/fournisseurs/{fournisseur}',[FournisseurController::class, 'destroy'])->name('fournisseurs.destroy');

    // ── Types d'examens ───────────────────────────────────────────────────
    Route::get('/type-examens',                   [TypeExamenController::class, 'index'])  ->name('type-examens.index');
    Route::post('/type-examens',                  [TypeExamenController::class, 'store'])  ->name('type-examens.store');
    Route::put('/type-examens/{typeExamen}',       [TypeExamenController::class, 'update']) ->name('type-examens.update');
    Route::delete('/type-examens/{typeExamen}',    [TypeExamenController::class, 'destroy'])->name('type-examens.destroy');

    // ── Laboratoire ───────────────────────────────────────────────────────
    Route::get('/laboratoire',                                      [LaboratoireController::class, 'index'])        ->name('laboratoire.index');
    Route::post('/laboratoire',                                     [LaboratoireController::class, 'store'])        ->name('laboratoire.store');
    Route::put('/laboratoire/{analyseLaboratoire}/statut',          [LaboratoireController::class, 'updateStatut']) ->name('laboratoire.statut');
    Route::post('/laboratoire/{analyseLaboratoire}/resultats',      [LaboratoireController::class, 'storeResultats'])->name('laboratoire.resultats');
    Route::put('/laboratoire/{analyseLaboratoire}/valider',         [LaboratoireController::class, 'valider'])      ->name('laboratoire.valider');
    Route::delete('/laboratoire/{analyseLaboratoire}',              [LaboratoireController::class, 'destroy'])      ->name('laboratoire.destroy');

    // ── Imagerie ──────────────────────────────────────────────────────────
    Route::get('/imagerie',                            [ImagerieController::class, 'index'])         ->name('imagerie.index');
    Route::post('/imagerie',                           [ImagerieController::class, 'store'])         ->name('imagerie.store');
    Route::put('/imagerie/{examenImagerie}/statut',    [ImagerieController::class, 'updateStatut'])  ->name('imagerie.statut');
    Route::post('/imagerie/{examenImagerie}/conclusion',[ImagerieController::class, 'storeConclusion'])->name('imagerie.conclusion');
    Route::patch('/imagerie/{examenImagerie}/statut',  [ImagerieController::class, 'updateStatut'])  ->name('imagerie.statut.patch');
    Route::patch('/imagerie/{examenImagerie}/conclusion',[ImagerieController::class, 'storeConclusion'])->name('imagerie.conclusion.patch');
    Route::delete('/imagerie/{examenImagerie}',        [ImagerieController::class, 'destroy'])       ->name('imagerie.destroy');

    // ── Modalités d'imagerie ──────────────────────────────────────────────
    Route::get('/modalite-imagerie',                      [ModaliteImagerieController::class, 'index'])  ->name('modalite-imagerie.index');
    Route::post('/modalite-imagerie',                     [ModaliteImagerieController::class, 'store'])  ->name('modalite-imagerie.store');
    Route::put('/modalite-imagerie/{modaliteImagerie}',   [ModaliteImagerieController::class, 'update']) ->name('modalite-imagerie.update');
    Route::delete('/modalite-imagerie/{modaliteImagerie}',[ModaliteImagerieController::class, 'destroy'])->name('modalite-imagerie.destroy');

    // ── Prescriptions ─────────────────────────────────────────────────────
    Route::get('/prescription',                           [PrescriptionController::class, 'index'])       ->name('prescriptions.index');
    Route::post('/prescriptions',                         [PrescriptionController::class, 'store'])        ->name('prescriptions.store');
    Route::put('/prescriptions/{prescription}',           [PrescriptionController::class, 'update'])       ->name('prescriptions.update');
    Route::put('/prescriptions/{prescription}/statut',    [PrescriptionController::class, 'updateStatut']) ->name('prescriptions.statut');
    Route::post('/prescriptions/{prescription}/renouveler',[PrescriptionController::class, 'renouveler'])  ->name('prescriptions.renouveler');
    Route::get('/prescriptions/{prescription}/print',     [PrescriptionController::class, 'print'])        ->name('prescriptions.print');
    Route::get('/patients/{patient}/anomalies-actives',   [PrescriptionController::class, 'anomaliesActives']);

    // ── Admin ─────────────────────────────────────────────────────────────
    Route::get('/admin/roles',           [AdminRoleController::class, 'index'])  ->name('admin.roles.index');
    Route::post('/admin/roles',          [AdminRoleController::class, 'store'])  ->name('admin.roles.store');
    Route::put('/admin/roles/{role}',    [AdminRoleController::class, 'update']) ->name('admin.roles.update');
    Route::delete('/admin/roles/{role}', [AdminRoleController::class, 'destroy'])->name('admin.roles.destroy');

    Route::get('/admin/users',                [AdminUserController::class, 'index'])        ->name('admin.utilisateurs.index');
    Route::post('/admin/users',               [AdminUserController::class, 'store'])        ->name('admin.utilisateurs.store');
    Route::put('/admin/users/{user}',         [AdminUserController::class, 'update'])       ->name('admin.utilisateurs.update');
    Route::patch('/admin/users/{user}/statut',[AdminUserController::class, 'updateStatut']) ->name('admin.utilisateurs.statut');
    Route::delete('/admin/users/{user}',      [AdminUserController::class, 'destroy'])      ->name('admin.utilisateurs.destroy');

    // ── Pages admin statiques ─────────────────────────────────────────────
    Route::get('/admin',             fn () => Inertia::render('admin/index'))      ->name('admin.index');
    Route::get('/admin/permissions', fn () => Inertia::render('admin/permission')) ->name('permissions.index');
    Route::get('/admin/role',        fn () => Inertia::render('admin/role'))       ->name('admin.role');
    Route::get('/admin/services',    fn () => Inertia::render('admin/services'))   ->name('admin.services');
    Route::get('/admin/parameters',  fn () => Inertia::render('admin/parameters')) ->name('admin.parameters');
    Route::get('/admin/session',     fn () => Inertia::render('admin/session'))    ->name('admin.session');
    Route::get('/admin/room',        fn () => Inertia::render('admin/room'))       ->name('admin.room');
    Route::get('/admin/patient',     fn () => Inertia::render('admin/patient'))    ->name('admin.patient');
    Route::get('/admin/agenda',      fn () => Inertia::render('admin/agenda'))     ->name('admin.agenda');

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
        ->middleware('segur.access')
        ->name('admin.segur.indicateurs');
});