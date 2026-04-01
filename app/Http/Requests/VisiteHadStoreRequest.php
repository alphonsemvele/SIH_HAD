<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VisiteHadStoreRequest extends FormRequest
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
        ];
    }
}
