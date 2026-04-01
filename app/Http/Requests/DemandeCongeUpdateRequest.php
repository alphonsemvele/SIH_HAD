<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DemandeCongeUpdateRequest extends FormRequest
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
            'motif' => ['nullable', 'string'],
            'piece_jointe' => ['nullable', 'string'],
            'valideur_id' => ['nullable', 'integer', 'exists:users,id'],
            'date_validation' => ['nullable'],
            'commentaire_validation' => ['nullable', 'string'],
            'statut' => ['required', 'in:en_attente,approuve,refuse,annule'],
        ];
    }
}
