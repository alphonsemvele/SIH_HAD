<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConsultationUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:consultations,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'medecin_id' => ['required', 'integer', 'exists:users,id'],
            'admission_id' => ['nullable', 'integer', 'exists:admissions,id'],
            'rendez_vous_id' => ['nullable', 'integer', 'exists:rendez_vous,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'date_consultation' => ['required'],
            'motif' => ['required', 'string'],
            'histoire_maladie' => ['nullable', 'string'],
            'examen_clinique' => ['nullable', 'string'],
            'hypotheses_diagnostiques' => ['nullable', 'json'],
            'diagnostic_principal' => ['nullable', 'string', 'max:255'],
            'diagnostics_secondaires' => ['nullable', 'json'],
            'conduite_a_tenir' => ['nullable', 'string'],
            'recommandations' => ['nullable', 'string'],
            'prochain_rdv' => ['nullable', 'date'],
            'duree_minutes' => ['nullable', 'integer'],
            'statut' => ['required', 'in:en_cours,termine,annule'],
        ];
    }
}
