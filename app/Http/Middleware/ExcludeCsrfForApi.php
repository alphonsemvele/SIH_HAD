<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;
use Illuminate\Http\Request;

class ExcludeCsrfForApi extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Routes d'authentification pour l'API mobile
        'login',
        'logout',
        
        // Routes API mobiles (si vous utilisez api.php)
        'api/*',
        
        // Routes spécifiques pour l'application mobile
        'patients',
        'tournees',
        'dashboard',
        
        // Routes de ressources
        'patients/*',
        'tournees/*',
        'lits/*',
        'lits/occupations/*',
        'medicaments',
        'categories',
        'fournisseurs',
        'laboratoire',
        'imagerie',
        'modalite-imagerie',
        'services',
        'anomalies',
        'dossiers-medicaux',
        'admin/users',
        'admin/roles',
    ];
}
