<?php

namespace App\Http\Controllers;

use App\Http\Resources\QrCodeResource;
use App\Models\QrCode;
use App\Models\VisiteHad;
use App\Services\Had\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class QrCodeController extends Controller
{
    public function __construct(
        private QrCodeService $qrCodeService
    ) {}

    public function store(VisiteHad $visite): JsonResponse
    {
        $qrCode = $this->qrCodeService->generer($visite);

        return response()->json([
            'uuid' => $qrCode->uuid,
            'payload_signe' => $qrCode->payload_signe,
            'image_svg' => $this->qrCodeService->imageSvg($qrCode),
            'creneau_debut' => $qrCode->creneau_debut,
            'creneau_fin' => $qrCode->creneau_fin,
            'statut' => $qrCode->statut,
        ], 201);
    }

    public function preview(string $uuid): Response
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();
        $pngImage = $this->qrCodeService->imagePng($qrCode);

        return response($pngImage)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    public function scan(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'payload_signe' => 'required|string',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'precision_m' => 'nullable|integer|min:0|max:1000',
            'device_info' => 'nullable|array',
        ]);

        $qrCode = $this->qrCodeService->verifier($request->payload_signe);

        if (!$qrCode) {
            return response()->json([
                'success' => false,
                'message' => 'QR code invalide ou signature incorrecte',
            ], 422);
        }

        $result = $this->qrCodeService->scanner(
            $qrCode,
            $request->user(),
            $request->lat,
            $request->lng,
            $request->precision_m,
            $request->device_info
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    public function revoquer(Request $request, string $uuid): JsonResponse
    {
        $request->validate([
            'motif' => 'required|string|max:500',
        ]);

        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();

        $this->qrCodeService->revoquer($qrCode, $request->motif);

        return response()->json([
            'success' => true,
            'message' => 'QR code révoqué avec succès',
        ]);
    }

    public function regenerer(string $uuid): JsonResponse
    {
        $qrCode = QrCode::where('uuid', $uuid)->firstOrFail();

        $nouveauQrCode = $this->qrCodeService->regenerer($qrCode);

        return response()->json([
            'success' => true,
            'message' => 'QR code régénéré avec succès',
            'data' => new QrCodeResource($nouveauQrCode),
        ]);
    }
}
