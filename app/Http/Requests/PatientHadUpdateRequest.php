<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientHadUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'medecin_referent_id' => ['required', 'integer', 'exists:users,id'],
            'date_inclusion' => ['required', 'date'],
            'date_sortie' => ['nullable', 'date'],
            'motif_inclusion' => ['required', 'string'],
            'motif_sortie' => ['nullable', 'string'],
            'adresse_domicile' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric', 'between:-999.9999999,999.9999999'],
            'longitude' => ['nullable', 'numeric', 'between:-999.9999999,999.9999999'],
            'personne_reference_nom' => ['nullable', 'string', 'max:100'],
            'personne_reference_telephone' => ['nullable', 'string', 'max:20'],
            'personne_reference_lien' => ['nullable', 'string', 'max:50'],
            'protocole_soins' => ['nullable', 'string'],
            'frequence_visites' => ['required', 'in:quotidien,2_fois_semaine,hebdomadaire,bimensuel'],
            'equipements_domicile' => ['nullable', 'json'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:actif,suspendu,termine'],
        ];
    }
}
