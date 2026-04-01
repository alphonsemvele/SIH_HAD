<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TourneeUpdateRequest extends FormRequest
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
            'date' => ['required', 'date'],
            'soignant_id' => ['required', 'integer', 'exists:users,id'],
            'vehicule' => ['nullable', 'string', 'max:50'],
            'heure_debut_prevue' => ['nullable'],
            'heure_fin_prevue' => ['nullable'],
            'heure_debut_effective' => ['nullable'],
            'heure_fin_effective' => ['nullable'],
            'kilometres' => ['nullable', 'numeric', 'between:-999999.99,999999.99'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:planifiee,en_cours,terminee,annulee'],
        ];
    }
}
