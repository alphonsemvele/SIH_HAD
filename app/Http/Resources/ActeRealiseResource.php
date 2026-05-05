<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActeRealiseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'visite_had_id' => $this->visite_had_id,
            'acte_medical_id' => $this->acte_medical_id,
            'libelle' => $this->libelle,
            'code_ccam' => $this->code_ccam,
            'observations' => $this->observations,
            'non_prevu' => $this->non_prevu,
            'intervenant_id' => $this->intervenant_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
