<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TypeExamenUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:type_examens,code,' . $this->typeExamen->id],
            'nom' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'module' => ['required', 'in:laboratoire,imagerie'],
            'categorie' => ['nullable', 'string', 'max:100'],
            'modalite_imagerie_id' => ['nullable', 'integer', 'exists:modalite_imageries,id'],
            'duree_minutes' => ['nullable', 'integer', 'min:1'],
            'prix' => ['nullable', 'numeric', 'min:0'],
            'actif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code est obligatoire.',
            'code.unique' => 'Ce code existe déjà.',
            'nom.required' => 'Le nom est obligatoire.',
            'module.required' => 'Le module est obligatoire.',
            'module.in' => 'Le module doit être laboratoire ou imagerie.',
            'duree_minutes.min' => 'La durée doit être supérieure à 0.',
            'prix.min' => 'Le prix doit être supérieur ou égal à 0.',
        ];
    }
}
