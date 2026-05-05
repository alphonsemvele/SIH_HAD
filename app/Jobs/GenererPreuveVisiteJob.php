<?php

namespace App\Jobs;

use App\Models\VisiteHad;
use App\Models\ActeRealise;
use App\Models\ConstanteVitale;
use App\Models\PhotoVisite;
use App\Models\SignatureVisite;
use App\Models\PreuveVisite;
use App\Models\QrScan;
use App\Models\Patient;
use App\Services\Audit\AuditTrailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\DomPDF;

class GenererPreuveVisiteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];

    public function __construct(
        public VisiteHad $visite
    ) {
        $this->visite = $visite;
    }

    public function handle(AuditTrailService $auditService): void
    {
        // Charger toutes les données nécessaires
        $visite = $this->visite->fresh([
            'actesRealises',
            'photosVisite',
            'signatureVisite',
            'qrScans' => fn($q) => $q->orderBy('scanned_at', 'desc'),
            'patient'
        ]);

        // Récupérer le scan QR le plus récent
        $qrScan = QrScan::where('visite_had_id', $visite->id)
            ->orderBy('scanned_at', 'desc')
            ->first();

        // Préparer les données pour le PDF
        $data = [
            'visite' => $visite,
            'qrScan' => $qrScan,
            'patient' => $visite->patient,
            'actes' => $visite->actesRealises,
            'photos' => $visite->photosVisite,
            'signature' => $visite->signatureVisite,
            'constantes' => ConstanteVitale::where('patient_id', $visite->patient_id)
                ->whereDate('date_releve', now()->toDateString())
                ->get(),
        ];

        // Générer le PDF
        $pdf = new DomPDF();
        $pdf->loadHTML(view('pdf.preuve_visite', $data)->render());
        $pdfContent = $pdf->output();

        // Sauvegarder le PDF
        $filename = "preuve_{$visite->id}_" . now()->format('Y-m-d_His') . ".pdf";
        $path = "visites/{$visite->id}/{$filename}";
        Storage::disk('local')->put($path, $pdfContent);

        // Calculer le hash
        $hash = hash('sha256', $pdfContent);

        // Créer ou mettre à jour la PreuveVisite
        PreuveVisite::updateOrCreate(
            ['visite_had_id' => $visite->id],
            [
                'pdf_chemin' => $path,
                'pdf_hash_sha256' => $hash,
                'pdf_taille_octets' => strlen($pdfContent),
                'contenu_synthese' => [
                    'actes_count' => $visite->actesRealises->count(),
                    'photos_count' => $visite->photosVisite->count(),
                    'signature_presente' => !is_null($visite->signatureVisite),
                    'qr_scan_id' => $qrScan?->id,
                ],
                'genere_a' => now(),
            ]
        );

        // Log d'audit
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
