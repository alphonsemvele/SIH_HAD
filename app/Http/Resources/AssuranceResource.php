<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssuranceResource extends JsonResource
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
            'telephone' => $this->telephone,
            'email' => $this->email,
            'taux_couverture' => $this->taux_couverture,
            'plafond_annuel' => $this->plafond_annuel,
            'delai_paiement' => $this->delai_paiement,
            'contact_nom' => $this->contact_nom,
            'contact_telephone' => $this->contact_telephone,
            'actif' => $this->actif,
            'factures' => FactureCollection::make($this->whenLoaded('factures')),
        ];
    }
}
