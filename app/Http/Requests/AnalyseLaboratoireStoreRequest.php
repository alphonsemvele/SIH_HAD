<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyseLaboratoireStoreRequest extends FormRequest
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
            'medecin_prescripteur_id' => ['required', 'integer', 'exists:users,id'],
            'type_analyse_id' => ['required', 'integer', 'exists:type_analyses,id'],
            'date_prescription' => ['required'],
        ];
    }
}
