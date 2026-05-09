<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSegurAccess
{
    /**
     * Restreint l'accès aux utilisateurs ayant le rôle 'admin' ou 'coordinateur_segur'.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Non authentifié'], 401)
                : redirect()->route('login');
        }

        $rolesAutorises = ['admin', 'coordinateur_segur'];

        $aLeBonRole = $user->roles()
            ->whereIn('nom', $rolesAutorises)
            ->exists();

        if (! $aLeBonRole) {
            return $request->expectsJson()
                ? response()->json(['message' => 'Accès refusé : rôle Ségur requis'], 403)
                : abort(403, 'Accès refusé : rôle Ségur requis');
        }

        return $next($request);
    }
}