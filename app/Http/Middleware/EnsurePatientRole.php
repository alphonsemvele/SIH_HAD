<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsurePatientRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || $user->fonction !== 'patient') {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux patients',
            ], 403);
        }

        return $next($request);
    }
}
