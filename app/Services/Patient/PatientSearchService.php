<?php

namespace App\Services\Patient;

use App\Models\Patient;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PatientSearchService
{
    public function search(string $query, int $perPage = 20): LengthAwarePaginator
    {
        $trimmedQuery = trim($query);
        
        if (empty($trimmedQuery)) {
            return Patient::query()->paginate($perPage);
        }

        return Patient::query()
            ->where(function ($q) use ($trimmedQuery) {
                $q->where('nom', 'ilike', "%{$trimmedQuery}%")
                  ->orWhere('prenom', 'ilike', "%{$trimmedQuery}%")
                  ->orWhere('numero_dossier', 'ilike', "%{$trimmedQuery}%")
                  ->orWhere('telephone', 'ilike', "%{$trimmedQuery}%")
                  ->orWhere('email', 'ilike', "%{$trimmedQuery}%");
            })
            ->orderBy('nom')
            ->orderBy('prenom')
            ->paginate($perPage);
    }
}
