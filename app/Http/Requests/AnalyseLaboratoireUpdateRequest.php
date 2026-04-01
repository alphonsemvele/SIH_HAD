<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyseLaboratoireUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:analyse_laboratoires,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'consultation_id' => ['nullable', 'integer', 'exists:consultations,id'],
            'medecin_prescripteur_id' => ['required', 'integer', 'exists:users,id'],
            'technicien_id' => ['nullable', 'integer', 'exists:users,id'],
            'biologiste_id' => ['nullable', 'integer', 'exists:users,id'],
            'type_analyse_id' => ['required', 'integer', 'exists:type_analyses,id'],
            'date_prescription' => ['required'],
            'date_prelevement' => ['nullable'],
            'date_resultat' => ['nullable'],
            'resultat' => ['nullable', 'json'],
            'interpretation' => ['nullable', 'string'],
            'conclusion' => ['nullable', 'string'],
            'commentaire_medecin' => ['nullable', 'string'],
            'urgent' => ['required'],
            'statut' => ['required', 'in:prescrit,preleve,en_cours,resultat_disponible,valide,annule'],
        ];
    }
}
