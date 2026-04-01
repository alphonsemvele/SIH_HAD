<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MedicamentStoreRequest extends FormRequest
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
            'forme' => ['required', 'in:comprime,gelule,sirop,injectable,pommade,collyre,suppositoire,solution,poudre,autre'],
            'categorie' => ['required', 'in:antalgique,antibiotique,anti_inflammatoire,antidiabetique,antihypertenseur,antipaludeen,antiseptique,vitamine,autre'],
            'prix_vente' => ['required', 'numeric', 'between:-99999999.99,99999999.99'],
        ];
    }
}
