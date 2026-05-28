<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrScanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'qr_code_id' => $this->qr_code_id,
            'visite_had_id' => $this->visite_had_id,
            'intervenant_id' => $this->intervenant_id,
            'scanned_at' => $this->scanned_at,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'precision_m' => $this->precision_m,
            'statut_scan' => $this->statut_scan,
            'motif_refus' => $this->motif_refus,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
