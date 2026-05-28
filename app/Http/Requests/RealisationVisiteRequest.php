<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RealisationVisiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Mappe automatiquement les noms d'alias mobile vers les noms backend
     * pour la rétro-compat.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        // Alias actes_realises → actes
        if ($this->has('actes_realises') && !$this->has('actes')) {
            $merge['actes'] = $this->input('actes_realises');
        }

        // Alias signature_type → signataire
        if ($this->has('signature_type') && !$this->has('signataire')) {
            $merge['signataire'] = $this->input('signature_type');
        }

        // Alias refus_motif → motif_refus
        if ($this->has('refus_motif') && !$this->has('motif_refus')) {
            $merge['motif_refus'] = $this->input('refus_motif');
        }

        // Alias signature → signature_image (file)
        if ($this->hasFile('signature') && !$this->hasFile('signature_image')) {
            $merge['signature_image'] = $this->file('signature');
        }

        // Construire les constantes depuis les champs racine envoyés par le mobile
        // (le mobile envoie ta_systolique au niveau racine, pas dans constantes[])
        if (!$this->has('constantes')) {
            $constantes = array_filter([
                'ta_systolique'  => $this->input('ta_systolique'),
                'ta_diastolique' => $this->input('ta_diastolique'),
                'fc'             => $this->input('fc'),
                't'              => $this->input('t'),
                'spo2'           => $this->input('spo2'),
                'glycemie'       => $this->input('glycemie'),
                'eva'            => $this->input('eva_douleur') ?? $this->input('eva'),
            ], fn($v) => $v !== null && $v !== '');

            if (!empty($constantes)) {
                $merge['constantes'] = $constantes;
            }
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'actes'                        => 'required|array|min:1',
            'actes.*.libelle'              => 'required|string',
            'actes.*.acte_medical_id'      => 'nullable|integer',
            'actes.*.code_ccam'            => 'nullable|string|max:20',
            'actes.*.observations'         => 'nullable|string|max:2000',
            'actes.*.non_prevu'            => 'nullable|boolean',

            'constantes'                   => 'nullable|array',
            'constantes.ta_systolique'     => 'nullable|numeric',
            'constantes.ta_diastolique'    => 'nullable|numeric',
            'constantes.fc'                => 'nullable|numeric',
            'constantes.t'                 => 'nullable|numeric',
            'constantes.spo2'              => 'nullable|numeric',
            'constantes.glycemie'          => 'nullable|numeric',
            'constantes.eva'               => 'nullable|numeric',

            'photos'                       => 'nullable|array|max:10',
            'photos.*'                     => 'nullable|file|max:5120',

            'signature_image'              => 'nullable|file',
            'signataire'                   => 'nullable|string|in:patient,aidant,refus',
            'aidant_id'                    => 'nullable|integer',
            'motif_refus'                  => 'nullable|string|max:500',

            'heure_arrivee'                => 'nullable|string',
            'heure_depart'                 => 'nullable|string',

            'commentaires'                 => 'nullable|string|max:5000',
            'notes_soignant'               => 'nullable|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'actes.required'              => 'Au moins un acte est obligatoire',
            'actes.*.libelle.required'    => 'Le libellé de chaque acte est obligatoire',
            'photos.*.max'                => 'Photos max 5 Mo chacune',
            'signataire.in'               => 'Signataire : patient, aidant ou refus',
        ];
    }
}
