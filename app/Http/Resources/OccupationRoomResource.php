<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OccupationRoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'statut'               => $this->statut,
            'diagnostic_principal' => $this->diagnostic_principal,
            'notes_admission'      => $this->notes_admission,
            'notes_sortie'         => $this->notes_sortie,
            'date_entree'          => $this->date_entree?->format('d/m/Y H:i'),
            'date_sortie_prevue'   => $this->date_sortie_prevue?->format('d/m/Y'),
            'date_sortie'          => $this->date_sortie?->format('d/m/Y H:i'),
            'motif_sortie'         => $this->motif_sortie,
            'duree_sejour'         => $this->duree_sejour,
            'cout_sejour'          => $this->cout_sejour,
            'est_active'           => $this->est_active,

            'lit' => $this->whenLoaded('lit', fn () => [
                'id'     => $this->lit->id,
                'numero' => $this->lit->numero,
                'chambre' => $this->lit->chambre,
            ]),

            'service' => $this->whenLoaded('service', fn () => [
                'id'    => $this->service->id,
                'nom'   => $this->service->nom,
                'etage' => $this->service->etage,
            ]),

            'patient' => $this->whenLoaded('patient', fn () => $this->patient ? [
                'id'             => $this->patient->id,
                'nom_complet'    => $this->patient->nom . ' ' . $this->patient->prenom,
                'date_naissance' => $this->patient->date_naissance?->format('d/m/Y'),
                'telephone'      => $this->patient->telephone,
            ] : null),

            'medecin'   => $this->whenLoaded('medecin', fn () => $this->medecin?->name),
            'infirmier' => $this->whenLoaded('infirmier', fn () => $this->infirmier?->name),
            'cree_par'  => $this->whenLoaded('creePar', fn () => $this->creePar?->name),

            'lit_destination' => $this->whenLoaded('litDestination', fn () => $this->litDestination ? [
                'id'     => $this->litDestination->id,
                'numero' => $this->litDestination->numero,
            ] : null),

            'service_destination' => $this->whenLoaded('serviceDestination', fn () => $this->serviceDestination?->nom),

            'created_at' => $this->created_at?->format('d/m/Y'),
        ];
    }
}