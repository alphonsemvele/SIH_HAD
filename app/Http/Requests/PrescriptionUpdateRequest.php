<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PrescriptionUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:prescriptions,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'medecin_id' => ['required', 'integer', 'exists:users,id'],
            'consultation_id' => ['nullable', 'integer', 'exists:consultations,id'],
            'admission_id' => ['nullable', 'integer', 'exists:admissions,id'],
            'date_prescription' => ['required'],
            'date_validite' => ['nullable', 'date'],
            'instructions_generales' => ['nullable', 'string'],
            'statut' => ['required', 'in:en_attente,partiellement_delivree,delivree,annulee'],
        ];
    }
}
