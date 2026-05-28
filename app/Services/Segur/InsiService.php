<?php

namespace App\Services\Segur;

use App\Models\InsiAppel;
use App\Models\Patient;
use App\Services\Audit\AuditTrailService;
use Exception;

class InsiService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Récupérer l'INS d'un patient via les traits
     */
    public function recupererINSparTraits(array $traits): array
    {
        $this->auditService->log(
            'ins_recuperation_traits_tentee',
            null,
            ['traits_count' => count($traits)],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials INSi');
    }

    /**
     * Récupérer l'INS via une carte Vitale
     */
    public function recupererINSparVitale(string $vitaleData): array
    {
        $this->auditService->log(
            'ins_recuperation_vitale_tentee',
            null,
            ['vitale_data_length' => strlen($vitaleData)],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials INSi');
    }

    /**
     * Qualifier un patient avec l'INS
     */
    public function qualifier(Patient $patient, string $piece_identite_type, string $numero_piece): bool
    {
        $this->auditService->log(
            'ins_qualification_tentee',
            $patient,
            [
                'piece_identite_type' => $piece_identite_type,
                'numero_piece' => $numero_piece,
            ],
            'segur_stub'
        );

        // Validation basique des arguments
        if (empty($piece_identite_type) || empty($numero_piece)) {
            throw new InvalidArgumentException('Type de pièce et numéro requis');
        }

        // Vérifier si le patient n'est pas déjà qualifié
        if ($patient->ins_qualifie) {
            throw new LogicException('Patient déjà qualifié INS');
        }

        // Simuler la qualification
        $patient->update([
            'ins_qualifie' => true,
            'ins_qualifie_at' => now(),
            'ins_qualifie_par_id' => auth()->id(),
        ]);

        $this->auditService->log(
            'ins_qualification_reussie',
            $patient,
            [
                'piece_identite_type' => $piece_identite_type,
                'numero_piece' => $numero_piece,
            ],
            'segur_stub'
        );

        return true;
    }

    /**
     * Logger un appel INSi
     */
    public function logAppel(int $patient_id, string $mode, array $params, string $statut, ?array $reponse = null): InsiAppel
    {
        return InsiAppel::create([
            'patient_id' => $patient_id,
            'demandeur_id' => auth()->id(),
            'mode' => $mode,
            'parametres_appel' => $params,
            'statut' => $statut,
            'reponse_brute' => $reponse,
            'duree_ms' => null, // Sera mis à jour après l'appel
        ]);
    }
}
