<?php

namespace App\Jobs;

use App\Models\VisiteHad;
use App\Models\PreuveVisite;
use App\Models\QrScan;
use App\Services\Audit\AuditTrailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenererPreuveVisiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public VisiteHad $visite
    ) {}

    public function handle(AuditTrailService $auditService): void
    {
        // Recharger la visite avec les relations
        $visite = VisiteHad::with([
            'patient',
            'actesRealises',
            'photosVisite',
            'signatureVisite',
            'qrScans' => fn($q) => $q->orderBy('scanned_at', 'desc'),
        ])->findOrFail($this->visite->id);

        $qrScan = $visite->qrScans->first();

        $data = [
            'visite'     => $visite,
            'qrScan'     => $qrScan,
            'patient'    => $visite->patient,
            'actes'      => $visite->actesRealises,
            'photos'     => $visite->photosVisite,
            'signature'  => $visite->signatureVisite,
            'constantes' => collect(), // Collection vide - le template skippera la section
        ];

        // Générer le PDF avec la facade Pdf (barryvdh/laravel-dompdf)
        $pdf = Pdf::loadView('pdf.preuve_visite', $data);
        $pdfContent = $pdf->output();

        // Sauvegarder
        $filename = "preuve_{$visite->id}_" . now()->format('Y-m-d_His') . ".pdf";
        $path     = "visites/{$visite->id}/{$filename}";
        Storage::disk('local')->put($path, $pdfContent);

        // Hash
        $hash = hash('sha256', $pdfContent);

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

        // Audit
        $auditService->log(
            'preuve_visite_generee',
            $visite,
            [
                'pdf_path' => $path,
                'pdf_hash' => $hash,
                'pdf_size' => strlen($pdfContent),
            ],
            'preuve_visite'
        );
    }
}
