<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DemandeCongeStoreRequest extends FormRequest
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
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'in:annuel,maladie,maternite,paternite,sans_solde,recuperation,formation'],
            'date_debut' => ['required', 'date'],
            'date_fin' => ['required', 'date'],
            'nombre_jours' => ['required', 'integer'],
        ];
    }
}
