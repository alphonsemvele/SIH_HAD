<?php

namespace App\Http\Controllers;

use App\Models\CategorieMedicament;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategorieMedicamentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CategorieMedicament::withCount('medicaments')
            ->when($request->search, fn($q) =>
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->when($request->statut && $request->statut !== 'Tous', fn($q) =>
                $q->where('actif', $request->statut === 'Actif')
            )
            ->latest();

        $categories = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total'            => CategorieMedicament::count(),
            'actives'          => CategorieMedicament::where('actif', true)->count(),
            'inactives'        => CategorieMedicament::where('actif', false)->count(),
            'total_medicaments' => CategorieMedicament::withCount('medicaments')->get()->sum('medicaments_count'),
        ];

        return Inertia::render('dashboard/categories', [
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'statut']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:categorie_medicaments,code',
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
            'couleur'     => 'nullable|string|max:7',
            'actif'       => 'boolean',
        ]);

        CategorieMedicament::create($validated);

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    public function update(Request $request, CategorieMedicament $categorieMedicament)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:categorie_medicaments,code,' . $categorieMedicament->id,
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
            'couleur'     => 'nullable|string|max:7',
            'actif'       => 'boolean',
        ]);

        $categorieMedicament->update($validated);

        return back()->with('success', 'Catégorie mise à jour.');
    }

    public function destroy(CategorieMedicament $categorieMedicament)
    {
        if ($categorieMedicament->medicaments()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer une catégorie liée à des médicaments.']);
        }

        $categorieMedicament->delete();

        return back()->with('success', 'Catégorie supprimée.');
    }
}