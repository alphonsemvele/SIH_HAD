<?php

namespace App\Services\Segur;

use App\Models\Patient;
use App\Services\Audit\AuditTrailService;

class QualificationInsBlocker
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Vérifier si un patient peut être déposé dans le DMP
     */
    public function peutDeposer(Patient $patient): bool
    {
        $this->auditService->log(
            'qualification_ins_depot_check',
            $patient,
            [
                'patient_id' => $patient->id,
                'ins_qualifie' => $patient->ins_qualifie,
            ],
            'segur_stub'
        );

        return $patient->ins_qualifie;
    }

    /**
     * Vérifier si un patient peut recevoir des messages MSSanté
     */
    public function peutEnvoyerMssantePatient(Patient $patient): bool
    {
        $this->auditService->log(
            'qualification_ins_mssante_check',
            $patient,
            [
                'patient_id' => $patient->id,
                'ins_qualifie' => $patient->ins_qualifie,
                'ins_matricule' => $patient->ins_matricule,
            ],
            'segur_stub'
        );

        return $patient->ins_qualifie && !empty($patient->ins_matricule);
    }
}
