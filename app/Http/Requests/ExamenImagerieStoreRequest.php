<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamenImagerieStoreRequest extends FormRequest
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
            'type_examen_id' => ['required', 'integer', 'exists:type_examen_imageries,id'],
            'date_prescription' => ['required'],
        ];
    }
}
