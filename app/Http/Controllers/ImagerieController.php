<?php

namespace App\Http\Controllers;

use App\Models\ExamenImagerie;
use App\Models\ModaliteImagerie;
use App\Models\TypeExamen;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ImagerieController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ExamenImagerie::with(['patient', 'typeExamen', 'typeExamen.modaliteImagerie'])
            ->when($request->search, fn($q) =>
                $q->where('numero', 'like', "%{$request->search}%")
                  ->orWhereHas('patient', fn($p) =>
                      $p->where('nom', 'like', "%{$request->search}%")
                        ->orWhere('prenom', 'like', "%{$request->search}%")
                  )
            )
            ->when($request->modalite_id, fn($q) =>
                $q->whereHas('typeExamen', fn($t) =>
                    $t->where('modalite_imagerie_id', $request->modalite_id)
                )
            )
            ->when($request->statut,   fn($q) => $q->where('statut',   $request->statut))
            ->when($request->priorite, fn($q) => $q->where('priorite', $request->priorite))
            ->orderBy('created_at', 'desc');

        $examens = $query->paginate(15)->withQueryString()
            ->through(fn($e) => [
                'id'      => $e->id,
                'numero'  => $e->numero,
                'patient' => [
                    'id'     => $e->patient->id,
                    'nom'    => $e->patient->nom,
                    'prenom' => $e->patient->prenom,
                    'sexe'   => $e->patient->sexe,
                ],
                'type'                     => $e->typeExamen->nom,
                'modalite'                 => $e->typeExamen->modaliteImagerie?->nom ?? '—',
                'modalite_id'              => $e->typeExamen->modalite_imagerie_id,
                'region_anatomique'        => $e->region_anatomique,
                'prescripteur'             => $e->prescripteur,
                'service'                  => $e->service ?? '—',
                'priorite'                 => match($e->priorite) {
                    'urgent'      => 'Urgent',
                    'tres_urgent' => 'Très urgent',
                    default       => 'Normal',
                },
                'priorite_raw'             => $e->priorite,
                'statut'                   => match($e->statut) {
                    'planifie'   => 'Planifié',
                    'en_cours'   => 'En cours',
                    'realise'    => 'Réalisé',
                    'interprete' => 'Interprété',
                    default      => 'En attente',
                },
                'statut_raw'               => $e->statut,
                'date_prescription'        => $e->created_at->format('d/m/Y'),
                'date_examen'              => $e->date_examen?->format('d/m/Y H:i'),
                'salle'                    => $e->salle,
                'technicien'               => $e->technicien,
                'radiologue'               => $e->radiologue,
                'nb_images'                => $e->nb_images ?? 0,
                'conclusion'               => $e->conclusion,
                'renseignements_cliniques' => $e->renseignements_cliniques,
                'contre_indications'       => array_values(array_filter([
                    $e->allergie_iode  ? 'allergie_iode'  : null,
                    $e->grossesse      ? 'grossesse'       : null,
                    $e->pacemaker      ? 'pacemaker'       : null,
                    $e->claustrophobie ? 'claustrophobie'  : null,
                ])),
            ]);

        $stats = [
            'total'       => ExamenImagerie::count(),
            'en_attente'  => ExamenImagerie::where('statut', 'en_attente')->count(),
            'planifies'   => ExamenImagerie::where('statut', 'planifie')->count(),
            'realises'    => ExamenImagerie::where('statut', 'realise')->count(),
            'interpretes' => ExamenImagerie::where('statut', 'interprete')->count(),
            'urgents'     => ExamenImagerie::whereIn('priorite', ['urgent', 'tres_urgent'])->count(),
        ];

        $modalites    = ModaliteImagerie::where('actif', true)->orderBy('nom')->get(['id', 'nom', 'disponible']);
        $typesExamens = TypeExamen::where('module', 'imagerie')->where('actif', true)
            ->orderBy('nom')->get(['id', 'nom', 'modalite_imagerie_id']);
        $patients     = Patient::orderBy('nom')->get(['id', 'nom', 'prenom', 'sexe']);
        $medecins     = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('dashboard/imagerie', [
            'examens'      => $examens,
            'stats'        => $stats,
            'modalites'    => $modalites,
            'typesExamens' => $typesExamens,
            'patients'     => $patients,
            'medecins'     => $medecins,
            'filters'      => $request->only(['search', 'modalite_id', 'statut', 'priorite']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id'               => 'required|exists:patients,id',
            'medecin_prescripteur_id'  => 'required|exists:users,id',
            'type_examen_id'           => 'required|exists:type_examens,id',
            'region_anatomique'        => 'nullable|string|max:100',
            'priorite'                 => 'required|in:normal,urgent,tres_urgent',
            'renseignements_cliniques' => 'nullable|string',
            'contre_indications'       => 'nullable|array',
            'contre_indications.*'     => 'in:allergie_iode,grossesse,pacemaker,claustrophobie',
        ]);

        $ci = $validated['contre_indications'] ?? [];
        $prescripteur = User::find($validated['medecin_prescripteur_id']);

        ExamenImagerie::create([
            'patient_id'               => $validated['patient_id'],
            'type_examen_id'           => $validated['type_examen_id'],
             'medecin_prescripteur_id'  => $validated['medecin_prescripteur_id'],
            'prescripteur'             => $prescripteur?->name ?? '—',
            'date_prescription'        => now(),  
            'type_examen_imagerie_id'  => $validated['type_examen_id'], 
            'region_anatomique'        => $validated['region_anatomique'] ?? null,
            'priorite'                 => $validated['priorite'],
            'renseignements_cliniques' => $validated['renseignements_cliniques'] ?? null,
            'allergie_iode'            => in_array('allergie_iode',  $ci),
            'grossesse'                => in_array('grossesse',       $ci),
            'pacemaker'                => in_array('pacemaker',       $ci),
            'claustrophobie'           => in_array('claustrophobie',  $ci),
            'numero'                   => 'IMG-' . date('Y') . '-' . str_pad(ExamenImagerie::withTrashed()->count() + 1, 4, '0', STR_PAD_LEFT),
            'statut'                   => 'en_attente',
        ]);

        return back()->with('success', 'Demande d\'imagerie envoyée.');
    }

    public function updateStatut(Request $request, ExamenImagerie $examenImagerie)
    {
        $request->validate([
            'statut' => 'required|in:en_attente,planifie,en_cours,realise,interprete',
        ]);

        $data = ['statut' => $request->statut];
        if ($request->statut === 'realise') $data['date_examen'] = now();

        $examenImagerie->update($data);

        return back()->with('success', 'Statut mis à jour.');
    }

    public function storeConclusion(Request $request, ExamenImagerie $examenImagerie)
    {
        $request->validate([
            'conclusion'    => 'required|string',
            'radiologue_id' => 'nullable|exists:users,id',
        ]);

        $examenImagerie->update([
            'conclusion' => $request->conclusion,
            'radiologue' => $request->radiologue_id ? User::find($request->radiologue_id)?->name : null,
            'statut'     => 'interprete',
        ]);

        return back()->with('success', 'Compte-rendu enregistré.');
    }

    public function destroy(ExamenImagerie $examenImagerie)
    {
        $examenImagerie->delete();
        return back()->with('success', 'Examen supprimé.');
    }
}