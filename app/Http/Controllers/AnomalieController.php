<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Anomalie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnomalieController extends Controller
{
    public function index(Request $request): Response
    {
        $anomalies = Anomalie::query()
            ->when($request->search,    fn ($q, $s) => $q->where('nom', 'like', "%{$s}%")
                                                          ->orWhere('categorie', 'like', "%{$s}%"))
            ->when($request->categorie, fn ($q)     => $q->where('categorie', $request->categorie))
            ->orderBy('categorie')
            ->orderBy('nom')
            ->get();

        $categories = Anomalie::whereNotNull('categorie')
            ->distinct()
            ->orderBy('categorie')
            ->pluck('categorie');

        return Inertia::render('dashboard/anomalies-index', [
            'anomalies'  => $anomalies,
            'categories' => $categories,
            'filters'    => $request->only(['search', 'categorie']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nom'         => 'required|string|max:255',
            'categorie'   => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ]);

        Anomalie::create($request->only('nom', 'categorie', 'description'));

        return back()->with('success', 'Anomalie ajoutée.');
    }

    public function update(Request $request, Anomalie $anomalie): RedirectResponse
    {
        $request->validate([
            'nom'         => 'required|string|max:255',
            'categorie'   => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'actif'       => 'boolean',
        ]);

        $anomalie->update($request->only('nom', 'categorie', 'description', 'actif'));

        return back()->with('success', 'Anomalie mise à jour.');
    }

    public function destroy(Anomalie $anomalie): RedirectResponse
    {
        $anomalie->delete();

        return back()->with('success', 'Anomalie supprimée.');
    }
}