<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssuranceUpdateRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:20', 'unique:assurances,code'],
            'nom' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:publique,privee,mutuelle'],
            'adresse' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],
            'taux_couverture' => ['required', 'numeric', 'between:-999.99,999.99'],
            'plafond_annuel' => ['nullable', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'delai_paiement' => ['required', 'integer'],
            'contact_nom' => ['nullable', 'string', 'max:100'],
            'contact_telephone' => ['nullable', 'string', 'max:20'],
            'actif' => ['required'],
        ];
    }
}
