<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlanSoinsCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_debut' => ['required', 'date', 'after_or_equal:today'],
            'date_fin_prevue' => ['required', 'date', 'after:date_debut'],
            'reevaluation_prevue_le' => ['nullable', 'date', 'after:date_debut', 'before_or_equal:date_fin_prevue'],
            'objectifs' => ['nullable', 'string', 'max:2000'],
            'prestations' => ['nullable', 'array', 'min:1'],
            'prestations.*.libelle' => ['required', 'string', 'max:255'],
            'prestations.*.frequence_type' => ['required', Rule::in(['ponctuelle', 'quotidienne', 'hebdomadaire', 'personnalisee'])],
            'prestations.*.frequence_detail' => ['nullable', 'array'],
            'prestations.*.frequence_detail.jours' => ['required_if:prestations.*.frequence_type,hebdomadaire,personnalisee', 'array'],
            'prestations.*.frequence_detail.jours.*' => ['required', 'string', Rule::in(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'])],
            'prestations.*.frequence_detail.heure' => ['nullable', 'date_format:H:i'],
            'prestations.*.duree_min' => ['nullable', 'integer', 'min:5', 'max:480'],
            'prestations.*.acte_medical_id' => ['nullable', 'exists:actes_medicaux,id'],
            'prestations.*.intervenants_profils' => ['nullable', 'array'],
            'prestations.*.materiel_requis' => ['nullable', 'array'],
            'prestations.*.protocole' => ['nullable', 'string', 'max:2000'],
            'prestations.*.date_debut' => ['nullable', 'date', 'after_or_equal:date_debut'],
            'prestations.*.date_fin' => ['nullable', 'date', 'after:prestations.*.date_debut', 'before_or_equal:date_fin_prevue'],
        ];
    }

    public function messages(): array
    {
        return [
            'date_debut.required' => 'La date de début est obligatoire',
            'date_debut.after_or_equal' => 'La date de début doit être aujourd\'hui ou dans le futur',
            'date_fin_prevue.required' => 'La date de fin prévue est obligatoire',
            'date_fin_prevue.after' => 'La date de fin doit être après la date de début',
            'reevaluation_prevue_le.after' => 'La date de réévaluation doit être après la date de début',
            'reevaluation_prevue_le.before_or_equal' => 'La date de réévaluation doit être avant ou égale à la date de fin',
            'prestations.required' => 'Au moins une prestation est requise',
            'prestations.*.libelle.required' => 'Le libellé de la prestation est obligatoire',
            'prestations.*.frequence_type.required' => 'Le type de fréquence est obligatoire',
            'prestations.*.frequence_type.in' => 'Le type de fréquence doit être: ponctuelle, quotidienne, hebdomadaire ou personnalisée',
            'prestations.*.frequence_detail.jours.required_if' => 'Les jours sont requis pour la fréquence hebdomadaire ou personnalisée',
            'prestations.*.duree_min.min' => 'La durée doit être d\'au moins 5 minutes',
            'prestations.*.duree_min.max' => 'La durée ne peut pas dépasser 8 heures (480 minutes)',
        ];
    }
}
