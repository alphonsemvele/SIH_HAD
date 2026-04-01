<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ServiceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes', 'string', 'max:255'],
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
}