<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FournisseurResource extends JsonResource
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
            'type' => $this->type,
            'adresse' => $this->adresse,
            'ville' => $this->ville,
            'pays' => $this->pays,
            'telephone' => $this->telephone,
            'email' => $this->email,
            'site_web' => $this->site_web,
            'contact_nom' => $this->contact_nom,
            'contact_telephone' => $this->contact_telephone,
            'delai_livraison_jours' => $this->delai_livraison_jours,
            'conditions_paiement' => $this->conditions_paiement,
            'actif' => $this->actif,
            'commandeFournisseurs' => CommandeFournisseurCollection::make($this->whenLoaded('commandeFournisseurs')),
        ];
    }
}
