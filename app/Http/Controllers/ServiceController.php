<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceStoreRequest;
use App\Http\Requests\ServiceUpdateRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Service::with(['chefService', 'users', 'lits']);

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('batiment', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
        if ($request->filled('actif')) {
            $query->where('actif', $request->actif === 'true');
        }

        // Filtre par bâtiment
        if ($request->filled('batiment')) {
            $query->where('batiment', $request->batiment);
        }

        // Statistiques
        $stats = [
            'total' => Service::count(),
            'actifs' => Service::where('actif', true)->count(),
            'totalLits' => Service::sum('capacite_lits') ?? 0,
            'totalPersonnel' => User::whereNotNull('service_id')->count(),
        ];

        $services = $query->latest()->paginate(12)->withQueryString();
        
        // Liste des bâtiments pour le filtre
        $batiments = Service::whereNotNull('batiment')
            ->where('batiment', '!=', '')
            ->distinct()
            ->pluck('batiment')
            ->filter()
            ->values();

        // Liste des médecins pour le chef de service
        $medecins = User::where('fonction', 'Médecin')
            ->where('statut', 'En service')
            ->get(['id', 'name', 'lastname', 'matricule']);

        return Inertia::render('dashboard/services', [
            'services' => $services,
            'stats' => $stats,
            'filters' => $request->only(['search', 'actif', 'batiment']),
            'batiments' => $batiments,
            'medecins' => $medecins,
        ]);
    }

    public function store(ServiceStoreRequest $request): RedirectResponse
    {
        // Générer un code unique
        $lastService = Service::withTrashed()->orderBy('id', 'desc')->first();
        $number = $lastService ? $lastService->id + 1 : 1;
        $code = 'SRV-' . str_pad($number, 3, '0', STR_PAD_LEFT);

        $data = $request->validated();

        Service::create([
            ...$data,
            'code' => $code,
            'actif' => $data['actif'] ?? true,
        ]);

        return redirect()->route('services.index')
            ->with('success', 'Service créé avec succès.');
    }

    public function update(ServiceUpdateRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

        return redirect()->route('services.index')
            ->with('success', 'Service mis à jour avec succès.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        // Vérifier si le service a des utilisateurs
        if ($service->users()->count() > 0) {
            return redirect()->route('services.index')
                ->with('error', 'Impossible de supprimer ce service car il contient du personnel.');
        }

        $service->delete();

        return redirect()->route('services.index')
            ->with('success', 'Service supprimé avec succès.');
    }

    public function toggleStatus(Service $service): RedirectResponse
    {
        $service->update(['actif' => !$service->actif]);

        return redirect()->route('services.index')
            ->with('success', 'Statut du service mis à jour.');
    }
}