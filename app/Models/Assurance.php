<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assurance extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'nom',
        'type',
        'adresse',
        'telephone',
        'email',
        'taux_couverture',
        'plafond_annuel',
        'delai_paiement',
        'contact_nom',
        'contact_telephone',
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
            'taux_couverture' => 'decimal:2',
            'plafond_annuel' => 'decimal:2',
            'actif' => 'boolean',
        ];
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function factures(): HasMany
    {
        return $this->hasMany(Facture::class);
    }
}
