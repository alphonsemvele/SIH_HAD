<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function patientsMap(Request $request)
    {
        $query = Patient::query();

        // Filtre par quartier
        if ($request->filled('quartier')) {
            $query->where('quartier', 'like', '%' . $request->quartier . '%');
        }

        // Filtre par priorité
        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }

        // Filtre par patients à visiter aujourd'hui
        if ($request->boolean('a_visiter_aujourdhui')) {
            $query->whereHas('visites', function ($q) {
                $q->whereDate('date_visite', now());
            });
        }

        // Filtre par retard de visite
        if ($request->boolean('retard_visite')) {
            $query->whereHas('visites', function ($q) {
                $q->where('date_visite', '<', now())
                   ->where('statut', '!=', 'effectuee');
            });
        }

        $patients = $query
            ->orderBy('priorite', 'desc')
            ->get();

        // Transformer les données pour la carte
        $patientsMap = $patients->map(function ($patient) {
            return [
                'id' => $patient->id,
                'nom' => $patient->nom . ' ' . $patient->prenom,
                'quartier' => $patient->quartier ?? 'Non spécifié',
                'priorite' => $patient->priorite ?? 'Normal',
                'adresse' => $patient->adresse,
                'telephone' => $patient->telephone,
                'latitude' => $patient->latitude,
                'longitude' => $patient->longitude,
                'distance' => $this->calculerDistance($patient->latitude, $patient->longitude),
                'a_visiter_aujourdhui' => false,
                'derniere_visite' => null,
                'prochaine_visite' => null,
                'statut_visite' => null,
            ];
        });

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($patientsMap);
        }
        
        return Inertia::render('dashboard/carte-patients', [
            'patients' => $patientsMap,
            'filters' => $request->only(['quartier', 'priorite', 'a_visiter_aujourdhui', 'retard_visite']),
        ]);
    }

    public function patientsGeolocalises(Request $request)
    {
        $patients = Patient::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $patientsGeo = $patients->map(function ($patient) {
            return [
                'id' => $patient->id,
                'nom' => $patient->nom . ' ' . $patient->prenom,
                'quartier' => $patient->quartier ?? 'Non spécifié',
                'priorite' => $patient->priorite ?? 'Normal',
                'latitude' => $patient->latitude,
                'longitude' => $patient->longitude,
                'icone' => $this->getIconePriorite($patient->priorite),
                'couleur' => $this->getCouleurPriorite($patient->priorite),
                'a_visiter' => $patient->prochaineVisite && $patient->prochaineVisite->date_visite->isToday(),
            ];
        });

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($patientsGeo);
        }
        
        return response()->json($patientsGeo);
    }

    public function patientGeolocalisation(Request $request, Patient $patient)
    {
        $patient->load(['derniereVisite', 'prochaineVisite']);

        $geoData = [
            'id' => $patient->id,
            'nom' => $patient->nom . ' ' . $patient->prenom,
            'adresse' => $patient->adresse,
            'quartier' => $patient->quartier,
            'latitude' => $patient->latitude,
            'longitude' => $patient->longitude,
            'priorite' => $patient->priorite,
            'icone' => $this->getIconePriorite($patient->priorite),
            'couleur' => $this->getCouleurPriorite($patient->priorite),
            'derniere_visite' => $patient->derniereVisite,
            'prochaine_visite' => $patient->prochaineVisite,
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($geoData);
        }
        
        return Inertia::render('dashboard/patient-carte', [
            'patient' => $geoData,
        ]);
    }

    public function updatePatientGeolocalisation(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'adresse' => 'sometimes|string|max:255',
            'quartier' => 'sometimes|string|max:100',
        ]);

        $patient->update($validated);

        // Pour API: retourner JSON
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Géolocalisation mise à jour avec succès',
                'data' => $patient->fresh()
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Géolocalisation mise à jour avec succès'
        ]);
    }

    public function zonesVisites(Request $request)
    {
        $zones = Patient::selectRaw('quartier, COUNT(*) as nombre_patients, AVG(latitude) as centre_lat, AVG(longitude) as centre_lng')
            ->whereNotNull('quartier')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->groupBy('quartier')
            ->orderBy('nombre_patients', 'desc')
            ->get();

        $zonesMap = $zones->map(function ($zone) {
            return [
                'quartier' => $zone->quartier,
                'nombre_patients' => $zone->nombre_patients,
                'centre_lat' => $zone->centre_lat,
                'centre_lng' => $zone->centre_lng,
                'couleur' => $this->getCouleurZone($zone->nombre_patients),
                'patients_critiques' => Patient::where('quartier', $zone->quartier)
                    ->where('priorite', 'Critique')
                    ->count(),
            ];
        });

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($zonesMap);
        }
        
        return response()->json($zonesMap);
    }

    public function itineraireOptimise(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_ids' => 'required|array',
            'patient_ids.*' => 'exists:patients,id',
            'point_depart_lat' => 'required|numeric|between:-90,90',
            'point_depart_lng' => 'required|numeric|between:-180,180',
            'mode_optimisation' => 'sometimes|in:distance,temps,priorite',
        ]);

        $modeOptimisation = $validated['mode_optimisation'] ?? 'priorite';
        $pointDepart = [
            'lat' => $validated['point_depart_lat'],
            'lng' => $validated['point_depart_lng'],
        ];

        $patients = Patient::whereIn('id', $validated['patient_ids'])
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        // Algorithme simple d'optimisation (à améliorer avec un vrai algorithme)
        $itineraire = $this->optimiserItineraire($patients, $pointDepart, $modeOptimisation);

        return response()->json([
            'success' => true,
            'itineraire' => $itineraire,
            'distance_totale' => $this->calculerDistanceItineraire($itineraire),
            'temps_estime' => $this->calculerTempsItineraire($itineraire),
        ]);
    }

    public function statistiquesZones(Request $request)
    {
        $stats = [
            'total_patients' => Patient::count(),
            'patients_geolocalises' => Patient::whereNotNull('latitude')->whereNotNull('longitude')->count(),
            'zones' => Patient::whereNotNull('quartier')->distinct('quartier')->count(),
            'patients_critiques' => Patient::where('priorite', 'Critique')->count(),
            'patients_a_visiter_aujourdhui' => Patient::whereHas('visites', function ($q) {
                $q->whereDate('date_visite', now());
            })->count(),
            'par_quartier' => Patient::selectRaw('quartier, COUNT(*) as total')
                ->whereNotNull('quartier')
                ->groupBy('quartier')
                ->orderBy('total', 'desc')
                ->get(),
            'par_priorite' => Patient::selectRaw('priorite, COUNT(*) as total')
                ->groupBy('priorite')
                ->orderBy('total', 'desc')
                ->get(),
        ];

        // Si la requête vient de l'API mobile → JSON
        if ($request->is('api/*') || $request->wantsJson()) {
            return response()->json($stats);
        }
        
        return response()->json($stats);
    }

    private function getIconePriorite($priorite): string
    {
        return match($priorite) {
            'Critique' => 'warning',
            'Surveillance' => 'watch_later',
            'Normal' => 'person',
            default => 'person',
        };
    }

    private function getCouleurPriorite($priorite): string
    {
        return match($priorite) {
            'Critique' => '#FF4433',
            'Surveillance' => '#FF9800',
            'Normal' => '#4CAF50',
            default => '#9E9E9E',
        };
    }

    private function getCouleurZone($nombrePatients): string
    {
        if ($nombrePatients >= 10) return '#FF4433';
        if ($nombrePatients >= 5) return '#FF9800';
        return '#4CAF50';
    }

    private function calculerDistance($lat1, $lng1, $lat2 = null, $lng2 = null): float
    {
        // Point de référence par défaut (centre de Yaoundé)
        $lat2 = $lat2 ?? 3.8480;
        $lng2 = $lng2 ?? 11.5021;

        if (!$lat1 || !$lng1) return 0.0;

        $theta = $lng1 - $lng2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        
        // Convertir en kilomètres
        return round($miles * 1.609344, 1);
    }

    private function optimiserItineraire($patients, $pointDepart, $mode): array
    {
        $itineraire = [];
        $positionActuelle = $pointDepart;
        $patientsRestants = $patients->collect();

        while ($patientsRestants->isNotEmpty()) {
            $prochainPatient = null;
            $meilleureDistance = PHP_FLOAT_MAX;

            foreach ($patientsRestants as $patient) {
                $distance = $this->calculerDistance(
                    $positionActuelle['lat'], 
                    $positionActuelle['lng'],
                    $patient->latitude, 
                    $patient->longitude
                );

                $score = $distance;
                
                // Bonus de priorité si le mode est priorité
                if ($mode === 'priorite' && $patient->priorite === 'Critique') {
                    $score *= 0.5;
                }

                if ($score < $meilleureDistance) {
                    $meilleureDistance = $score;
                    $prochainPatient = $patient;
                }
            }

            if ($prochainPatient) {
                $itineraire[] = [
                    'patient' => $prochainPatient,
                    'distance' => $meilleureDistance,
                    'ordre' => count($itineraire) + 1,
                ];
                $positionActuelle = [
                    'lat' => $prochainPatient->latitude,
                    'lng' => $prochainPatient->longitude,
                ];
                $patientsRestants = $patientsRestants->reject(fn($p) => $p->id === $prochainPatient->id);
            }
        }

        return $itineraire;
    }

    private function calculerDistanceItineraire($itineraire): float
    {
        $total = 0.0;
        foreach ($itineraire as $etape) {
            $total += $etape['distance'];
        }
        return round($total, 1);
    }

    private function calculerTempsItineraire($itineraire): int
    {
        // Estimation: 3 minutes par km + 15 minutes par patient
        $tempsKm = $this->calculerDistanceItineraire($itineraire) * 3;
        $tempsVisites = count($itineraire) * 15;
        
        return round($tempsKm + $tempsVisites);
    }
}
