<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class EnsureSoignant
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user || ! ($user instanceof User)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé au personnel soignant',
            ], 403);
        }

        return $next($request);
    }
}
