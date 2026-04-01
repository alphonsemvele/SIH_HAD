<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DelivranceUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:delivrances,numero'],
            'prescription_id' => ['required', 'integer', 'exists:prescriptions,id'],
            'pharmacien_id' => ['required', 'integer', 'exists:users,id'],
            'date_delivrance' => ['required'],
            'montant_total' => ['required', 'numeric', 'between:-99999999.99,99999999.99'],
            'montant_paye' => ['required', 'numeric', 'between:-99999999.99,99999999.99'],
            'mode_paiement' => ['nullable', 'in:especes,carte,mobile_money,assurance,credit'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:en_cours,terminee,annulee'],
        ];
    }
}
