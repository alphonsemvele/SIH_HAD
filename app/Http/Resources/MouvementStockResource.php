<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MouvementStockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medicament_id' => $this->medicament_id,
            'type' => $this->type,
            'quantite' => $this->quantite,
            'stock_avant' => $this->stock_avant,
            'stock_apres' => $this->stock_apres,
            'motif' => $this->motif,
            'reference' => $this->reference,
            'lot' => $this->lot,
            'date_expiration' => $this->date_expiration,
            'prix_unitaire' => $this->prix_unitaire,
            'user_id' => $this->user_id,
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
