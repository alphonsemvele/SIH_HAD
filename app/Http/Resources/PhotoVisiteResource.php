<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PhotoVisiteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visite_had_id' => $this->visite_had_id,
            'chemin' => $this->chemin,
            'hash_sha256' => $this->hash_sha256,
            'taille_octets' => $this->taille_octets,
            'mime_type' => $this->mime_type,
            'exif' => $this->exif,
            'legende' => $this->legende,
            'intervenant_id' => $this->intervenant_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
