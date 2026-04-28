<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourneeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ── Identité ──────────────────────────────────────────────────
            'id'                    => $this->id,
            'soignant_id'           => $this->soignant_id,
            'service_id'            => $this->service_id,

            // ── Timing ────────────────────────────────────────────────────
            'date'                  => $this->date?->format('Y-m-d'),
            'vehicule'              => $this->vehicule,
            'heure_debut_prevue'    => $this->heure_debut_prevue?->format('H:i'),
            'heure_fin_prevue'      => $this->heure_fin_prevue?->format('H:i'),
            'heure_debut_effective' => $this->heure_debut_effective?->format('H:i'),
            'heure_fin_effective'   => $this->heure_fin_effective?->format('H:i'),
            'heure_debut_2'         => $this->heure_debut_2?->format('H:i'),
            'heure_debut_3'         => $this->heure_debut_3?->format('H:i'),

            // ── Logistique ────────────────────────────────────────────────
            'kilometres'            => $this->kilometres,

            // ── Type & statut ─────────────────────────────────────────────
            'type'                  => $this->type,
            'statut'                => $this->statut,
            'statut_label'          => $this->getStatutLabel(),

            // ── Récurrence ────────────────────────────────────────────────
            'recurrence'            => $this->recurrence,
            'jours_actifs'          => $this->jours_actifs ?? [],
            'frequence_journaliere' => $this->frequence_journaliere ?? 1,
            'date_fin_recurrence'   => $this->date_fin_recurrence?->format('Y-m-d'),
            'recurrence_parent_id'  => $this->recurrence_parent_id,
            'est_occurrence'        => $this->estUneOccurrence(),

            // ── Divers ────────────────────────────────────────────────────
            'notes'                 => $this->notes,

            // ── Calculés ──────────────────────────────────────────────────
            'patients_total'        => $this->visiteHads->count(),
            'patients_vus'          => $this->visiteHads->whereNotNull('visite_at')->count(),
            'duree_effective'       => $this->getDureeEffective(),

            // ── Relations eager-loaded ────────────────────────────────────
            'soignant'   => $this->whenLoaded('soignant', fn () => [
                'id'   => $this->soignant->id,
                'name' => $this->soignant->name,
            ]),

            'service'    => $this->whenLoaded('service', fn () => [
                'id'    => $this->service->id,
                'nom'   => $this->service->nom,
                'etage' => $this->service->etage,
            ]),

            'visite_hads' => VisiteHadResource::collection(
                $this->whenLoaded('visiteHads')
            ),
        ];
    }
}