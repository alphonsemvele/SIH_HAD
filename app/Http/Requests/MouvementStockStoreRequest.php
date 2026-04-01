<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MouvementStockStoreRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
