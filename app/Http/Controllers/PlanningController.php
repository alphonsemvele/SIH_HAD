<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Planning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request)
    {
        $query = Planning::query();

        // Filtre par date
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filtre par période
        if ($request->filled('debut') && $request->filled('fin')) {
            $query->whereBetween('date', [$request->debut, $request->fin]);
        }

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $plannings = $query->orderBy('date')->orderBy('heure_debut')->get();

        // Statistiques
        $stats = [
            'total' => Planning::count(),
            'aujourd_hui' => Planning::whereDate('date', now())->count(),
            'tournées' => Planning::where('type', 'tournee')->count(),
            'réunions' => Planning::where('type', 'reunion')->count(),
            'formations' => Planning::where('type', 'formation')->count(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($plannings);
        }
        
        return Inertia::render('dashboard/planning', [
            'plannings' => $plannings,
            'stats' => $stats,
            'filters' => $request->only(['date', 'type', 'debut', 'fin']),
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'type' => 'required|in:tournee,reunion,formation,urgence,consultation,autre',
            'date' => 'required|date',
            'heure_debut' => 'required|string|max:10',
            'heure_fin' => 'required|string|max:10',
            'secteur' => 'nullable|string|max:255',
            'lieu' => 'nullable|string|max:255',
        ]);

        $planning = Planning::create($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Événement créé avec succès',
                'data' => $planning
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Événement créé avec succès.');
    }

    public function show(Request $request, Planning $planning)
    {
        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($planning);
        }
        
        return Inertia::render('dashboard/planning-show', [
            'planning' => $planning,
        ]);
    }

    public function update(Request $request, Planning $planning): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => 'sometimes|in:tournee,reunion,formation,urgence,consultation,autre',
            'date' => 'sometimes|date',
            'heure_debut' => 'sometimes|string|max:10',
            'heure_fin' => 'sometimes|string|max:10',
            'secteur' => 'sometimes|string|max:255',
            'lieu' => 'sometimes|string|max:255',
        ]);

        $planning->update($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Événement mis à jour avec succès',
                'data' => $planning
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Événement mis à jour avec succès.');
    }

    public function destroy(Request $request, Planning $planning): JsonResponse|RedirectResponse
    {
        $planning->delete();

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Événement supprimé avec succès'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Événement supprimé avec succès.');
    }
}
