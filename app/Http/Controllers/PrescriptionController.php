<?php

namespace App\Http\Controllers;

use App\Models\Anomalie;
use App\Models\Medicament;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrescriptionController extends Controller
{
    // ── Index ─────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $query = Prescription::with([
            'patient:id,nom,prenom,date_naissance,sexe',
            'medecin:id,name,lastname',
            'anomalie:id,titre,description,severite,statut',
            'lignePrescriptions.medicament:id,nom,dosage,forme',
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('numero', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn ($q) =>
                      $q->where('nom', 'like', "%{$s}%")
                        ->orWhere('prenom', 'like', "%{$s}%")
                  );
            });
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $paginated = $query->latest()->paginate(15)->withQueryString();

        // ✅ Forcer la clé camelCase "lignePrescriptions" dans le JSON
        // (Laravel sérialise les relations en snake_case par défaut)
        $paginated->getCollection()->transform(fn ($p) => $this->formatPrescription($p));

        $stats = [
            'total'      => Prescription::count(),
            'en_attente' => Prescription::where('statut', 'en_attente')->count(),
            'delivrees'  => Prescription::where('statut', 'delivree')->count(),
            'annulees'   => Prescription::where('statut', 'annulee')->count(),
        ];

        return Inertia::render('dashboard/prescription', [
            'prescriptions' => $paginated,
            'patients'      => Patient::orderBy('nom')->get(['id', 'nom', 'prenom', 'date_naissance', 'sexe']),
            'medicaments'   => Medicament::orderBy('nom')->get(['id', 'nom', 'dosage', 'forme']),
            'stats'         => $stats,
            'filters'       => $request->only(['search', 'statut']),
        ]);
    }

    // ── Store ─────────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'patient_id'                  => ['required', 'exists:patients,id'],
            'anomalie_id'                 => ['nullable', 'exists:anomalies,id'],
            'instructions_generales'      => ['nullable', 'string'],
            'date_validite'               => ['nullable', 'date'],
            'lignes'                      => ['required', 'array', 'min:1'],
            'lignes.*.medicament_id'      => ['required', 'exists:medicaments,id'],
            'lignes.*.posologie'          => ['required', 'string'],
            'lignes.*.duree_jours'        => ['nullable', 'integer', 'min:1'],
            'lignes.*.quantite_prescrite' => ['required', 'integer', 'min:1'],
            'lignes.*.instructions'       => ['nullable', 'string'],
        ]);

        $annee   = now()->year;
        $dernier = Prescription::whereYear('created_at', $annee)->count() + 1;
        $numero  = 'RX-' . $annee . '-' . str_pad($dernier, 4, '0', STR_PAD_LEFT);

        $prescription = Prescription::create([
            'numero'                 => $numero,
            'patient_id'             => $data['patient_id'],
            'medecin_id'             => auth()->id(),
            'anomalie_id'            => $data['anomalie_id'] ?? null,
            'instructions_generales' => $data['instructions_generales'] ?? null,
            'date_prescription'      => now(),
            'date_validite'          => $data['date_validite'] ?? null,
            'statut'                 => 'en_attente',
        ]);

        foreach ($data['lignes'] as $ligne) {
            $prescription->lignePrescriptions()->create([
                'medicament_id'      => $ligne['medicament_id'],
                'posologie'          => $ligne['posologie'],
                'duree_jours'        => $ligne['duree_jours'] ?? null,
                'quantite_prescrite' => $ligne['quantite_prescrite'],
                'instructions'       => $ligne['instructions'] ?? null,
            ]);
        }

        if (!empty($data['anomalie_id'])) {
            Anomalie::where('id', $data['anomalie_id'])->update(['statut' => 'traite']);
        }

        return redirect()->route('prescriptions.index')
            ->with('success', "Prescription {$numero} créée avec succès.");
    }

    // ── Update ────────────────────────────────────────────────────────────

    public function update(Request $request, Prescription $prescription): RedirectResponse
    {
        $data = $request->validate([
            'instructions_generales'      => ['nullable', 'string'],
            'date_validite'               => ['nullable', 'date'],
            'lignes'                      => ['required', 'array', 'min:1'],
            'lignes.*.medicament_id'      => ['required', 'exists:medicaments,id'],
            'lignes.*.posologie'          => ['required', 'string'],
            'lignes.*.duree_jours'        => ['nullable', 'integer', 'min:1'],
            'lignes.*.quantite_prescrite' => ['required', 'integer', 'min:1'],
            'lignes.*.instructions'       => ['nullable', 'string'],
        ]);

        $prescription->update([
            'instructions_generales' => $data['instructions_generales'],
            'date_validite'          => $data['date_validite'],
        ]);

        $prescription->lignePrescriptions()->delete();

        foreach ($data['lignes'] as $ligne) {
            $prescription->lignePrescriptions()->create([
                'medicament_id'      => $ligne['medicament_id'],
                'posologie'          => $ligne['posologie'],
                'duree_jours'        => $ligne['duree_jours'] ?? null,
                'quantite_prescrite' => $ligne['quantite_prescrite'],
                'instructions'       => $ligne['instructions'] ?? null,
            ]);
        }

        return redirect()->back()->with('success', 'Prescription mise à jour.');
    }

    // ── Statut ────────────────────────────────────────────────────────────

    public function updateStatut(Request $request, Prescription $prescription): RedirectResponse
    {
        $request->validate([
            'statut' => ['required', 'in:en_attente,partiellement_delivree,delivree,annulee'],
        ]);

        $prescription->update(['statut' => $request->statut]);

        return back()->with('success', 'Statut mis à jour.');
    }

    // ── Renouveler ────────────────────────────────────────────────────────

    public function renouveler(Prescription $prescription): RedirectResponse
    {
        $annee   = now()->year;
        $dernier = Prescription::whereYear('created_at', $annee)->count() + 1;
        $numero  = 'RX-' . $annee . '-' . str_pad($dernier, 4, '0', STR_PAD_LEFT);

        $nouvelle = $prescription->replicate(['numero', 'statut', 'created_at', 'updated_at']);
        $nouvelle->numero            = $numero;
        $nouvelle->statut            = 'en_attente';
        $nouvelle->date_prescription = now();
        $nouvelle->date_validite     = null;
        $nouvelle->anomalie_id       = null;
        $nouvelle->save();

        foreach ($prescription->lignePrescriptions as $ligne) {
            $nouvelle->lignePrescriptions()->create(
                $ligne->only(['medicament_id', 'posologie', 'duree_jours', 'quantite_prescrite', 'instructions'])
            );
        }

        return redirect()->route('prescriptions.index')
            ->with('success', "Prescription renouvelée : {$numero}");
    }

    // ── Print ─────────────────────────────────────────────────────────────

    public function print(Prescription $prescription): Response
    {
        $prescription->load([
            'patient',
            'medecin',
            'anomalie',
            'lignePrescriptions.medicament:id,nom,dosage,forme',
        ]);

        return Inertia::render('dashboard/prescription-print', [
            'prescription' => $this->formatPrescription($prescription),
        ]);
    }

    // ── Anomalies actives (JSON) ───────────────────────────────────────────

    public function anomaliesActives(Patient $patient): JsonResponse
    {
        $anomalies = Anomalie::where('patient_id', $patient->id)
            ->whereNotIn('statut', ['traite', 'ferme', 'resolu'])
            ->orderByRaw("FIELD(severite, 'critique', 'elevee', 'moderee', 'faible')")
            ->get(['id', 'titre', 'description', 'severite', 'statut', 'created_at']);

        return response()->json($anomalies);
    }

    // ── Helper : forcer les clés camelCase pour le frontend ───────────────

    /**
     * Laravel sérialise les relations en snake_case (ligne_prescriptions).
     * Le frontend React attend camelCase (lignePrescriptions).
     * Cette méthode reconstruit le tableau avec les bonnes clés.
     */
    private function formatPrescription(Prescription $p): array
    {
        return [
            'id'                     => $p->id,
            'numero'                 => $p->numero,
            'statut'                 => $p->statut,
            'instructions_generales' => $p->instructions_generales,
            'date_prescription'      => $p->date_prescription?->toDateTimeString(),
            'date_validite'          => $p->date_validite?->toDateString(),

            'patient'  => $p->patient ? [
                'id'             => $p->patient->id,
                'nom'            => $p->patient->nom,
                'prenom'         => $p->patient->prenom,
                'date_naissance' => $p->patient->date_naissance?->toDateString(),
                'sexe'           => $p->patient->sexe,
            ] : null,

            'medecin'  => $p->medecin ? [
                'id'       => $p->medecin->id,
                'name'     => $p->medecin->name,
                'lastname' => $p->medecin->lastname ?? $p->medecin->name,
            ] : null,

            'anomalie' => $p->anomalie ? [
                'id'          => $p->anomalie->id,
                'titre'       => $p->anomalie->titre,
                'description' => $p->anomalie->description,
                'severite'    => $p->anomalie->severite,
                'statut'      => $p->anomalie->statut,
                'created_at'  => $p->anomalie->created_at?->toDateTimeString(),
            ] : null,

            // ✅ Clé camelCase explicite + relation medicament imbriquée
            'lignePrescriptions' => $p->lignePrescriptions->map(fn ($l) => [
                'id'                 => $l->id,
                'medicament_id'      => $l->medicament_id,
                'posologie'          => $l->posologie,
                'duree_jours'        => $l->duree_jours,
                'quantite_prescrite' => $l->quantite_prescrite,
                'instructions'       => $l->instructions ?? '',
                'medicament'         => $l->medicament ? [
                    'id'    => $l->medicament->id,
                    'nom'   => $l->medicament->nom,
                    'dosage'=> $l->medicament->dosage,
                    'forme' => $l->medicament->forme,
                ] : null,
            ])->values()->all(),
        ];
    }
}