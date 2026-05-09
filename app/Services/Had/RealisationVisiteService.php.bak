<?php

namespace App\Services\Had;

use App\Models\VisiteHad;
use App\Models\ActeRealise;
use App\Models\ConstanteVitale;
use App\Models\PhotoVisite;
use App\Models\SignatureVisite;
use App\Models\PreuveVisite;
use App\Models\QrScan;
use App\Models\Patient;
use App\Models\User;
use App\Services\Audit\AuditTrailService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class RealisationVisiteService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    public function enregistrer(VisiteHad $visite, array $data, array $files): VisiteHad
    {
        return DB::transaction(function () use ($visite, $data, $files) {
            // Mettre à jour la visite
            $visite->update([
                'statut' => 'realisee',
                'heure_arrivee' => now()->format('H:i:s'),
                'heure_depart' => now()->format('H:i:s'),
            ]);

            // Créer les actes réalisés
            foreach ($data['actes'] as $acteData) {
                ActeRealise::create([
                    'visite_had_id' => $visite->id,
                    'acte_medical_id' => $acteData['acte_medical_id'] ?? null,
                    'libelle' => $acteData['libelle'],
                    'code_ccam' => $acteData['code_ccam'] ?? null,
                    'observations' => $acteData['observations'] ?? null,
                    'non_prevu' => $acteData['non_prevu'] ?? false,
                    'intervenant_id' => auth()->id(),
                ]);
            }

            // Créer les constantes vitales si présentes
            if (isset($data['constantes'])) {
                $constante = ConstanteVitale::create([
                    'patient_id' => $visite->patient_id,
                    'date_releve' => now(),
                    'tension_systolique' => $data['constantes']['tension_systolique'] ?? null,
                    'tension_diastolique' => $data['constantes']['tension_diastolique'] ?? null,
                    'frequence_cardiaque' => $data['constantes']['frequence_cardiaque'] ?? null,
                    'temperature' => $data['constantes']['temperature'] ?? null,
                    'saturation_oxygene' => $data['constantes']['saturation_oxygene'] ?? null,
                    'glycemie' => $data['constantes']['glycemie'] ?? null,
                    'notes' => $data['constantes']['notes'] ?? null,
                    'releve_par_id' => auth()->id(),
                ]);

                // Mettre à jour la visite avec les constantes
                $visite->update([
                    'temperature' => ($data['constantes']['temperature'] ?? null) . '°C',
                    'tension' => ($data['constantes']['tension_systolique'] ?? null) . '/' . ($data['constantes']['tension_diastolique'] ?? null),
                    'pouls' => ($data['constantes']['frequence_cardiaque'] ?? null) . ' bpm',
                    'saturation' => ($data['constantes']['saturation_oxygene'] ?? null) . '%',
                ]);
            }

            // Stocker les photos
            if (isset($files['photos'])) {
                foreach ($files['photos'] as $index => $photo) {
                    $filename = Str::uuid() . '.jpg';
                    $path = $photo->storeAs("visites/{$visite->id}/photos", $filename, 'public');
                    
                    $imageData = getimagesize(storage_path("app/public/{$path}"));
                    $hash = hash_file(storage_path("app/public/{$path}"));
                    
                    PhotoVisite::create([
                        'visite_had_id' => $visite->id,
                        'chemin' => $path,
                        'hash_sha256' => $hash,
                        'taille_octets' => $imageData['size'] ?? 0,
                        'mime_type' => $imageData['mime'] ?? 'image/jpeg',
                        'exif' => [
                            'width' => $imageData[0] ?? null,
                            'height' => $imageData[1] ?? null,
                        ],
                        'legende' => $data['photos'][$index]['legende'] ?? null,
                        'intervenant_id' => auth()->id(),
                    ]);
                }
            }

            // Stocker la signature
            if (isset($files['signature_image'])) {
                $signatureFile = $files['signature_image'];
                $filename = 'signature.png';
                $path = $signatureFile->storeAs("visites/{$visite->id}", $filename, 'public');
                $hash = hash_file(storage_path("app/public/{$path}"));
                
                SignatureVisite::create([
                    'visite_had_id' => $visite->id,
                    'signataire_type' => $data['signataire'] ?? 'patient',
                    'aidant_id' => $data['aidant_id'] ?? null,
                    'chemin_image_png' => $path,
                    'hash_sha256' => $hash,
                    'motif_refus' => $data['signataire'] === 'refus' ? ($data['motif_refus'] ?? 'Refus de signer') : null,
                    'signe_a' => now(),
                ]);
            }

            // Mettre à jour les observations et commentaires
            $visite->update([
                'observations' => $data['commentaires'] ?? $visite->observations,
                'notes_soignant' => $data['notes_soignant'] ?? $visite->notes_soignant,
            ]);

            // Récupérer le scan QR le plus récent
            $qrScan = QrScan::where('visite_had_id', $visite->id)
                ->orderBy('scanned_at', 'desc')
                ->first();

            // Log d'audit
            $this->auditService->log(
                'visite_realisee',
                $visite,
                [
                    'actes_count' => count($data['actes'] ?? []),
                    'constantes_count' => isset($data['constantes']) ? 1 : 0,
                    'photos_count' => isset($files['photos']) ? count($files['photos']) : 0,
                    'signature_presente' => isset($files['signature_image']),
                    'qr_scan_id' => $qrScan?->id,
                    'intervenant_id' => auth()->id(),
                ],
                'realisation_visite'
            );

            // Dispatcher le job de génération de preuve
            dispatch(new \App\Jobs\GenererPreuveVisiteJob($visite));

            return $visite->load([
                'actesRealises',
                'photosVisite',
                'signatureVisite',
                'qrScans' => fn($q) => $q->orderBy('scanned_at', 'desc'),
                'patient'
            ]);
        });
    }
}
