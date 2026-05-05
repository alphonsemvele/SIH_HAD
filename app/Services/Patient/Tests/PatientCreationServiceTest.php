<?php

namespace App\Services\Patient\Tests;

use App\Models\Patient;
use App\Services\Audit\AuditTrailService;
use App\Services\Patient\PatientCreationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PatientCreationServiceTest extends TestCase
{
    use RefreshDatabase;

    private PatientCreationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(PatientCreationService::class);
    }

    public function test_creates_patient_successfully()
    {
        $patientData = [
            'numero_dossier' => 'PAT-TEST-001',
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'date_naissance' => '1990-01-15',
            'telephone' => '0123456789',
            'email' => 'jean.dupont@example.com',
            'adresse' => '123 rue de la Paix',
            'sexe' => 'M',
            'lieu_naissance' => 'Paris',
            'nationalite' => 'Française',
            'cni' => '123456789012',
            'situation_matrimoniale' => 'Célibataire',
            'groupe_sanguin' => 'A+',
            'statut' => 'Consultation',
        ];

        $patient = $this->service->create($patientData);

        $this->assertInstanceOf(Patient::class, $patient);
        $this->assertEquals('Dupont', $patient->nom);
        $this->assertEquals('Jean', $patient->prenom);
        $this->assertEquals('1990-01-15', $patient->date_naissance->format('Y-m-d'));
        $this->assertEquals('0123456789', $patient->telephone);
        $this->assertDatabaseHas('patients', [
            'nom' => 'Dupont',
            'prenom' => 'Jean',
            'telephone' => '0123456789',
        ]);
    }

    public function test_detects_duplicate_by_name_and_dob()
    {
        // Créer un patient existant
        $existingPatient = Patient::factory()->create();

        // Données de nouveau patient avec même nom+prénom+date de naissance
        $duplicateData = [
            'numero_dossier' => 'PAT-TEST-003',
            'nom' => $existingPatient->nom,
            'prenom' => $existingPatient->prenom,
            'date_naissance' => $existingPatient->date_naissance->format('Y-m-d'),
            'telephone' => '0987654321', // téléphone différent
            'email' => 'test@example.com',
            'adresse' => '123 test street',
            'sexe' => 'M',
            'lieu_naissance' => 'Paris',
            'nationalite' => 'Française',
            'cni' => '123456789012',
            'situation_matrimoniale' => 'Célibataire',
            'groupe_sanguin' => 'A+',
            'statut' => 'Consultation',
        ];

        $duplicates = $this->service->detectDuplicates($duplicateData);

        $this->assertCount(1, $duplicates);
        $this->assertEquals($existingPatient->id, $duplicates->first()->id);
    }

    public function test_detects_duplicate_by_telephone()
    {
        // Créer un patient existant
        $existingPatient = Patient::factory()->create();

        // Données de nouveau patient avec même téléphone
        $duplicateData = [
            'numero_dossier' => 'PAT-TEST-004',
            'nom' => 'Martin',
            'prenom' => 'Pierre',
            'date_naissance' => '1975-12-10',
            'telephone' => $existingPatient->telephone,
            'email' => 'test2@example.com',
            'adresse' => '456 test street',
            'sexe' => 'M',
            'lieu_naissance' => 'Paris',
            'nationalite' => 'Française',
            'cni' => '987654321098',
            'situation_matrimoniale' => 'Célibataire',
            'groupe_sanguin' => 'O+',
            'statut' => 'Consultation',
        ];

        $duplicates = $this->service->detectDuplicates($duplicateData);

        $this->assertCount(1, $duplicates);
        $this->assertEquals($existingPatient->id, $duplicates->first()->id);
    }

    public function test_logs_audit_entry()
    {
        $patientData = [
            'numero_dossier' => 'PAT-TEST-002',
            'nom' => 'Test',
            'prenom' => 'Audit',
            'date_naissance' => '2000-01-01',
            'telephone' => '0111222333',
            'email' => 'test.audit@example.com',
            'adresse' => '123 test street',
            'sexe' => 'M',
            'lieu_naissance' => 'Paris',
            'nationalite' => 'Française',
            'cni' => '987654321098',
            'situation_matrimoniale' => 'Célibataire',
            'groupe_sanguin' => 'O+',
            'statut' => 'Consultation',
        ];

        $this->service->create($patientData);

        // Vérifier qu'une entrée d'audit a été créée
        $this->assertDatabaseHas('activity_log', [
            'description' => 'patient_created',
            'subject_type' => Patient::class,
            'module' => 'patient_creation',
        ]);
    }

    public function test_handles_transaction_rollback_on_failure()
    {
        // Forcer une erreur en utilisant une valeur invalide pour une colonne qui ne peut être null
        $this->expectException(\Exception::class);

        $invalidData = [
            'nom' => 'Test',
            'prenom' => 'Error',
            'date_naissance' => 'invalid-date', // Ceci causera une erreur
        ];

        try {
            $this->service->create($invalidData);
        } catch (\Exception $e) {
            // Vérifier qu'aucun patient n'a été créé
            $this->assertDatabaseMissing('patients', [
                'nom' => 'Test',
                'prenom' => 'Error',
            ]);
            throw $e;
        }
    }
}
