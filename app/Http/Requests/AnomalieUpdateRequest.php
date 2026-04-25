<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnomalieUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'categorie' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'actif' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est obligatoire.',
            'nom.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'categorie.max' => 'La catégorie ne doit pas dépasser 100 caractères.',
            'description.max' => 'La description ne doit pas dépasser 1000 caractères.',
        ];
    }
}
