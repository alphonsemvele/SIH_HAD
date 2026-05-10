<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Rapport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $query = Rapport::query();

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par période
        if ($request->filled('debut') && $request->filled('fin')) {
            $query->whereBetween('date_rapport', [$request->debut, $request->fin]);
        }

        // Filtre par patient
        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filtre par créateur
        if ($request->filled('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        $rapports = $query->with(['patient', 'creator'])
            ->orderBy('date_rapport', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Statistiques
        $stats = [
            'total' => Rapport::count(),
            'aujourd_hui' => Rapport::whereDate('date_rapport', now())->count(),
            'visites' => Rapport::where('type', 'visite')->count(),
            'tournees' => Rapport::where('type', 'tournee')->count(),
            'incidents' => Rapport::where('type', 'incident')->count(),
            'completes' => Rapport::where('status', 'complet')->count(),
            'en_cours' => Rapport::where('status', 'en_cours')->count(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($rapports);
        }
        
        return Inertia::render('dashboard/rapports', [
            'rapports' => $rapports,
            'stats' => $stats,
            'filters' => $request->only(['type', 'status', 'debut', 'fin', 'patient_id']),
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string|max:5000',
            'type' => 'required|in:visite,tournee,incident,medical,administratif,autre',
            'status' => 'sometimes|in:brouillon,en_cours,complet,annule',
            'date_rapport' => 'required|date',
            'patient_id' => 'nullable|exists:patients,id',
            'tournee_id' => 'nullable|exists:tournees,id',
            'fichier_path' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:2000',
        ]);

        $validated['created_by'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'brouillon';

        $rapport = Rapport::create($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rapport créé avec succès',
                'data' => $rapport->load(['patient', 'creator'])
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Rapport créé avec succès.');
    }

    public function show(Request $request, Rapport $rapport)
    {
        $rapport->load(['patient', 'creator', 'tournee']);

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($rapport);
        }
        
        return Inertia::render('dashboard/rapport-show', [
            'rapport' => $rapport,
        ]);
    }

    public function update(Request $request, Rapport $rapport): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'contenu' => 'sometimes|string|max:5000',
            'type' => 'sometimes|in:visite,tournee,incident,medical,administratif,autre',
            'status' => 'sometimes|in:brouillon,en_cours,complet,annule',
            'date_rapport' => 'sometimes|date',
            'patient_id' => 'sometimes|nullable|exists:patients,id',
            'tournee_id' => 'sometimes|nullable|exists:tournees,id',
            'fichier_path' => 'sometimes|nullable|string|max:500',
            'notes' => 'sometimes|nullable|string|max:2000',
        ]);

        $rapport->update($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rapport mis à jour avec succès',
                'data' => $rapport->load(['patient', 'creator'])
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Rapport mis à jour avec succès.');
    }

    public function destroy(Request $request, Rapport $rapport): JsonResponse|RedirectResponse
    {
        $rapport->delete();

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rapport supprimé avec succès'
            ]);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Rapport supprimé avec succès.');
    }

    public function telecharger(Request $request, $rapport = null)
    {
        // Workaround route model binding bug : récupérer ID depuis URL
        $rapportId = is_object($rapport) ? ($rapport->id ?? null) : $rapport;
        if (!$rapportId) {
            $segments = $request->segments();
            $idx = array_search('rapports', $segments);
            if ($idx !== false && isset($segments[$idx + 1])) {
                $rapportId = (int) $segments[$idx + 1];
            }
        }

        $rapport = \App\Models\Rapport::with(['patient', 'creator'])->find($rapportId);
        if (!$rapport) {
            return response()->json(['success' => false, 'message' => 'Rapport introuvable'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $rapport->id,
                'titre' => $rapport->titre,
                'contenu' => $rapport->contenu,
                'type' => $rapport->type,
                'date_rapport' => $rapport->date_rapport,
                'status' => $rapport->status,
                'patient_nom' => $rapport->patient ? ($rapport->patient->nom . ' ' . $rapport->patient->prenom) : null,
                'creator_nom' => $rapport->creator?->name,
                'notes' => $rapport->notes,
            ]
        ]);
    }

    public function generer(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:visite,tournee,incident,medical,administratif,autre',
            'patient_id' => 'nullable|exists:patients,id',
            'tournee_id' => 'nullable|exists:tournees,id',
            'periode_debut' => 'nullable|date',
            'periode_fin' => 'nullable|date|after_or_equal:periode_debut',
            'template' => 'sometimes|string|max:100',
        ]);

        $user = $request->user();
        
        // Logique de génération automatique de rapport
        $rapport = Rapport::create([
            'titre' => 'Rapport généré automatiquement',
            'contenu' => $this->genererContenuRapport($validated),
            'type' => $validated['type'],
            'status' => 'complet',
            'date_rapport' => now()->toDateString(),
            'patient_id' => $validated['patient_id'] ?? null,
            'tournee_id' => $validated['tournee_id'] ?? null,
            'created_by' => $user->id,
        ]);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Rapport généré avec succès',
                'data' => $rapport->load(['patient', 'creator'])
            ], 201);
        }
        
        // Pour Web: retourner redirect
        return redirect()->back()->with('success', 'Rapport généré avec succès.');
    }

    public function getTypes(Request $request)
    {
        $types = [
            ['value' => 'visite', 'label' => 'Visite patient'],
            ['value' => 'tournee', 'label' => 'Tournée HAD'],
            ['value' => 'incident', 'label' => 'Incident/Accident'],
            ['value' => 'medical', 'label' => 'Rapport médical'],
            ['value' => 'administratif', 'label' => 'Rapport administratif'],
            ['value' => 'autre', 'label' => 'Autre'],
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($types);
        }
        
        return response()->json($types);
    }

    public function getStats(Request $request)
    {
        $stats = [
            'total' => Rapport::count(),
            'aujourd_hui' => Rapport::whereDate('date_rapport', now())->count(),
            'cette_semaine' => Rapport::whereBetween('date_rapport', [
                now()->startOfWeek(),
                now()->endOfWeek()
            ])->count(),
            'ce_mois' => Rapport::whereMonth('date_rapport', now()->month)
                           ->whereYear('date_rapport', now()->year)
                           ->count(),
            'par_type' => Rapport::selectRaw('type, COUNT(*) as count')
                        ->groupBy('type')
                        ->get(),
            'par_status' => Rapport::selectRaw('status, COUNT(*) as count')
                          ->groupBy('status')
                          ->get(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($stats);
        }
        
        return response()->json($stats);
    }

    private function genererContenuRapport(array $data): string
    {
        $contenu = "Rapport généré automatiquement\n\n";
        
        switch ($data['type']) {
            case 'visite':
                $contenu .= "Type: Visite patient\n";
                if (isset($data['patient_id'])) {
                    $patient = \App\Models\Patient::find($data['patient_id']);
                    $contenu .= "Patient: " . $patient->nom . " " . $patient->prenom . "\n";
                }
                $contenu .= "Date: " . now()->toDateString() . "\n";
                $contenu .= "Observations: [À compléter]\n";
                break;
                
            case 'tournee':
                $contenu .= "Type: Rapport de tournée\n";
                if (isset($data['tournee_id'])) {
                    $tournee = \App\Models\Tournee::find($data['tournee_id']);
                    $contenu .= "Tournée: " . $tournee->titre . "\n";
                }
                $contenu .= "Date: " . now()->toDateString() . "\n";
                $contenu .= "Résumé: [À compléter]\n";
                break;
                
            case 'incident':
                $contenu .= "Type: Rapport d'incident\n";
                $contenu .= "Date: " . now()->toDateString() . "\n";
                $contenu .= "Heure: " . now()->toTimeString() . "\n";
                $contenu .= "Description: [À compléter]\n";
                $contenu .= "Actions: [À compléter]\n";
                break;
                
            default:
                $contenu .= "Type: " . $data['type'] . "\n";
                $contenu .= "Date: " . now()->toDateString() . "\n";
                $contenu .= "Contenu: [À compléter]\n";
        }
        
        return $contenu;
    }
}
