<?php

namespace Tests\Feature\Had;

use App\Models\QrCode;
use App\Models\QrScan;
use App\Models\User;
use App\Models\VisiteHad;
use App\Models\PatientHad;
use App\Models\Tournee;
use App\Services\Had\QrCodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class QrCodeServiceTest extends TestCase
{
    use RefreshDatabase;

    private QrCodeService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(QrCodeService::class);
        
        // Configurer une clé de signature pour les tests
        config(['services.qr.signing_key' => 'test_signing_key_123']);
    }

    public function test_generer_creates_active_qr_code()
    {
        $visite = VisiteHad::factory()->create([
            'heure_prevue' => now()->addHours(2),
            'duree_prevue' => 60,
        ]);

        $qrCode = $this->service->generer($visite);

        $this->assertInstanceOf(QrCode::class, $qrCode);
        $this->assertDatabaseHas('qr_codes', [
            'id' => $qrCode->id,
            'uuid' => $qrCode->uuid,
            'visite_had_id' => $visite->id,
            'patient_had_id' => $visite->patient_id,
            'statut' => 'actif',
        ]);
        $this->assertNotNull($qrCode->payload_signe);
        $this->assertEquals($visite->heure_prevue->startOfMinute(), $qrCode->creneau_debut->startOfMinute());
        $this->assertEquals($visite->heure_prevue->copy()->addMinutes(60)->startOfMinute(), $qrCode->creneau_fin->startOfMinute());
    }

    public function test_verifier_accepts_valid_payload()
    {
        $visite = VisiteHad::factory()->create();
        $qrCode = $this->service->generer($visite);

        $verifiedQr = $this->service->verifier($qrCode->payload_signe);

        $this->assertInstanceOf(QrCode::class, $verifiedQr);
        $this->assertEquals($qrCode->id, $verifiedQr->id);
        $this->assertEquals($qrCode->uuid, $verifiedQr->uuid);
    }

    public function test_verifier_rejects_tampered_payload()
    {
        $visite = VisiteHad::factory()->create();
        $qrCode = $this->service->generer($visite);

        // Modifier le payload pour le corrompre
        $tamperedPayload = base64_decode($qrCode->payload_signe);
        $tamperedPayload = substr($tamperedPayload, 0, -1) . 'X'; // Changer le dernier caractère
        $tamperedPayload = base64_encode($tamperedPayload);

        $verifiedQr = $this->service->verifier($tamperedPayload);

        $this->assertNull($verifiedQr);
    }

    public function test_scanner_accepts_valid_scan_in_window()
    {
        // Créer manuellement les dépendances
        $service = \App\Models\Service::factory()->create();
        $tournee = Tournee::factory()->create(['service_id' => $service->id]);
        $patientHad = PatientHad::factory()->create();
        
        $visite = VisiteHad::factory()->create([
            'tournee_id' => $tournee->id,
            'patient_id' => $patientHad->id,
            'heure_prevue' => now()->addMinutes(30),
            'duree_prevue' => 60,
        ]);
        $intervenant = User::factory()->create();
        $qrCode = $this->service->generer($visite);

        $result = $this->service->scanner(
            $qrCode,
            $intervenant,
            48.8566,
            2.3522,
            10
        );

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('qr_scan', $result);
        
        $qrScan = $result['qr_scan'];
        $this->assertInstanceOf(QrScan::class, $qrScan);
        $this->assertEquals($qrCode->id, $qrScan->qr_code_id);
        $this->assertEquals($intervenant->id, $qrScan->intervenant_id);
        $this->assertEquals(48.8566, $qrScan->lat);
        $this->assertEquals(2.3522, $qrScan->lng);
        $this->assertEquals(10, $qrScan->precision_m);
        $this->assertEquals('accepte', $qrScan->statut_scan);

        // Vérifier que le QR code est marqué comme utilisé
        $qrCode->refresh();
        $this->assertEquals('utilise', $qrCode->statut);
        $this->assertNotNull($qrCode->utilise_a);
    }

    public function test_scanner_refuses_outside_creneau()
    {
        // Créer manuellement les dépendances
        $service = \App\Models\Service::factory()->create();
        $tournee = Tournee::factory()->create(['service_id' => $service->id]);
        $patientHad = PatientHad::factory()->create();
        
        $visite = VisiteHad::factory()->create([
            'tournee_id' => $tournee->id,
            'patient_id' => $patientHad->id,
            'heure_prevue' => now()->subHours(2), // Créneau dans le passé
            'duree_prevue' => 60,
        ]);
        $intervenant = User::factory()->create();
        $qrCode = $this->service->generer($visite);

        $result = $this->service->scanner(
            $qrCode,
            $intervenant,
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Hors créneau autorisé', $result['message']);
        $this->assertNull($result['qr_scan']);

        // Vérifier que le QR code n'est PAS marqué comme utilisé
        $qrCode->refresh();
        $this->assertEquals('actif', $qrCode->statut);
        $this->assertNull($qrCode->utilise_a);
    }

    public function test_scanner_refuses_doublon()
    {
        // Créer manuellement les dépendances
        $service = \App\Models\Service::factory()->create();
        $tournee = Tournee::factory()->create(['service_id' => $service->id]);
        $patientHad = PatientHad::factory()->create();
        
        $visite = VisiteHad::factory()->create([
            'tournee_id' => $tournee->id,
            'patient_id' => $patientHad->id,
            'heure_prevue' => now()->addMinutes(30),
            'duree_prevue' => 60,
        ]);
        $intervenant = User::factory()->create();
        $qrCode = $this->service->generer($visite);

        // Premier scan réussi
        $this->service->scanner($qrCode, $intervenant);

        // Deuxième scan du même QR
        $result = $this->service->scanner(
            $qrCode,
            $intervenant,
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Scan refusé', $result['message']);
        $this->assertEquals('refuse_doublon', $result['qr_scan']->statut_scan);
        $this->assertEquals('QR code déjà scanné', $result['qr_scan']->motif_refus);
    }

    public function test_revoquer_marks_as_revoked()
    {
        $visite = VisiteHad::factory()->create();
        $qrCode = $this->service->generer($visite);

        $this->service->revoquer($qrCode, 'Test de révocation');

        $qrCode->refresh();
        $this->assertEquals('revoque', $qrCode->statut);
    }

    public function test_regenerer_creates_new_qr_and_revokes_old()
    {
        // Créer manuellement les dépendances
        $service = \App\Models\Service::factory()->create();
        $tournee = Tournee::factory()->create(['service_id' => $service->id]);
        $patientHad = PatientHad::factory()->create();
        
        $visite = VisiteHad::factory()->create([
            'tournee_id' => $tournee->id,
            'patient_id' => $patientHad->id,
            'heure_prevue' => now()->addMinutes(30),
            'duree_prevue' => 60,
        ]);
        $qrCode1 = $this->service->generer($visite);

        $qrCode2 = $this->service->regenerer($qrCode1);

        // Vérifier le nouveau QR
        $this->assertInstanceOf(QrCode::class, $qrCode2);
        $this->assertEquals('actif', $qrCode2->statut);
        $this->assertEquals($qrCode1->id, $qrCode2->remplace_qr_id);
        $this->assertNotNull($qrCode2->utilise_a);

        // Vérifier l'ancien QR
        $qrCode1->refresh();
        $this->assertEquals('revoque', $qrCode1->statut);

        // Vérifier qu'ils ont la même visite
        $this->assertEquals($qrCode1->visite_had_id, $qrCode2->visite_had_id);
        $this->assertEquals($qrCode1->patient_id, $qrCode2->patient_id);
    }

    public function test_image_svg_returns_svg_string()
    {
        $visite = VisiteHad::factory()->create();
        $qrCode = $this->service->generer($visite);

        $svg = $this->service->imageSvg($qrCode);

        $this->assertIsString($svg);
        $this->assertStringContains('<svg', $svg);
        $this->assertStringContains($qrCode->uuid, $svg);
    }

    public function test_image_png_returns_binary_data()
    {
        $visite = VisiteHad::factory()->create();
        $qrCode = $this->service->generer($visite);

        $png = $this->service->imagePng($qrCode);

        $this->assertIsString($png);
        // Vérifier que c'est bien du binaire PNG (commence par les octets PNG)
        $this->assertStringStartsWith("\x89\x50\x4E\x47\x0D\x0A\x1A\x0A", $png);
    }
}
