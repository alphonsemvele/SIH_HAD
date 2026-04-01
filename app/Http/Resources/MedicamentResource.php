<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicamentResource extends JsonResource
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
            'dci' => $this->dci,
            'forme' => $this->forme,
            'dosage' => $this->dosage,
            'categorie' => $this->categorie,
            'voie_administration' => $this->voie_administration,
            'conditionnement' => $this->conditionnement,
            'stock_actuel' => $this->stock_actuel,
            'stock_minimum' => $this->stock_minimum,
            'stock_maximum' => $this->stock_maximum,
            'prix_achat' => $this->prix_achat,
            'prix_vente' => $this->prix_vente,
            'tva' => $this->tva,
            'fournisseur_id' => $this->fournisseur_id,
            'date_expiration' => $this->date_expiration,
            'emplacement' => $this->emplacement,
            'ordonnance_obligatoire' => $this->ordonnance_obligatoire,
            'actif' => $this->actif,
            'notes' => $this->notes,
            'fournisseur' => FournisseurResource::make($this->whenLoaded('fournisseur')),
            'ligneCommandes' => LigneCommandeCollection::make($this->whenLoaded('ligneCommandes')),
        ];
    }
}
