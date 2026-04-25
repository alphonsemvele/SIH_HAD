<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategorieMedicamentStoreRequest;
use App\Http\Requests\CategorieMedicamentUpdateRequest;
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

    public function store(CategorieMedicamentStoreRequest $request)
    {
        CategorieMedicament::create($request->validated());

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    public function update(CategorieMedicamentUpdateRequest $request, CategorieMedicament $categorieMedicament)
    {
        $categorieMedicament->update($request->validated());

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