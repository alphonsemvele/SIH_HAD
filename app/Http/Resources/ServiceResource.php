<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'nom' => $this->nom,
            'description' => $this->description,
            'chef_service_id' => $this->chef_service_id,
            'etage' => $this->etage,
            'batiment' => $this->batiment,
            'telephone' => $this->telephone,
            'email' => $this->email,
            'capacite_lits' => $this->capacite_lits,
            'actif' => $this->actif,
            'admissions' => AdmissionCollection::make($this->whenLoaded('admissions')),
        ];
    }
}
