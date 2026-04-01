<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DemandeCongeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'type' => $this->type,
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'nombre_jours' => $this->nombre_jours,
            'motif' => $this->motif,
            'piece_jointe' => $this->piece_jointe,
            'valideur_id' => $this->valideur_id,
            'date_validation' => $this->date_validation,
            'commentaire_validation' => $this->commentaire_validation,
            'statut' => $this->statut,
        ];
    }
}
