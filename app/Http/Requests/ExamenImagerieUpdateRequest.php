<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamenImagerieUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:examen_imageries,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'consultation_id' => ['nullable', 'integer', 'exists:consultations,id'],
            'medecin_prescripteur_id' => ['required', 'integer', 'exists:users,id'],
            'radiologue_id' => ['nullable', 'integer', 'exists:users,id'],
            'manipulateur_id' => ['nullable', 'integer', 'exists:users,id'],
            'type_examen_id' => ['required', 'integer', 'exists:type_examen_imageries,id'],
            'date_prescription' => ['required'],
            'date_examen' => ['nullable'],
            'date_resultat' => ['nullable'],
            'indication_clinique' => ['nullable', 'string'],
            'technique' => ['nullable', 'string'],
            'resultat' => ['nullable', 'string'],
            'conclusion' => ['nullable', 'string'],
            'images_path' => ['nullable', 'json'],
            'urgent' => ['required'],
            'statut' => ['required', 'in:prescrit,planifie,en_cours,resultat_disponible,valide,annule'],
            'type_examen_imagerie_id' => ['required', 'integer', 'exists:type_examen_imageries,id'],
        ];
    }
}
