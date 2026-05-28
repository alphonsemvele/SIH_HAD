<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClotureHadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motif_fin' => ['required', Rule::in(['guerison', 'transfert', 'deces', 'refus_patient', 'reorientation'])],
            'synthese_clinique' => ['required', 'string', 'min:50'],
            'actes_realises' => ['required', 'string', 'min:50'],
            'recommandations_suivi' => ['required', 'string', 'min:50'],
            'correspondants' => ['nullable', 'array'],
            'correspondants.*.nom' => ['required_with:correspondants', 'string', 'max:255'],
            'correspondants.*.profession' => ['nullable', 'string', 'max:255'],
            'correspondants.*.telephone' => ['nullable', 'string', 'max:20'],
            'correspondants.*.email' => ['nullable', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'motif_fin.required' => 'Le motif de fin est obligatoire',
            'motif_fin.in' => 'Le motif de fin doit être: guérison, transfert, décès, refus du patient ou réorientation',
            'synthese_clinique.required' => 'La synthèse clinique est obligatoire',
            'synthese_clinique.min' => 'La synthèse clinique doit contenir au moins 50 caractères',
            'actes_realises.required' => 'Les actes réalisés sont obligatoires',
            'actes_realises.min' => 'Les actes réalisés doivent contenir au moins 50 caractères',
            'recommandations_suivi.required' => 'Les recommandations de suivi sont obligatoires',
            'recommandations_suivi.min' => 'Les recommandations de suivi doivent contenir au moins 50 caractères',
            'correspondants.*.nom.required_with' => 'Le nom du correspondant est obligatoire',
            'correspondants.*.email.email' => 'L\'email du correspondant doit être valide',
        ];
    }
}
