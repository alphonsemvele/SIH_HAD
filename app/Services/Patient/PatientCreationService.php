<?php

namespace App\Services\Patient;

use App\Models\Patient;
use App\Services\Audit\AuditTrailService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PatientCreationService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    public function create(array $data): Patient
    {
        return DB::transaction(function () use ($data) {
            // Vérifier les doublons avant création
            $duplicates = $this->detectDuplicates($data);
            
            if ($duplicates->isNotEmpty()) {
                Log::warning('Tentative de création de patient avec doublons potentiels', [
                    'data' => $data,
                    'duplicates' => $duplicates->pluck('id')->toArray()
                ]);
            }

            $patient = Patient::create($data);

            // Journaliser la création
            $this->auditService->log(
                'patient_created',
                $patient,
                [
                    'patient_id' => $patient->id,
                    'numero_dossier' => $patient->numero_dossier,
                    'nom' => $data['nom'] ?? null,
                    'prenom' => $data['prenom'] ?? null,
                    'date_naissance' => $data['date_naissance'] ?? null,
                    'telephone' => $data['telephone'] ?? null,
                    'duplicates_detected' => $duplicates->isNotEmpty(),
                    'duplicate_ids' => $duplicates->pluck('id')->toArray(),
                ],
                'patient_creation'
            );

            return $patient;
        });
    }

    public function detectDuplicates(array $data): Collection
    {
        $query = Patient::query();

        // Critère 1: même nom + prénom + date de naissance
        if (!empty($data['nom']) && !empty($data['prenom']) && !empty($data['date_naissance'])) {
            $query->orWhere(function ($q) use ($data) {
                $q->where('nom', $data['nom'])
                   ->where('prenom', $data['prenom'])
                   ->whereDate('date_naissance', $data['date_naissance']);
            });
        }

        // Critère 2: téléphone identique
        if (!empty($data['telephone'])) {
            $query->orWhere('telephone', $data['telephone']);
        }

        // Exclure le patient actuel si on fournit un ID ou un numero_dossier
        if (!empty($data['id'])) {
            $query->where('id', '!=', $data['id']);
        }
        if (!empty($data['numero_dossier'])) {
            $query->where('numero_dossier', '!=', $data['numero_dossier']);
        }

        return $query->get();
    }
}
