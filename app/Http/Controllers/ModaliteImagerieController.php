<?php

namespace App\Http\Controllers;

use App\Models\ModaliteImagerie;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModaliteImagerieController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ModaliteImagerie::withCount(['typeExamens', 'examenImageries'])
            ->when($request->search, fn($q) =>
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
            )
            ->when($request->actif !== null && $request->actif !== '', fn($q) =>
                $q->where('actif', $request->actif)
            )
            ->when($request->disponible !== null && $request->disponible !== '', fn($q) =>
                $q->where('disponible', $request->disponible)
            )
            ->orderBy('nom');

        $modalites = $query->paginate(15)->withQueryString()
            ->through(fn($m) => [
                'id'                    => $m->id,
                'code'                  => $m->code,
                'nom'                   => $m->nom,
                'description'           => $m->description,
                'disponible'            => $m->disponible,
                'actif'                 => $m->actif,
                'type_examens_count'    => $m->type_examens_count,
                'examen_imageries_count'=> $m->examen_imageries_count,
            ]);

        $stats = [
            'total'       => ModaliteImagerie::count(),
            'actives'     => ModaliteImagerie::where('actif', true)->count(),
            'disponibles' => ModaliteImagerie::where('disponible', true)->count(),
            'inactives'   => ModaliteImagerie::where('actif', false)->count(),
        ];

        return Inertia::render('dashboard/modalite-imagerie', [
            'modalites' => $modalites,
            'stats'     => $stats,
            'filters'   => $request->only(['search', 'actif', 'disponible']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:modalite_imageries,code',
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
            'disponible'  => 'boolean',
            'actif'       => 'boolean',
        ]);

        ModaliteImagerie::create($validated);

        return back()->with('success', 'Modalité créée avec succès.');
    }

    public function update(Request $request, ModaliteImagerie $modaliteImagerie)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:modalite_imageries,code,' . $modaliteImagerie->id,
            'nom'         => 'required|string|max:100',
            'description' => 'nullable|string',
            'disponible'  => 'boolean',
            'actif'       => 'boolean',
        ]);

        $modaliteImagerie->update($validated);

        return back()->with('success', 'Modalité mise à jour.');
    }

    public function destroy(ModaliteImagerie $modaliteImagerie)
    {
        if ($modaliteImagerie->typeExamens()->count() > 0 || $modaliteImagerie->examenImageries()->count() > 0) {
            return back()->withErrors(['delete' => 'Impossible de supprimer : cette modalité est utilisée dans des examens.']);
        }

        $modaliteImagerie->delete();

        return back()->with('success', 'Modalité supprimée.');
    }
}