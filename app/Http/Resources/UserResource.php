<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'telephone' => $this->telephone,
            'avatar' => $this->avatar,
            'matricule' => $this->matricule,
            'fonction' => $this->fonction,
            'specialite' => $this->specialite,
            'service_id' => $this->service_id,
            'date_embauche' => $this->date_embauche,
            'statut' => $this->statut,
            'service' => ServiceResource::make($this->whenLoaded('service')),
            'demandeConges' => DemandeCongeCollection::make($this->whenLoaded('demandeConges')),
        ];
    }
}
