<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RendezVouUpdateRequest extends FormRequest
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
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'medecin_id' => ['required', 'integer', 'exists:users,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'date_heure' => ['required'],
            'duree_minutes' => ['required', 'integer'],
            'type' => ['required', 'in:consultation,suivi,examen,chirurgie,vaccination'],
            'motif' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:planifie,confirme,en_attente,en_cours,termine,annule,absent'],
        ];
    }
}
