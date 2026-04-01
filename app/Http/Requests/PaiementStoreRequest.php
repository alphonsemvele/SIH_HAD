<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaiementStoreRequest extends FormRequest
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
            'facture_id' => ['required', 'integer', 'exists:factures,id'],
            'montant' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'mode_paiement' => ['required', 'in:especes,carte_bancaire,mobile_money,cheque,virement,assurance'],
            'date_paiement' => ['required'],
        ];
    }
}
