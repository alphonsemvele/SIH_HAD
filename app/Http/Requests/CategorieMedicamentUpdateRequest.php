<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategorieMedicamentUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:categorie_medicaments,code,' . $this->categorieMedicament->id],
            'nom' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'couleur' => ['nullable', 'string', 'max:7'],
            'actif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code est obligatoire.',
            'code.unique' => 'Ce code existe déjà.',
            'nom.required' => 'Le nom est obligatoire.',
            'couleur.max' => 'La couleur ne doit pas dépasser 7 caractères.',
        ];
    }
}
