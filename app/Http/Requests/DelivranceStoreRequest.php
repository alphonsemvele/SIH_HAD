<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DelivranceStoreRequest extends FormRequest
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
            'prescription_id' => ['required', 'integer', 'exists:prescriptions,id'],
            'pharmacien_id' => ['required', 'integer', 'exists:users,id'],
            'date_delivrance' => ['required'],
        ];
    }
}
