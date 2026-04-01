<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MedicamentUpdateRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:20', 'unique:medicaments,code'],
            'nom' => ['required', 'string', 'max:200'],
            'dci' => ['nullable', 'string', 'max:200'],
            'forme' => ['required', 'in:comprime,gelule,sirop,injectable,pommade,collyre,suppositoire,solution,poudre,autre'],
            'dosage' => ['nullable', 'string', 'max:50'],
            'categorie' => ['required', 'in:antalgique,antibiotique,anti_inflammatoire,antidiabetique,antihypertenseur,antipaludeen,antiseptique,vitamine,autre'],
            'voie_administration' => ['required', 'in:orale,injectable,cutanee,rectale,oculaire,nasale,auriculaire,autre'],
            'conditionnement' => ['nullable', 'string', 'max:100'],
            'stock_actuel' => ['required', 'integer'],
            'stock_minimum' => ['required', 'integer'],
            'stock_maximum' => ['required', 'integer'],
            'prix_achat' => ['required', 'numeric', 'between:-99999999.99,99999999.99'],
            'prix_vente' => ['required', 'numeric', 'between:-99999999.99,99999999.99'],
            'tva' => ['required', 'numeric', 'between:-999.99,999.99'],
            'fournisseur_id' => ['nullable', 'integer', 'exists:fournisseurs,id'],
            'date_expiration' => ['nullable', 'date'],
            'emplacement' => ['nullable', 'string', 'max:50'],
            'ordonnance_obligatoire' => ['required'],
            'actif' => ['required'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
