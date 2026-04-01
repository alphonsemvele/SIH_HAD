<?php
// ─── LitStoreRequest ───────────────────────────────────────────────────────────
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LitStoreRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'numero'          => 'required|string|max:20|unique:lits,numero',
            'service_id'      => 'required|exists:services,id',
            'chambre'         => 'nullable|string|max:50',
            'type'            => 'required|in:standard,vip,reanimation,isolement,maternite',
            'statut'          => 'required|in:disponible,occupe,nettoyage,hors-service',
            'equipements'     => 'nullable|array',
            'equipements.*'   => 'string|max:100',
            'tarif_journalier' => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string|max:500',
        ];
    }
}