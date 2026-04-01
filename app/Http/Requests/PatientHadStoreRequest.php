<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientHadStoreRequest extends FormRequest
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
            'motif_inclusion' => ['required', 'string'],
            'adresse_domicile' => ['required', 'string'],
        ];
    }
}
