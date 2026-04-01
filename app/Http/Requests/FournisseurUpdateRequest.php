<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FournisseurUpdateRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:20', 'unique:fournisseurs,code'],
            'nom' => ['required', 'string', 'max:150'],
            'type' => ['required', 'in:laboratoire,grossiste,importateur'],
            'adresse' => ['nullable', 'string'],
            'ville' => ['nullable', 'string', 'max:50'],
            'pays' => ['required', 'string', 'max:50'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],
            'site_web' => ['nullable', 'string', 'max:200'],
            'contact_nom' => ['nullable', 'string', 'max:100'],
            'contact_telephone' => ['nullable', 'string', 'max:20'],
            'delai_livraison_jours' => ['required', 'integer'],
            'conditions_paiement' => ['nullable', 'string'],
            'actif' => ['required'],
        ];
    }
}
