<?php

namespace App\Services\Segur;

use App\Models\SegurDocument;
use App\Services\Audit\AuditTrailService;
use DOMDocument;
use DOMElement;
use Exception;

class CdaR2Generator
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Générer une lettre de liaison CDA-R2
     */
    public function genererLettreLiaison(SegurDocument $document, array $data): string
    {
        $this->auditService->log(
            'cda_lettre_liaison_generation',
            $document,
            [
                'document_id' => $document->id,
                'type_loinc' => $document->type_loinc,
            ],
            'segur_stub'
        );

        // Créer le document XML CDA-R2
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->formatOutput = true;

        // Racine ClinicalDocument
        $clinicalDocument = $dom->createElement('ClinicalDocument');
        $clinicalDocument->setAttribute('xmlns', 'urn:hl7-org:v3');
        $clinicalDocument->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $clinicalDocument->setAttribute('classCode', '34133-9');
        $clinicalDocument->setAttribute('moodCode', 'EVN');

        // Header
        $typeId = $dom->createElement('typeId');
        $typeId->setAttribute('root', '2.16.840.1.113883.1.3');
        $typeId->setAttribute('extension', 'POCD_HD000040');
        $clinicalDocument->appendChild($typeId);

        // Record Target
        $recordTarget = $dom->createElement('recordTarget');
        $recordTarget->setAttribute('contextModeCode', 'OP');
        $patientRole = $dom->createElement('patientRole');
        $patientRole->setAttribute('classCode', 'PAT');
        $recordTarget->appendChild($patientRole);
        $clinicalDocument->appendChild($recordTarget);

        // Patient
        $patient = $dom->createElement('patient');
        $patientRole = $dom->createElement('patientRole');
        $patientRole->setAttribute('classCode', 'PAT');
        $patient->appendChild($patientRole);

        // ID du patient (INS)
        $patientId = $dom->createElement('id');
        $patientId->setAttribute('root', '2.16.840.1.113883.4.1');
        $patientId->setAttribute('extension', 'INS');
        $patientId->appendChild($dom->createTextNode($data['patient_ins'] ?? ''));
        $patient->appendChild($patientId);

        $clinicalDocument->appendChild($patient);

        // Auteur
        $author = $dom->createElement('author');
        $assignedAuthor = $dom->createElement('assignedAuthor');
        $assignedAuthor->setAttribute('classCode', 'ASSIGNED');
        
        // ID de l'auteur (RPPS)
        $authorId = $dom->createElement('id');
        $authorId->setAttribute('root', '2.16.840.1.113883.4.1');
        $authorId->setAttribute('extension', 'RPPS');
        $authorId->appendChild($dom->createTextNode($data['auteur_rpps'] ?? ''));
        $assignedAuthor->appendChild($authorId);
        
        $author->appendChild($assignedAuthor);
        $clinicalDocument->appendChild($author);

        // Composant (le document lui-même)
        $component = $dom->createElement('component');
        $structuredBody = $dom->createElement('structuredBody');
        $component2 = $dom->createElement('component');
        $section = $dom->createElement('section');
        $section->setAttribute('classCode', '34133-9');
        
        // Titre
        $title = $dom->createElement('title');
        $title->appendChild($dom->createTextNode($document->libelle));
        $section->appendChild($title);

        // Texte
        $text = $dom->createElement('text');
        $text->appendChild($dom->createTextNode($data['contenu'] ?? ''));
        $section->appendChild($text);

        $component2->appendChild($section);
        $structuredBody->appendChild($component2);
        $component->appendChild($structuredBody);
        $clinicalDocument->appendChild($component);

        $dom->appendChild($clinicalDocument);

        // Sauvegarder le XML
        $xml = $dom->saveXML();
        
        // Créer le répertoire si nécessaire
        $directory = storage_path('app/segur/lettres');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = $document->id . '_lettre_liaison.xml';
        $filepath = $directory . '/' . $filename;
        
        file_put_contents($filepath, $xml);

        return 'segur/lettres/' . $filename;
    }

    /**
     * Générer un CR de fin de séjour HAD
     */
    public function genererCrFinHad(SegurDocument $document, array $data): string
    {
        $this->auditService->log(
            'cda_cr_fin_had_generation',
            $document,
            [
                'document_id' => $document->id,
                'type_loinc' => $document->type_loinc,
            ],
            'segur_stub'
        );

        // Similaire à la lettre de liaison mais avec LOINC 34111-5 (CR de fin de séjour)
        return $this->genererLettreLiaison($document, array_merge($data, [
            'type_loinc' => '34111-5',
            'titre' => 'Compte rendu de fin de séjour HAD'
        ]));
    }

    /**
     * Valider un document CDA-R2
     */
    public function valider(string $xml_chemin): array
    {
        $this->auditService->log(
            'cda_validation_tentee',
            null,
            ['xml_chemin' => $xml_chemin],
            'segur_stub'
        );

        if (!file_exists($xml_chemin)) {
            return ['valide' => false, 'erreurs' => ['Fichier XML non trouvé']];
        }

        $xml = file_get_contents($xml_chemin);
        
        try {
            $dom = new DOMDocument();
            $dom->loadXML($xml);
            
            // Validation basique
            $errors = [];
            
            // Vérifier la racine
            $clinicalDocuments = $dom->getElementsByTagName('ClinicalDocument');
            if ($clinicalDocuments->length === 0) {
                $errors[] = 'Élément racine ClinicalDocument manquant';
            }
            
            // Vérifier l'INS du patient
            $patientIds = $dom->getElementsByTagNameNS('urn:hl7-org:v3', 'id');
            $insTrouve = false;
            foreach ($patientIds as $id) {
                if ($id->getAttribute('extension') === 'INS' && !empty($id->nodeValue)) {
                    $insTrouve = true;
                    break;
                }
            }
            
            if (!$insTrouve) {
                $errors[] = 'INS du patient manquant ou invalide';
            }
            
            // Vérifier le RPPS de l'auteur
            $authorIds = $dom->getElementsByTagNameNS('urn:hl7-org:v3', 'id');
            $rppsTrouve = false;
            foreach ($authorIds as $id) {
                if ($id->getAttribute('extension') === 'RPPS' && !empty($id->nodeValue)) {
                    $rppsTrouve = true;
                    break;
                }
            }
            
            if (!$rppsTrouve) {
                $errors[] = 'RPPS de l\'auteur manquant ou invalide';
            }
            
            return [
                'valide' => empty($errors),
                'erreurs' => $errors
            ];
            
        } catch (Exception $e) {
            return [
                'valide' => false,
                'erreurs' => ['Erreur de parsing XML: ' . $e->getMessage()]
            ];
        }
    }
}
