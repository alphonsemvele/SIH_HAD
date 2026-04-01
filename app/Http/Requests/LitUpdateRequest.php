<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LitUpdateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'numero'          => ['sometimes', 'string', 'max:20', Rule::unique('lits', 'numero')->ignore($this->lit)],
            'service_id'      => 'sometimes|exists:services,id',
            'chambre'         => 'nullable|string|max:50',
            'type'            => 'sometimes|in:standard,vip,reanimation,isolement,maternite',
            'statut'          => 'sometimes|in:disponible,occupe,nettoyage,hors-service',
            'equipements'     => 'nullable|array',
            'equipements.*'   => 'string|max:100',
            'tarif_journalier' => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string|max:500',
        ];
    }
}