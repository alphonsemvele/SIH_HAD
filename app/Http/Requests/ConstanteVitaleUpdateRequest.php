<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConstanteVitaleUpdateRequest extends FormRequest
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
            'admission_id' => ['nullable', 'integer', 'exists:admissions,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'date_mesure' => ['required'],
            'poids' => ['nullable', 'numeric', 'between:-999.99,999.99'],
            'taille' => ['nullable', 'numeric', 'between:-999.99,999.99'],
            'temperature' => ['nullable', 'numeric', 'between:-99.99,99.99'],
            'tension_systolique' => ['nullable', 'integer'],
            'tension_diastolique' => ['nullable', 'integer'],
            'frequence_cardiaque' => ['nullable', 'integer'],
            'frequence_respiratoire' => ['nullable', 'integer'],
            'saturation_oxygene' => ['nullable', 'integer'],
            'glycemie' => ['nullable', 'numeric', 'between:-999.99,999.99'],
            'score_douleur' => ['nullable', 'integer'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
