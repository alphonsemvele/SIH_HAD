<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RendezVouResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_id' => $this->patient_id,
            'medecin_id' => $this->medecin_id,
            'service_id' => $this->service_id,
            'date_heure' => $this->date_heure,
            'duree_minutes' => $this->duree_minutes,
            'type' => $this->type,
            'motif' => $this->motif,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'service' => ServiceResource::make($this->whenLoaded('service')),
            'consultation' => ConsultationResource::make($this->whenLoaded('consultation')),
        ];
    }
}
