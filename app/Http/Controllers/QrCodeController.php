<?php

namespace App\Http\Controllers;

use App\Models\QrCode;
use App\Models\VisiteHad;
use App\Services\Had\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class QrCodeController extends Controller
{
    public function __construct(
        private QrCodeService $qrCodeService
    ) {}

    public function store(int $visite): JsonResponse
    {
        $visiteHad = VisiteHad::findOrFail($visite);
        $qrCode = $this->qrCodeService->generer($visiteHad);

        return response()->json([
            'uuid' => $qrCode->uuid,
            'payload_signe' => $qrCode->payload_signe,
            'creneau_debut' => $qrCode->creneau_debut,
            'creneau_fin' => $qrCode->creneau_fin,
            'statut' => $qrCode->statut,
            'image_url' => url("/api/had/qr-codes/{$qrCode->uuid}/preview"),
        ], 201);
    }

    public function preview(string $uuid): Response
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();
        $url = config('services.qr.base_url', 'http://localhost:8000') . '/qr/' . $qrCode->uuid;

        $endroidQr = new \Endroid\QrCode\QrCode(
            data: $url,
            size: 300,
            margin: 10
        );

        $writer = new \Endroid\QrCode\Writer\PngWriter();
        $result = $writer->write($endroidQr);

        return response($result->getString())
            ->header('Content-Type', $result->getMimeType())
            ->header('Cache-Control', 'public, max-age=3600');
    }

    public function scan(string $uuid, Request $request): JsonResponse
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();
        $user = $request->user();

        $result = $this->qrCodeService->scanner(
            $qrCode,
            $user,
            $request->input('lat'),
            $request->input('lng'),
            $request->input('precision_m'),
            $request->input('device_info')
        );

        // Si scan accepté, enrichir la réponse pour le mobile
        if (($result['success'] ?? false) === true) {
            $visite = VisiteHad::with([
                'patient:id,nom,prenom,date_naissance,sexe,telephone,adresse,ville',
                'tournee:id,soignant_id,date,heure_debut_prevue',
                'tournee.soignant:id,name',
            ])->find($qrCode->visite_had_id);

            // Plan de soins / actes prévus (si table dispo, sinon collection vide)
            $actesPrevus = collect();
            if (Schema::hasTable('plans_soins_prestations')) {
                $actesPrevus = DB::table('plans_soins_prestations')
                    ->where('patient_had_id', $qrCode->patient_had_id)
                    ->select('id', 'libelle', 'code_ccam', 'frequence', 'duree_minutes')
                    ->get();
            }

            $result['visite'] = $visite;
            $result['actes_prevus'] = $actesPrevus;
        }

        return response()->json($result, ($result['success'] ?? false) ? 200 : 422);
    }

    public function revoquer(string $uuid, Request $request): JsonResponse
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();
        $this->qrCodeService->revoquer($qrCode, $request->input('motif', 'non spécifié'));

        return response()->json(['message' => 'QR code révoqué']);
    }

    public function regenerer(string $uuid): JsonResponse
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();
        $nouveau = $this->qrCodeService->regenerer($qrCode);

        return response()->json([
            'uuid' => $nouveau->uuid,
            'payload_signe' => $nouveau->payload_signe,
            'creneau_debut' => $nouveau->creneau_debut,
            'creneau_fin' => $nouveau->creneau_fin,
            'statut' => $nouveau->statut,
        ], 201);
    }
}
