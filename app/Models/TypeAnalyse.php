<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeAnalyse extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'nom',
        'categorie',
        'description',
        'delai_resultat_heures',
        'prix',
        'valeurs_normales',
        'echantillon_requis',
        'preparation_patient',
        'actif',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'prix' => 'decimal:2',
            'valeurs_normales' => 'array',
            'actif' => 'boolean',
        ];
    }

    public function analyseLaboratoires(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }
}
