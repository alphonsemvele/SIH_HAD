<?php

namespace App\Services\Had;

use App\Models\VisiteHad;
use App\Models\ActeRealise;
use App\Models\PhotoVisite;
use App\Models\SignatureVisite;
use App\Models\QrScan;
use App\Services\Audit\AuditTrailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RealisationVisiteService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    public function enregistrer(VisiteHad $visite, array $data, array $files): VisiteHad
    {
        return DB::transaction(function () use ($visite, $data, $files) {
            $userId = auth()->id() ?: 3; // fallback admin pour test CLI

            // 1. Mettre à jour la visite (visite_at = horodatage de fin)
            $visite->update([
                'visite_at'      => now(),
                'observations'   => $data['commentaires']   ?? $visite->observations,
                'notes_soignant' => $data['notes_soignant'] ?? $visite->notes_soignant,
            ]);

            // 2. Créer les actes réalisés
            foreach ($data['actes'] as $acteData) {
                ActeRealise::create([
                    'visite_had_id'   => $visite->id,
                    'acte_medical_id' => $acteData['acte_medical_id'] ?? null,
                    'libelle'         => $acteData['libelle'],
                    'code_ccam'       => $acteData['code_ccam'] ?? null,
                    'observations'    => $acteData['observations'] ?? null,
                    'non_prevu'       => $acteData['non_prevu'] ?? false,
                    'intervenant_id'  => $userId,
                    'realise_a'       => now(),
                ]);
            }

            // 3. Constantes vitales : on les colle directement sur la visite
            //    (la table constantes_vitales sera utilisée plus tard si besoin)
            if (isset($data['constantes'])) {
                $c = $data['constantes'];
                $visite->update([
                    'temperature' => isset($c['t']) ? (string) $c['t'] : ($visite->temperature ?? null),
                    'tension'     => (isset($c['ta_systolique']) || isset($c['ta_diastolique']))
                        ? ($c['ta_systolique'] ?? '?') . '/' . ($c['ta_diastolique'] ?? '?')
                        : ($visite->tension ?? null),
                    'pouls'       => isset($c['fc']) ? (string) $c['fc'] : ($visite->pouls ?? null),
                    'saturation'  => isset($c['spo2']) ? (string) $c['spo2'] : ($visite->saturation ?? null),
                ]);
            }

            // 4. Stocker les photos
            if (isset($files['photos'])) {
                foreach ($files['photos'] as $index => $photo) {
                    $filename = Str::uuid() . '.jpg';
                    $path     = $photo->storeAs("visites/{$visite->id}/photos", $filename, 'local');
                    $fullPath = storage_path("app/{$path}");

                    $hash       = hash_file('sha256', $fullPath);
                    $size       = filesize($fullPath);
                    $mime       = mime_content_type($fullPath) ?: 'image/jpeg';
                    $imageData  = @getimagesize($fullPath) ?: [];

                    PhotoVisite::create([
                        'visite_had_id'  => $visite->id,
                        'chemin'         => $path,
                        'hash_sha256'    => $hash,
                        'taille_octets'  => $size,
                        'mime_type'      => $mime,
                        'exif'           => [
                            'width'  => $imageData[0] ?? null,
                            'height' => $imageData[1] ?? null,
                        ],
                        'legende'        => $data['photos'][$index]['legende'] ?? null,
                        'intervenant_id' => $userId,
                    ]);
                }
            }

            // 5. Stocker la signature
            if (isset($files['signature_image'])) {
                $signatureFile = $files['signature_image'];
                $path          = $signatureFile->storeAs("visites/{$visite->id}", 'signature.png', 'local');
                $fullPath      = storage_path("app/{$path}");
                $hash          = hash_file('sha256', $fullPath);

                $signataire    = $data['signataire'] ?? 'patient';
                $motifRefus    = ($signataire === 'refus') ? ($data['motif_refus'] ?? 'Refus de signer') : null;

                SignatureVisite::create([
                    'visite_had_id'    => $visite->id,
                    'signataire_type'  => $signataire,
                    'aidant_id'        => $data['aidant_id'] ?? null,
                    'chemin_image_png' => $path,
                    'hash_sha256'      => $hash,
                    'motif_refus'      => $motifRefus,
                    'signe_a'          => now(),
                ]);
            }

            // 6. Récupérer le scan QR le plus récent (pour l'audit + futur PDF preuve)
            $qrScan = QrScan::where('visite_had_id', $visite->id)
                ->orderBy('scanned_at', 'desc')
                ->first();

            // 7. Log audit
            $this->auditService->log(
                'visite_realisee',
                $visite,
                [
                    'actes_count'        => count($data['actes'] ?? []),
                    'constantes_present' => isset($data['constantes']),
                    'photos_count'       => isset($files['photos']) ? count($files['photos']) : 0,
                    'signature_presente' => isset($files['signature_image']),
                    'qr_scan_id'         => $qrScan?->id,
                    'intervenant_id'     => $userId,
                ],
                'realisation_visite'
            );

            // 8. Dispatcher le job PDF preuve sur la queue 'documents'
            try {
                \App\Jobs\GenererPreuveVisiteJob::dispatch($visite)->onQueue('documents');
            } catch (\Throwable $e) {
                // si le job n'existe pas ou plante, on continue (preuve générable plus tard)
                \Log::warning('GenererPreuveVisiteJob non dispatché: ' . $e->getMessage());
            }

            return $visite->fresh(['patient']);
        });
    }
}
