<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RealisationVisiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'actes' => 'required|array',
            'actes.*.libelle' => 'required|string',
            'actes.*.acte_medical_id' => 'nullable|integer|exists:acte_medicals,id',
            'actes.*.observations' => 'nullable|string|max:2000',
            'actes.*.non_prevu' => 'boolean',
            
            'constantes' => 'array',
            'constantes.tension_systolique' => 'nullable|numeric',
            'constantes.tension_diastolique' => 'nullable|numeric',
            'constantes.frequence_cardiaque' => 'nullable|numeric',
            'constantes.temperature' => 'nullable|numeric',
            'constantes.spo2' => 'nullable|numeric',
            'constantes.glycemie' => 'nullable|numeric',
            'constantes.eva' => 'nullable|numeric',
            
            'photos' => 'array|max:10',
            'photos.*' => 'file|image|max:5120', // 5MB max
            
            'signature_image' => 'nullable|file|image',
            
            'signataire' => 'nullable|string|in:patient,aidant,refus',
            'aidant_id' => 'nullable|integer|exists:users,id',
            
            'heure_arrivee' => 'required|date_format:Y-m-d H:i:s',
            'heure_depart' => 'nullable|date_format:Y-m-d H:i:s|after:heure_arrivee',
            
            'commentaires' => 'nullable|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'actes.required' => 'Les actes réalisés sont obligatoires',
            'actes.*.libelle.required' => 'Le libellé de chaque acte est obligatoire',
            'actes.*.acte_medical_id.exists' => 'L\'acte médical sélectionné n\'existe pas',
            'photos.*.max' => 'Maximum 10 photos autorisées',
            'photos.*.image' => 'Les photos doivent être des images valides (max 5MB)',
            'signature_image.image' => 'La signature doit être une image valide',
            'signataire.in' => 'Le signataire doit être patient, aidant ou refus',
            'heure_arrivee.required' => 'L\'heure d\'arrivée est obligatoire',
            'heure_arrivee.date_format' => 'Format d\'heure invalide',
            'heure_depart.after' => 'L\'heure de départ doit être après l\'heure d\'arrivée',
        ];
    }
}
