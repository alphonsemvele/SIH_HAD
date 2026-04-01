<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'patient_id' => $this->patient_id,
            'medecin_id' => $this->medecin_id,
            'consultation_id' => $this->consultation_id,
            'admission_id' => $this->admission_id,
            'date_prescription' => $this->date_prescription,
            'date_validite' => $this->date_validite,
            'instructions_generales' => $this->instructions_generales,
            'statut' => $this->statut,
            'admission' => AdmissionResource::make($this->whenLoaded('admission')),
            'delivrances' => DelivranceCollection::make($this->whenLoaded('delivrances')),
        ];
    }
}
