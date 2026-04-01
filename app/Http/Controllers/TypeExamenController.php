<?php

namespace App\Http\Controllers;

use App\Models\TypeExamen;
use App\Models\ModaliteImagerie;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TypeExamenController extends Controller
{
    public function index(Request $request)
    {
        $query = TypeExamen::with('modaliteImagerie')
            ->withCount(['analyses', 'examensImagerie'])
            ->when($request->search, fn($q) =>
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->when($request->module && $request->module !== 'tous', fn($q) =>
                $q->where('module', $request->module)
            )
            ->when($request->categorie, fn($q) =>
                $q->where('categorie', $request->categorie)
            )
            ->when($request->modalite_id, fn($q) =>
                $q->where('modalite_imagerie_id', $request->modalite_id)
            )
            ->when($request->actif !== null && $request->actif !== '', fn($q) =>
                $q->where('actif', (bool) $request->actif)
            )
            ->orderBy('module')->orderBy('nom');

        $typesExamens = $query->paginate(20)->withQueryString()
            ->through(fn($t) => [
                'id'                     => $t->id,
                'code'                   => $t->code,
                'nom'                    => $t->nom,
                'description'            => $t->description,
                'module'                 => $t->module,
                'categorie'              => $t->categorie,
                'modalite_imagerie_id'   => $t->modalite_imagerie_id,
                'modalite_imagerie'      => $t->modaliteImagerie ? [
                    'id'   => $t->modaliteImagerie->id,
                    'code' => $t->modaliteImagerie->code,
                    'nom'  => $t->modaliteImagerie->nom,
                ] : null,
                'prix'                   => $t->prix,
                'duree_minutes'          => $t->duree_minutes,
                'actif'                  => $t->actif,
                'analyses_count'         => $t->analyses_count,
                'examens_imagerie_count' => $t->examens_imagerie_count,
            ]);

        $stats = [
            'total'       => TypeExamen::count(),
            'laboratoire' => TypeExamen::where('module', 'laboratoire')->count(),
            'imagerie'    => TypeExamen::where('module', 'imagerie')->count(),
            'actifs'      => TypeExamen::where('actif', true)->count(),
        ];

        $modalites = ModaliteImagerie::where('actif', true)
            ->orderBy('nom')
            ->get(['id', 'nom', 'code']);

        return Inertia::render('dashboard/types-examens', [
            'typesExamens' => $typesExamens,
            'stats'        => $stats,
            'modalites'    => $modalites,
            'filters'      => $request->only(['search', 'module', 'categorie', 'modalite_id', 'actif']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'                 => 'required|string|max:20|unique:type_examens,code',
            'nom'                  => 'required|string|max:200',
            'description'          => 'nullable|string',
            'module'               => 'required|in:laboratoire,imagerie',
            'categorie'            => 'nullable|string|max:100',
            'modalite_imagerie_id' => 'nullable|integer|exists:modalite_imageries,id',
            'duree_minutes'        => 'nullable|integer|min:1',
            'prix'                 => 'nullable|numeric|min:0',
            'actif'                => 'boolean',
        ]);

        // Nettoyer selon le module
        if ($validated['module'] === 'laboratoire') {
            $validated['modalite_imagerie_id'] = null;
        }
        // if ($validated['module'] === 'imagerie') {
        //     $validated['categorie'] = null;
        // }

        TypeExamen::create($validated);

        return back()->with('success', 'Type d\'examen créé avec succès.');
    }

    public function update(Request $request, TypeExamen $typeExamen)
    {
        $validated = $request->validate([
            'code'                 => 'required|string|max:20|unique:type_examens,code,' . $typeExamen->id,
            'nom'                  => 'required|string|max:200',
            'description'          => 'nullable|string',
            'module'               => 'required|in:laboratoire,imagerie',
            'categorie'            => 'nullable|string|max:100',
            'modalite_imagerie_id' => 'nullable|integer|exists:modalite_imageries,id',
            'duree_minutes'        => 'nullable|integer|min:1',
            'prix'                 => 'nullable|numeric|min:0',
            'actif'                => 'boolean',
        ]);

        if ($validated['module'] === 'laboratoire') {
            $validated['modalite_imagerie_id'] = null;
        }
        if ($validated['module'] === 'imagerie') {
            $validated['categorie'] = null;
        }

        $typeExamen->update($validated);

        return back()->with('success', 'Type d\'examen mis à jour.');
    }

    public function destroy(TypeExamen $typeExamen)
    {
        if ($typeExamen->analyses()->count() > 0 || $typeExamen->examensImagerie()->count() > 0) {
            return back()->withErrors(['delete' => 'Impossible : ce type est utilisé dans des examens existants.']);
        }
        $typeExamen->delete();
        return back()->with('success', 'Type d\'examen supprimé.');
    }
}