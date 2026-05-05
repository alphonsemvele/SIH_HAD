<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QrCodeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'visite_had_id' => $this->visite_had_id,
            'patient_had_id' => $this->patient_had_id,
            'plan_soins_prestation_id' => $this->plan_soins_prestation_id,
            'creneau_debut' => $this->creneau_debut,
            'creneau_fin' => $this->creneau_fin,
            'statut' => $this->statut,
            'payload_signe' => $this->payload_signe,
            'genere_par_id' => $this->genere_par_id,
            'remplace_qr_id' => $this->remplace_qr_id,
            'utilise_a' => $this->utilise_a,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
