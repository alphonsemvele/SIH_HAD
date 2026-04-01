<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FournisseurController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Fournisseur::withCount('medicaments')
            ->when($request->search, fn($q) =>
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('contact_nom', 'like', "%{$request->search}%")
            )
            ->when($request->ville && $request->ville !== 'Toutes', fn($q) =>
                $q->where('ville', $request->ville)
            )
            ->when($request->statut && $request->statut !== 'Tous', fn($q) =>
                $q->where('actif', $request->statut === 'Actif')
            )
            ->latest();

        $fournisseurs = $query->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total'           => Fournisseur::count(),
            'actifs'          => Fournisseur::where('actif', true)->count(),
            'total_commandes' => \App\Models\CommandeFournisseur::count(),
            'montant_total'   => \App\Models\CommandeFournisseur::sum('montant_total') ?? 0,
        ];

        // Villes disponibles pour le filtre
        $villes = Fournisseur::distinct()->pluck('ville')->filter()->sort()->values();

        return Inertia::render('dashboard/fournisseurs', [
            'fournisseurs' => $fournisseurs,
            'stats'        => $stats,
            'villes'       => $villes,
            'filters'      => $request->only(['search', 'ville', 'statut']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'                  => 'required|string|max:20|unique:fournisseurs,code',
            'nom'                   => 'required|string|max:150',
            'type'                  => 'required|in:laboratoire,grossiste,importateur',
            'adresse'               => 'nullable|string',
            'ville'                 => 'nullable|string|max:50',
            'pays'                  => 'nullable|string|max:50',
            'telephone'             => 'nullable|string|max:20',
            'email'                 => 'nullable|email|max:100',
            'site_web'              => 'nullable|url|max:200',
            'contact_nom'           => 'nullable|string|max:100',
            'contact_telephone'     => 'nullable|string|max:20',
            'delai_livraison_jours' => 'nullable|integer|min:1',
            'conditions_paiement'   => 'nullable|string',
            'actif'                 => 'boolean',
        ]);

        Fournisseur::create($validated);

        return back()->with('success', 'Fournisseur créé avec succès.');
    }

    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'code'                  => 'required|string|max:20|unique:fournisseurs,code,' . $fournisseur->id,
            'nom'                   => 'required|string|max:150',
            'type'                  => 'required|in:laboratoire,grossiste,importateur',
            'adresse'               => 'nullable|string',
            'ville'                 => 'nullable|string|max:50',
            'pays'                  => 'nullable|string|max:50',
            'telephone'             => 'nullable|string|max:20',
            'email'                 => 'nullable|email|max:100',
            'site_web'              => 'nullable|url|max:200',
            'contact_nom'           => 'nullable|string|max:100',
            'contact_telephone'     => 'nullable|string|max:20',
            'delai_livraison_jours' => 'nullable|integer|min:1',
            'conditions_paiement'   => 'nullable|string',
            'actif'                 => 'boolean',
        ]);

        $fournisseur->update($validated);

        return back()->with('success', 'Fournisseur mis à jour.');
    }

    public function destroy(Fournisseur $fournisseur)
    {
        if ($fournisseur->medicaments()->count() > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer un fournisseur lié à des médicaments.']);
        }

        $fournisseur->delete();

        return back()->with('success', 'Fournisseur supprimé.');
    }
}