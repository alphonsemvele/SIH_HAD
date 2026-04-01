<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OccupationStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'lit_id'               => 'required|exists:lits,id',
            'patient_id'           => 'required|exists:patients,id',
            'medecin_id'           => 'nullable|exists:users,id',
            'infirmier_id'         => 'nullable|exists:users,id',
            'diagnostic_principal' => 'nullable|string|max:255',
            'notes_admission'      => 'nullable|string|max:2000',
            'date_entree'          => 'required|date',
            'date_sortie_prevue'   => 'nullable|date|after:date_entree',
        ];
    }
}