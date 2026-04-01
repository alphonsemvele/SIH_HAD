<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VisiteHadUpdateRequest extends FormRequest
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
            'tournee_id' => ['required', 'integer', 'exists:tournees,id'],
            'patient_had_id' => ['required', 'integer', 'exists:patient_hads,id'],
            'ordre' => ['required', 'integer'],
            'heure_prevue' => ['nullable'],
            'heure_arrivee' => ['nullable'],
            'heure_depart' => ['nullable'],
            'latitude_arrivee' => ['nullable', 'numeric', 'between:-999.9999999,999.9999999'],
            'longitude_arrivee' => ['nullable', 'numeric', 'between:-999.9999999,999.9999999'],
            'soins_realises' => ['nullable', 'json'],
            'observations' => ['nullable', 'string'],
            'constantes' => ['nullable', 'json'],
            'alertes' => ['nullable', 'json'],
            'signature_patient' => ['nullable', 'string'],
            'photos' => ['nullable', 'json'],
            'statut' => ['required', 'in:planifiee,en_cours,terminee,annulee,reportee'],
        ];
    }
}
