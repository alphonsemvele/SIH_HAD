<?php

namespace App\Http\Middleware;

use App\Services\Audit\AuditTrailService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class LogApiAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Loguer uniquement les appels API authentifiés
        if (Auth::check() && $request->is('api/*')) {
            app(AuditTrailService::class)->log(
                'api_access',
                null,
                [
                    'http_method' => $request->method(),
                    'endpoint' => $request->path(),
                    'http_status' => $response->getStatusCode(),
                ],
                'api_access'
            );
        }
        
        return $response;
    }
}
