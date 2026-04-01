<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdmissionUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:admissions,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'lit_id' => ['nullable', 'integer', 'exists:lits,id'],
            'medecin_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', 'in:urgence,programmee,transfert'],
            'motif' => ['required', 'string'],
            'diagnostic_entree' => ['nullable', 'string'],
            'diagnostic_sortie' => ['nullable', 'string'],
            'date_admission' => ['required'],
            'date_sortie' => ['nullable'],
            'mode_sortie' => ['nullable', 'in:guerison,amelioration,transfert,evasion,deces,contre_avis'],
            'accompagnant_nom' => ['nullable', 'string', 'max:100'],
            'accompagnant_telephone' => ['nullable', 'string', 'max:20'],
            'accompagnant_lien' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:en_cours,termine,annule'],
        ];
    }
}
