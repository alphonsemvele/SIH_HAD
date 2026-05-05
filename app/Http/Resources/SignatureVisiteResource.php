<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureVisiteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visite_had_id' => $this->visite_had_id,
            'signataire_type' => $this->signataire_type,
            'aidant_id' => $this->aidant_id,
            'chemin_image_png' => $this->chemin_image_png,
            'hash_sha256' => $this->hash_sha256,
            'motif_refus' => $this->motif_refus,
            'signe_a' => $this->signe_a,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
