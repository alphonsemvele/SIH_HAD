<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use App\Models\CategorieMedicament;
use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class MedicamentController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicament::with(['fournisseur', 'categorieMedicament'])
            ->when($request->search, fn($q) =>
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('dci', 'like', "%{$request->search}%")
            )
            ->when($request->categorie_id, fn($q) =>
                $q->where('categorie_medicament_id', $request->categorie_id)
            )
            ->when($request->statut, function ($q) use ($request) {
                match ($request->statut) {
                    'en_stock'        => $q->whereRaw('stock_actuel > stock_minimum'),
                    'stock_bas'       => $q->whereRaw('stock_actuel > 0 AND stock_actuel <= stock_minimum'),
                    'rupture'         => $q->where('stock_actuel', 0),
                    'peremption'      => $q->whereNotNull('date_expiration')
                                          ->where('date_expiration', '<=', Carbon::now()->addMonths(3)),
                    default          => null,
                };
            })
            ->when($request->fournisseur_id, fn($q) =>
                $q->where('fournisseur_id', $request->fournisseur_id)
            )
            ->orderBy('nom');

        $medicaments = $query->paginate(15)->withQueryString()
            ->through(fn($m) => [
                'id'                  => $m->id,
                'code'                => $m->code,
                'nom'                 => $m->nom,
                'dci'                 => $m->dci,
                'forme'               => $m->forme,
                'dosage'              => $m->dosage,
                'categorie'           => $m->categorieMedicament?->nom,
                'categorie_id'        => $m->categorie_medicament_id,
                'stock_actuel'        => $m->stock_actuel,
                'stock_minimum'       => $m->stock_minimum,
                'stock_maximum'       => $m->stock_maximum,
                'prix_achat'          => $m->prix_achat,
                'prix_vente'          => $m->prix_vente,
                'fournisseur'         => $m->fournisseur?->nom,
                'fournisseur_id'      => $m->fournisseur_id,
                'date_expiration'     => $m->date_expiration?->format('d/m/Y'),
                'ordonnance_obligatoire' => $m->ordonnance_obligatoire,
                'actif'               => $m->actif,
                'statut'              => $this->getStatut($m),
            ]);

        // Stats globales
        $stats = [
            'total'      => Medicament::count(),
            'en_stock'   => Medicament::whereRaw('stock_actuel > stock_minimum')->count(),
            'stock_bas'  => Medicament::whereRaw('stock_actuel > 0 AND stock_actuel <= stock_minimum')->count(),
            'ruptures'   => Medicament::where('stock_actuel', 0)->count(),
            'peremption' => Medicament::whereNotNull('date_expiration')
                               ->where('date_expiration', '<=', Carbon::now()->addMonths(3))
                               ->count(),
        ];

        // Alertes
        $alertes = [
            'ruptures'   => Medicament::where('stock_actuel', 0)->pluck('nom')->take(5)->join(', '),
            'peremption' => Medicament::whereNotNull('date_expiration')
                               ->where('date_expiration', '<=', Carbon::now()->addMonths(3))
                               ->orderBy('date_expiration')
                               ->get(['nom', 'date_expiration'])
                               ->take(5)
                               ->map(fn($m) => $m->nom . ' (' . Carbon::parse($m->date_expiration)->format('d/m/Y') . ')')
                               ->join(', '),
        ];

        // Listes pour les selects du formulaire
        $categories  = CategorieMedicament::where('actif', true)->orderBy('nom')->get(['id', 'nom']);
        $fournisseurs = Fournisseur::where('actif', true)->orderBy('nom')->get(['id', 'nom']);

        return Inertia::render('dashboard/medicaments', [
            'medicaments'  => $medicaments,
            'stats'        => $stats,
            'alertes'      => $alertes,
            'categories'   => $categories,
            'fournisseurs' => $fournisseurs,
            'filters'      => $request->only(['search', 'categorie_id', 'statut', 'fournisseur_id']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'                   => 'required|string|max:20|unique:medicaments,code',
            'nom'                    => 'required|string|max:200',
            'dci'                    => 'required|string|max:200',
            'forme'                  => 'required|string',
            'dosage'                 => 'nullable|string|max:50',
            'categorie_medicament_id'=> 'nullable|exists:categorie_medicaments,id',
            'voie_administration'    => 'nullable|string',
            'conditionnement'        => 'nullable|string|max:100',
            'stock_actuel'           => 'nullable|integer|min:0',
            'stock_minimum'          => 'nullable|integer|min:0',
            'stock_maximum'          => 'nullable|integer|min:0',
            'prix_achat'             => 'nullable|numeric|min:0',
            'prix_vente'             => 'required|numeric|min:0',
            'fournisseur_id'         => 'nullable|exists:fournisseurs,id',
            'date_expiration'        => 'nullable|date',
            'ordonnance_obligatoire' => 'boolean',
            'actif'                  => 'boolean',
            'notes'                  => 'nullable|string',
        ]);

        Medicament::create($validated);

        return back()->with('success', 'Médicament ajouté avec succès.');
    }

    public function update(Request $request, Medicament $medicament)
    {
        $validated = $request->validate([
            'code'                   => 'required|string|max:20|unique:medicaments,code,' . $medicament->id,
            'nom'                    => 'required|string|max:200',
            'dci'                    => 'required|string|max:200',
            'forme'                  => 'required|string',
            'dosage'                 => 'nullable|string|max:50',
            'categorie_medicament_id'=> 'nullable|exists:categorie_medicaments,id',
            'voie_administration'    => 'nullable|string',
            'conditionnement'        => 'nullable|string|max:100',
            'stock_actuel'           => 'nullable|integer|min:0',
            'stock_minimum'          => 'nullable|integer|min:0',
            'stock_maximum'          => 'nullable|integer|min:0',
            'prix_achat'             => 'nullable|numeric|min:0',
            'prix_vente'             => 'required|numeric|min:0',
            'fournisseur_id'         => 'nullable|exists:fournisseurs,id',
            'date_expiration'        => 'nullable|date',
            'ordonnance_obligatoire' => 'boolean',
            'actif'                  => 'boolean',
            'notes'                  => 'nullable|string',
        ]);

        $medicament->update($validated);

        return back()->with('success', 'Médicament mis à jour.');
    }

    public function destroy(Medicament $medicament)
    {
        $medicament->delete();
        return back()->with('success', 'Médicament supprimé.');
    }

    private function getStatut(Medicament $m): string
    {
        if ($m->stock_actuel === 0) return 'Rupture';
        if ($m->date_expiration && Carbon::parse($m->date_expiration)->lte(Carbon::now()->addMonths(3))) return 'Péremption proche';
        if ($m->stock_actuel <= $m->stock_minimum) return 'Stock bas';
        return 'En stock';
    }
}