<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FactureUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:factures,numero'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'admission_id' => ['nullable', 'integer', 'exists:admissions,id'],
            'assurance_id' => ['nullable', 'integer', 'exists:assurances,id'],
            'date_facture' => ['required', 'date'],
            'date_echeance' => ['nullable', 'date'],
            'montant_brut' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'remise' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'montant_assurance' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'montant_patient' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'montant_total' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'montant_paye' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'tva' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:brouillon,emise,partiellement_payee,payee,annulee'],
        ];
    }
}
