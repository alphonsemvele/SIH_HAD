<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TourneeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Acteurs ───────────────────────────────────────────────────
            'soignant_id'           => ['required', 'integer', 'exists:users,id'],
            'service_id'            => ['required', 'integer', 'exists:services,id'],

            // ── Timing ────────────────────────────────────────────────────
            // ✅ after_or_equal retiré : cause des faux négatifs selon le timezone
            'date'                  => ['required', 'date'],
            'heure_debut_prevue'    => ['required', 'date_format:H:i'],
            'heure_fin_prevue'      => ['nullable', 'date_format:H:i'],

            // Créneaux supplémentaires (fréquence 2× / 3×)
            'heure_debut_2'         => ['nullable', 'date_format:H:i'],
            'heure_debut_3'         => ['nullable', 'date_format:H:i'],

            // ── Logistique ────────────────────────────────────────────────
            'vehicule'              => ['nullable', 'string', 'max:30'],
            'kilometres'            => ['nullable', 'numeric', 'min:0', 'max:9999.99'],

            // ── Type ──────────────────────────────────────────────────────
            'type'                  => ['required', Rule::in(['complete', 'cas_critiques', 'chambre_specifique'])],

            // ── Récurrence ────────────────────────────────────────────────
            'recurrence'            => ['required', Rule::in(['unique', 'quotidienne', 'hebdomadaire', 'personnalisee'])],

            'jours_actifs'          => [
                'nullable',
                'array',
                'required_if:recurrence,hebdomadaire',
                'required_if:recurrence,personnalisee',
            ],
            'jours_actifs.*'        => ['integer', 'between:0,6'],

            'frequence_journaliere' => ['required', 'integer', 'between:1,3'],

            'date_fin_recurrence'   => [
                'nullable',
                'date',
                'required_unless:recurrence,unique',
            ],

            // ── Divers ────────────────────────────────────────────────────
            'notes'                 => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'soignant_id.required'              => 'Veuillez sélectionner un soignant.',
            'service_id.required'               => 'Veuillez sélectionner un service.',
            'heure_debut_prevue.required'        => "L'heure de début est obligatoire.",
            'jours_actifs.required_if'           => 'Sélectionnez au moins un jour pour cette récurrence.',
            'jours_actifs.*.between'             => 'Jour invalide (0 = Dimanche, 6 = Samedi).',
            'frequence_journaliere.between'      => 'La fréquence journalière doit être 1, 2 ou 3.',
            'date_fin_recurrence.required_unless'=> 'La date de fin est requise pour une tournée récurrente.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('jours_actifs') && is_array($this->jours_actifs)) {
            $this->merge([
                'jours_actifs' => array_values(array_unique(
                    array_map('intval', $this->jours_actifs)
                )),
            ]);
        }

        if (!$this->has('frequence_journaliere')) {
            $this->merge(['frequence_journaliere' => 1]);
        }

        if (!$this->has('recurrence')) {
            $this->merge(['recurrence' => 'unique']);
        }
    }
}