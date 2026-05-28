<?php

namespace App\Services\Segur;

use App\Models\SegurDocument;
use App\Models\MesDepot;
use App\Services\Audit\AuditTrailService;
use Exception;

class DmpService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Déposer un document dans le DMP
     */
    public function deposer(SegurDocument $document): MesDepot
    {
        $this->auditService->log(
            'dmp_depot_tentee',
            $document,
            [
                'document_id' => $document->id,
                'type_loinc' => $document->type_loinc,
            ],
            'segur_stub'
        );

        // Persister la tentative en statut 'en_file'
        return MesDepot::create([
            'segur_document_id' => $document->id,
            'statut' => 'en_file',
            'tentatives' => 1,
        ]);
    }

    /**
     * Vérifier un accusé de réception DMP
     */
    public function verifierAccuse(MesDepot $depot): MesDepot
    {
        $this->auditService->log(
            'dmp_verification_accuse_tentee',
            $depot->segurDocument,
            [
                'depot_id' => $depot->id,
                'statut_actuel' => $depot->statut,
            ],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials DMP');
    }
}
