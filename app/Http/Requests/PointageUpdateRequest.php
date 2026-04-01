<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PointageUpdateRequest extends FormRequest
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
            'date' => ['required', 'date'],
            'heure_arrivee' => ['nullable'],
            'heure_depart' => ['nullable'],
            'type' => ['required', 'in:normal,garde,astreinte'],
            'equipe' => ['nullable', 'in:matin,apres_midi,nuit'],
            'source' => ['required', 'in:manuel,biometrique,mobile'],
            'localisation' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:present,absent,retard,conge,maladie'],
        ];
    }
}
