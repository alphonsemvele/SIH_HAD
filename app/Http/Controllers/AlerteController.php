<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlerteController extends Controller
{
    public function index(Request $request)
    {
        $query = Alerte::query();

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_nom', 'like', "%{$search}%")
                  ->orWhere('diagnostic', 'like', "%{$search}%")
                  ->orWhere('alerte', 'like', "%{$search}%")
                  ->orWhere('quartier', 'like', "%{$search}%");
            });
        }

        // Filtre par niveau
        if ($request->filled('niveau')) {
            $query->where('niveau', $request->niveau);
        }

        // Filtre par date
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        $alertes = $query->latest()->get();

        // Statistiques
        $stats = [
            'total' => Alerte::count(),
            'critiques' => Alerte::where('niveau', 'Critique')->count(),
            'urgentes' => Alerte::where('niveau', 'Urgent')->count(),
            'aujourd_hui' => Alerte::whereDate('date', now())->count(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($alertes);
        }
        
        return Inertia::render('dashboard/alertes', [
            'alertes' => $alertes,
            'stats' => $stats,
            'filters' => $request->only(['search', 'niveau', 'date']),
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'patient_nom' => 'required|string|max:255',
            'diagnostic' => 'required|string|max:500',
            'alerte' => 'required|string|max:1000',
            'quartier' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'age' => 'required|integer|min:0|max:150',
            'niveau' => 'required|in:Faible,Moyen,Urgent,Critique',
            'date' => 'required|date',
            'heure' => 'required|string|max:10',
        ]);

        $alerte = Alerte::create($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Alerte créée avec succès',
                'data' => $alerte
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Alerte créée avec succès.');
    }

    public function show(Request $request, Alerte $alerte)
    {
        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($alerte);
        }
        
        return Inertia::render('dashboard/alertes-show', [
            'alerte' => $alerte,
        ]);
    }

    public function update(Request $request, Alerte $alerte): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'patient_nom' => 'sometimes|string|max:255',
            'diagnostic' => 'sometimes|string|max:500',
            'alerte' => 'sometimes|string|max:1000',
            'quartier' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:20',
            'age' => 'sometimes|integer|min:0|max:150',
            'niveau' => 'sometimes|in:Faible,Moyen,Urgent,Critique',
            'date' => 'sometimes|date',
            'heure' => 'sometimes|string|max:10',
        ]);

        $alerte->update($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Alerte mise à jour avec succès',
                'data' => $alerte
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Alerte mise à jour avec succès.');
    }

    public function destroy(Request $request, Alerte $alerte): JsonResponse|RedirectResponse
    {
        $alerte->delete();

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Alerte supprimée avec succès'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Alerte supprimée avec succès.');
    }
}
