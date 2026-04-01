<?php
// ─── LitResource ──────────────────────────────────────────────────────────────
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'numero'           => $this->numero,
            'chambre'          => $this->chambre,
            'type'             => $this->type,
            'statut'           => $this->statut,
            'equipements'      => $this->equipements ?? [],
            'tarif_journalier' => $this->tarif_journalier,
            'notes'            => $this->notes,
            'service'          => $this->whenLoaded('service', fn () => [
                'id'    => $this->service->id,
                'nom'   => $this->service->nom,
                'etage' => $this->service->etage,
            ]),
            'occupation_active' => $this->whenLoaded(
                'occupationActive',
                fn () => $this->occupationActive
                    ? new OccupationRoomResource($this->occupationActive)
                    : null
            ),
            'created_at' => $this->created_at?->format('d/m/Y'),
        ];
    }
}