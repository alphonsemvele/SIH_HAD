<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;

class PatientUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'date_naissance' => ['sometimes', 'date'],
            'sexe' => ['sometimes', 'in:M,F'],
            'lieu_naissance' => ['nullable', 'string', 'max:255'],
            'nationalite' => ['nullable', 'string', 'max:100'],
            'cni' => ['nullable', 'string', 'max:50'],
            'telephone' => ['nullable', 'string', 'max:20'],
            'telephone_urgence' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'adresse' => ['nullable', 'string', 'max:500'],
            'ville' => ['nullable', 'string', 'max:100'],
            'quartier' => ['nullable', 'string', 'max:100'],
            'profession' => ['nullable', 'string', 'max:100'],
            'situation_matrimoniale' => ['nullable', 'in:Célibataire,Marié(e),Divorcé(e),Veuf(ve)'],
            'groupe_sanguin' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'allergies' => ['nullable'],
            'antecedents_medicaux' => ['nullable', 'array'],
            'antecedents_chirurgicaux' => ['nullable', 'array'],
            'antecedents_familiaux' => ['nullable', 'array'],
            'assurance_id' => ['nullable', 'exists:assurances,id'],
            'numero_assurance' => ['nullable', 'string', 'max:100'],
            'personne_contact_nom' => ['nullable', 'string', 'max:255'],
            'personne_contact_telephone' => ['nullable', 'string', 'max:20'],
            'personne_contact_lien' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'statut' => ['sometimes', 'in:' . implode(',', Patient::getStatuts())],
        ];
    }

    public function messages(): array
    {
        return [
            'date_naissance.date' => 'La date de naissance doit être une date valide.',
            'sexe.in' => 'Le sexe doit être M ou F.',
            'email.email' => 'L\'adresse email doit être valide.',
            'groupe_sanguin.in' => 'Le groupe sanguin sélectionné n\'est pas valide.',
            'statut.in' => 'Le statut sélectionné n\'est pas valide.',
        ];
    }
}