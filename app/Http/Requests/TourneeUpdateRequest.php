<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TourneeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Acteurs ───────────────────────────────────────────────────
            'soignant_id'           => ['sometimes', 'integer', 'exists:users,id'],
            'service_id'            => ['sometimes', 'integer', 'exists:services,id'],

            // ── Timing ────────────────────────────────────────────────────
            'date'                  => ['sometimes', 'date'],
            'heure_debut_prevue'    => ['sometimes', 'date_format:H:i'],
            'heure_fin_prevue'      => ['nullable', 'date_format:H:i'],
            'heure_debut_effective' => ['nullable', 'date_format:H:i'],
            'heure_fin_effective'   => ['nullable', 'date_format:H:i'],
            'heure_debut_2'         => ['nullable', 'date_format:H:i'],
            'heure_debut_3'         => ['nullable', 'date_format:H:i'],

            // ── Logistique ────────────────────────────────────────────────
            'vehicule'              => ['nullable', 'string', 'max:30'],
            'kilometres'            => ['nullable', 'numeric', 'min:0', 'max:9999.99'],

            // ── Type & statut ─────────────────────────────────────────────
            'type'                  => ['sometimes', Rule::in(['complete', 'cas_critiques', 'chambre_specifique'])],
            'statut'                => ['sometimes', Rule::in(['planifiee', 'en_cours', 'terminee', 'annulee'])],

            // ── Récurrence ────────────────────────────────────────────────
            'recurrence'            => ['sometimes', Rule::in(['unique', 'quotidienne', 'hebdomadaire', 'personnalisee'])],
            'jours_actifs'          => ['nullable', 'array'],
            'jours_actifs.*'        => ['integer', 'between:0,6'],
            'frequence_journaliere' => ['sometimes', 'integer', 'between:1,3'],
            'date_fin_recurrence'   => ['nullable', 'date'],

            // ── Divers ────────────────────────────────────────────────────
            'notes'                 => ['nullable', 'string', 'max:2000'],
        ];
    }
}