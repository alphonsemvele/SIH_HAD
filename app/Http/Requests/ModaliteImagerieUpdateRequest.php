<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ModaliteImagerieUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:modalite_imageries,code,' . $this->modaliteImagerie->id],
            'nom' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'disponible' => ['boolean'],
            'actif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code est obligatoire.',
            'code.unique' => 'Ce code existe déjà.',
            'nom.required' => 'Le nom est obligatoire.',
        ];
    }
}
