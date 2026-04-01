<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FactureStoreRequest extends FormRequest
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
            'date_facture' => ['required', 'date'],
        ];
    }
}
