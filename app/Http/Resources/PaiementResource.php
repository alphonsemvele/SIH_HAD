<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaiementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'facture_id' => $this->facture_id,
            'date_paiement' => $this->date_paiement,
            'montant' => $this->montant,
            'mode_paiement' => $this->mode_paiement,
            'reference' => $this->reference,
            'banque' => $this->banque,
            'telephone_mobile_money' => $this->telephone_mobile_money,
            'recu_par' => $this->recu_par,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'recu_par_id' => $this->recu_par_id,
        ];
    }
}
