<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MouvementStockUpdateRequest extends FormRequest
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
            'medicament_id' => ['required', 'integer', 'exists:medicaments,id'],
            'type' => ['required', 'in:entree,sortie,ajustement,perte,peremption'],
            'quantite' => ['required', 'integer'],
            'stock_avant' => ['required', 'integer'],
            'stock_apres' => ['required', 'integer'],
            'motif' => ['nullable', 'string', 'max:255'],
            'reference' => ['nullable', 'string', 'max:50'],
            'lot' => ['nullable', 'string', 'max:50'],
            'date_expiration' => ['nullable', 'date'],
            'prix_unitaire' => ['nullable', 'numeric', 'between:-99999999.99,99999999.99'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
