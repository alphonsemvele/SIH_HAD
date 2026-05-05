<?php

namespace App\Services\Segur;

use App\Models\MssanteCompte;
use App\Models\MssanteMessage;
use App\Models\Patient;
use App\Services\Audit\AuditTrailService;
use Exception;

class MssanteService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Envoyer un message MSSanté
     */
    public function envoyer(
        MssanteCompte $compte,
        string $destinataire,
        string $sujet,
        string $corps,
        array $piecesJointes = [],
        ?string $patientIns = null
    ): MssanteMessage {
        $this->auditService->log(
            'mssante_envoi_tentee',
            null,
            [
                'compte_id' => $compte->id,
                'destinataire' => $destinataire,
                'sujet' => $sujet,
                'pieces_jointes_count' => count($piecesJointes),
                'patient_ins' => $patientIns,
            ],
            'segur_stub'
        );

        // Persister la tentative en statut 'file'
        $message = MssanteMessage::create([
            'compte_id' => $compte->id,
            'sens' => 'sortant',
            'message_id' => $this->generateMessageId(),
            'expediteur' => $compte->adresse,
            'destinataires' => [$destinataire],
            'sujet' => $sujet,
            'corps_texte' => strip_tags($corps),
            'corps_html' => $corps,
            'patient_ins_matricule' => $patientIns,
            'statut' => 'brouillon',
        ]);

        throw new LogicException('non implémenté - en attente de credentials MSSanté');
    }

    /**
     * Relèver les messages d'un compte MSSanté
     */
    public function relever(MssanteCompte $compte): array
    {
        $this->auditService->log(
            'mssante_releve_tentee',
            null,
            ['compte_id' => $compte->id],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials MSSanté');
    }

    /**
     * Chercher dans l'annuaire MSSanté
     */
    public function chercherAnnuaire(array $criteres): array
    {
        $this->auditService->log(
            'mssante_annuaire_tentee',
            null,
            ['criteres' => $criteres],
            'segur_stub'
        );

        throw new LogicException('non implémenté - en attente de credentials MSSanté');
    }

    /**
     * Générer l'adresse MSSanté d'un patient
     */
    public function genererAdressePatient(string $insMatricule): string
    {
        $this->auditService->log(
            'mssante_generation_adresse_patient',
            null,
            ['ins_matricule' => $insMatricule],
            'segur_stub'
        );

        // Format standard : {ins}@patient.mssante.fr
        return strtolower($insMatricule) . '@patient.mssante.fr';
    }

    /**
     * Générer un ID de message unique
     */
    private function generateMessageId(): string
    {
        return uniqid() . '@' . config('app.name');
    }
}
