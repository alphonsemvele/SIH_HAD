<?php

namespace App\Jobs;

use App\Models\VisiteHad;
use App\Models\PreuveVisite;
use App\Services\Audit\AuditTrailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

class GenererPreuveVisiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $backoff = [60, 300];

    public function __construct(
        public VisiteHad $visite
    ) {}

    public function handle(AuditTrailService $auditService): void
    {
        $visite = VisiteHad::with([
            'patient',
            'actesRealises',
            'photosVisite',
            'signatureVisite',
            'qrScans' => fn($q) => $q->orderBy('scanned_at', 'desc'),
        ])->findOrFail($this->visite->id);

        $qrScan = $visite->qrScans->first();

        // Récupérer le nom de l'intervenant si possible
        $intervenantNom = null;
        if ($qrScan && $qrScan->intervenant_id) {
            $user = \App\Models\User::find($qrScan->intervenant_id);
            $intervenantNom = $user?->name ?? 'Intervenant #' . $qrScan->intervenant_id;
        }

        $data = [
            'visite'          => $visite,
            'qrScan'          => $qrScan,
            'patient'         => $visite->patient,
            'actes'           => $visite->actesRealises ?? collect(),
            'photos'          => $visite->photosVisite ?? collect(),
            'signature'       => $visite->signatureVisite,
            'intervenantNom'  => $intervenantNom,
            'hashAffiche'     => 'pending', // sera remplacé après génération
        ];

        // Premier rendu pour calculer le hash
        $pdfContent = Pdf::loadView('pdf.preuve_visite', $data)->output();
        $hash = hash('sha256', $pdfContent);

        // Re-render avec le vrai hash dans le footer
        $data['hashAffiche'] = substr($hash, 0, 32) . '...';
        $pdfContent = Pdf::loadView('pdf.preuve_visite', $data)->output();

        // Sauvegarder
        $filename = "preuve_{$visite->id}_" . now()->format('Y-m-d_His') . ".pdf";
        $path     = "visites/{$visite->id}/{$filename}";
        Storage::disk('local')->put($path, $pdfContent);

        // Créer/MAJ PreuveVisite
        PreuveVisite::updateOrCreate(
            ['visite_had_id' => $visite->id],
            [
                'qr_scan_id'        => $qrScan?->id,
                'pdf_chemin'        => $path,
                'pdf_hash_sha256'   => $hash,
                'pdf_taille_octets' => strlen($pdfContent),
                'contenu_synthese'  => [
                    'actes_count'        => $visite->actesRealises->count(),
                    'photos_count'       => $visite->photosVisite->count(),
                    'signature_presente' => $visite->signatureVisite !== null,
                    'qr_scan_id'         => $qrScan?->id,
                ],
                'genere_a' => now(),
            ]
        );

        Log::info('Preuve PDF générée', [
            'visite_id' => $visite->id,
            'path' => $path,
            'taille' => strlen($pdfContent),
            'hash' => substr($hash, 0, 16) . '...',
        ]);

        // Audit
        try {
            $auditService->log(
                'preuve_visite_generee',
                $visite,
                ['pdf_path' => $path, 'pdf_hash' => $hash, 'pdf_size' => strlen($pdfContent)],
                'preuve_visite'
            );
        } catch (\Throwable $e) {
            Log::warning('Audit log failed: ' . $e->getMessage());
        }
    }
}
