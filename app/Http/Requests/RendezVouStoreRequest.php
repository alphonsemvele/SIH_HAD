<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RendezVouStoreRequest extends FormRequest
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
            'medecin_id' => ['required', 'integer', 'exists:users,id'],
            'date_heure' => ['required'],
            'type' => ['required', 'in:consultation,suivi,examen,chirurgie,vaccination'],
        ];
    }
}
