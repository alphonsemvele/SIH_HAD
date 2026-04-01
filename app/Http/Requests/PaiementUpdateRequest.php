<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaiementUpdateRequest extends FormRequest
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
            'numero' => ['required', 'string', 'max:20', 'unique:paiements,numero'],
            'facture_id' => ['required', 'integer', 'exists:factures,id'],
            'date_paiement' => ['required'],
            'montant' => ['required', 'numeric', 'between:-9999999999.99,9999999999.99'],
            'mode_paiement' => ['required', 'in:especes,carte_bancaire,mobile_money,cheque,virement,assurance'],
            'reference' => ['nullable', 'string', 'max:100'],
            'banque' => ['nullable', 'string', 'max:100'],
            'telephone_mobile_money' => ['nullable', 'string', 'max:20'],
            'recu_par' => ['required'],
            'notes' => ['nullable', 'string'],
            'statut' => ['required', 'in:en_attente,confirme,annule'],
            'recu_par_id' => ['required', 'integer', 'exists:Users,id'],
        ];
    }
}
