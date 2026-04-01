<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FactureResource extends JsonResource
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
            'admission_id' => $this->admission_id,
            'assurance_id' => $this->assurance_id,
            'date_facture' => $this->date_facture,
            'date_echeance' => $this->date_echeance,
            'montant_brut' => $this->montant_brut,
            'remise' => $this->remise,
            'montant_assurance' => $this->montant_assurance,
            'montant_patient' => $this->montant_patient,
            'montant_total' => $this->montant_total,
            'montant_paye' => $this->montant_paye,
            'tva' => $this->tva,
            'notes' => $this->notes,
            'statut' => $this->statut,
            'assurance' => AssuranceResource::make($this->whenLoaded('assurance')),
            'paiements' => PaiementCollection::make($this->whenLoaded('paiements')),
        ];
    }
}
