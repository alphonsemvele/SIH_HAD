<?php

namespace App\Services\Had;

use App\Models\QrCode;
use App\Models\QrScan;
use App\Models\VisiteHad;
use App\Services\Audit\AuditTrailService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Writer\PngWriter;

class QrCodeService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    public function generer(VisiteHad $visite): QrCode
    {
        return DB::transaction(function () use ($visite) {
            $uuid = Str::uuid7();
            
            $payload = [
                'uuid' => $uuid,
                'v' => $visite->id,
                'p' => $visite->patient_id,
                'd' => $visite->heure_prevue?->toIso8601String(),
            ];

            $jsonPayload = json_encode($payload);
            $signature = hash_hmac('sha256', $jsonPayload, config('services.qr.signing_key'));

            $qrCode = QrCode::create([
                'uuid' => $uuid,
                'visite_had_id' => $visite->id,
                'patient_had_id' => $visite->patient_id,
                'creneau_debut' => $visite->heure_prevue,
                'creneau_fin' => $visite->heure_prevue->copy()->addMinutes($visite->duree_prevue ?? 60),
                'statut' => 'actif',
                'payload_signe' => $signature,
                'genere_par_id' => Auth::id() ?: 1, // Utiliser l'utilisateur 1 par défaut pour les tests
                'utilise_a' => null,
            ]);

            $this->auditService->log(
                'qr_code_generated',
                $qrCode,
                ['uuid' => $uuid, 'visite_had_id' => $visite->id],
                'qr_generation'
            );

            return $qrCode;
        });
    }

    public function imageSvg(QrCode $qr): string
    {
        $renderer = new SvgImageBackEnd();
        $qr = $renderer->render($qr->uuid, config('services.qr.base_url') . '/qr/' . $qr->uuid);
        
        $this->auditService->log(
            'qr_code_image_generated',
            $qr,
                ['format' => 'svg', 'uuid' => $qr->uuid],
                'qr_generation'
        );

        return $qr;
    }

    public function imagePng(QrCode $qr): string
    {
        $writer = new PngWriter();
        $qr = $writer->writeString($qr->uuid);
        
        $this->auditService->log(
            'qr_code_image_generated',
            $qr,
                ['format' => 'png', 'uuid' => $qr->uuid],
                'qr_generation'
        );

        return $qr;
    }

    public function verifier(string $payload): ?QrCode
    {
        $data = json_decode(base64_decode($payload), true);
        
        if (!$data || !isset($data['uuid'])) {
            return null;
        }

        $qrCode = QrCode::where('uuid', $data['uuid'])->first();
        
        if (!$qrCode) {
            return null;
        }

        $expectedSignature = hash_hmac('sha256', json_encode([
            'uuid' => $qrCode->uuid,
            'v' => $qrCode->visite_had_id,
            'p' => $qrCode->patient_had_id,
            'd' => $qrCode->creneau_debut->toIso8601String(),
        ]), config('services.qr.signing_key'));

        $actualSignature = $data['signature'] ?? null;

        if ($actualSignature !== $expectedSignature) {
            $this->auditService->log(
                'qr_code_signature_invalid',
                $qrCode,
                ['expected' => $expectedSignature, 'actual' => $actualSignature],
                'qr_verification'
            );
            return null;
        }

        $this->auditService->log(
            'qr_code_signature_valid',
            $qrCode,
                ['uuid' => $qrCode->uuid],
            'qr_verification'
        );

        return $qrCode;
    }

    public function scanner(
        QrCode $qr,
        $intervenant,
        ?float $lat = null,
        ?float $lng = null,
        ?int $precision = null,
        ?array $deviceInfo = null
    ): array {
        return DB::transaction(function () use ($qr, $intervenant, $lat, $lng, $precision, $deviceInfo) {
            // Vérifier que le QR code est valide pour cette visite
            if ($qr->statut !== 'actif') {
                return [
                    'success' => false,
                    'message' => 'QR code non valide ou expiré',
                    'qr_scan' => null,
                ];
            }

            // Vérifier créneau
            $now = now();
            $debut = $qr->creneau_debut;
            $fin = $qr->creneau_fin;
            
            if ($now->lt($debut) || $now->gt($fin)) {
                return [
                    'success' => false,
                    'message' => 'Hors créneau autorisé',
                    'qr_scan' => null,
                ];
            }

            $qrScan = QrScan::create([
                'qr_code_id' => $qr->id,
                'visite_had_id' => $qr->visite_had_id,
                'intervenant_id' => $intervenant->id,
                'scanned_at' => $now,
                'lat' => $lat,
                'lng' => $lng,
                'precision_m' => $precision,
                'statut_scan' => 'accepte',
                'device_info' => $deviceInfo,
            ]);

            $this->auditService->log(
                'qr_code_scanned',
                $qrScan,
                ['uuid' => $qr->uuid, 'lat' => $lat, 'lng' => $lng],
                'qr_scan'
            );

            return [
                'success' => true,
                'message' => 'QR code scanné avec succès',
                'qr_scan' => $qrScan,
            ];
        });
    }

    public function refuserScan(
        QrScan $scan,
        string $motif,
        ?string $typeRefus = 'refuse_intervenant'
    ): array {
        $scan->update([
            'statut_scan' => $typeRefus,
            'motif_refus' => $motif,
        ]);

        $this->auditService->log(
            'qr_code_scan_refused',
            $scan,
                ['motif' => $motif, 'type' => $typeRefus],
                'qr_scan'
        );

        return [
            'success' => false,
            'message' => 'Scan refusé: ' . $motif,
            'qr_scan' => $scan->fresh(),
        ];
    }

    public function revoquer(QrCode $qr, string $motif): void
    {
        $qr->update(['statut' => 'revoque']);

        $this->auditService->log(
            'qr_code_revoked',
            $qr,
                ['motif' => $motif],
                'qr_revocation'
        );
    }

    public function regenerer(QrCode $qr): QrCode
    {
        return DB::transaction(function () use ($qr) {
            // Marquer l'ancien QR comme remplacé
            $qr->update(['statut' => 'revoque']);

            // Créer le nouveau QR code
            $nouveauQr = QrCode::create([
                'uuid' => Str::uuid7(),
                'visite_had_id' => $qr->visite_had_id,
                'patient_had_id' => $qr->patient_had_id,
                'creneau_debut' => $qr->creneau_debut,
                'creneau_fin' => $qr->creneau_fin,
                'statut' => 'actif',
                'payload_signe' => $qr->payload_signe,
                'genere_par_id' => Auth::id() ?: 1, // Utiliser l'utilisateur 1 par défaut pour les tests
                'remplace_qr_id' => $qr->id,
                'utilise_a' => now(),
            ]);

            $this->auditService->log(
                'qr_code_regenerated',
                $nouveauQr,
                ['ancien_uuid' => $qr->uuid, 'nouveau_uuid' => $nouveauQr->uuid],
                'qr_regeneration'
            );

            return $nouveauQr;
        });
    }
}
