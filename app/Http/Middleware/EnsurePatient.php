<?php

namespace App\Http\Middleware;

use App\Models\Patient;
use Closure;
use Illuminate\Http\Request;

class EnsurePatient
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! ($user instanceof Patient)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux patients',
            ], 403);
        }

        return $next($request);
    }
}
