<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DelivranceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'prescription_id' => $this->prescription_id,
            'pharmacien_id' => $this->pharmacien_id,
            'date_delivrance' => $this->date_delivrance,
            'montant_total' => $this->montant_total,
            'montant_paye' => $this->montant_paye,
            'mode_paiement' => $this->mode_paiement,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'ligneDelivrances' => LigneDelivranceCollection::make($this->whenLoaded('ligneDelivrances')),
        ];
    }
}
