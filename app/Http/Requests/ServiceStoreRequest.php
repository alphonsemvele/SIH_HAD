<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'chef_service_id' => ['nullable', 'exists:users,id'],
            'etage' => ['nullable', 'string', 'max:50'],
            'batiment' => ['nullable', 'string', 'max:100'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'capacite_lits' => ['nullable', 'integer', 'min:0'],
            'actif' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom du service est obligatoire.',
            'nom.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'chef_service_id.exists' => 'Le chef de service sélectionné n\'existe pas.',
            'email.email' => 'L\'email doit être valide.',
            'capacite_lits.integer' => 'La capacité doit être un nombre entier.',
            'capacite_lits.min' => 'La capacité ne peut pas être négative.',
        ];
    }
}