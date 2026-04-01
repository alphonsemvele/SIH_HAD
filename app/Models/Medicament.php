<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicament extends Model
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
        'dci',
        'forme',
        'dosage',
        'categorie_medicament_id',
        'voie_administration',
        'conditionnement',
        'stock_actuel',
        'stock_minimum',
        'stock_maximum',
        'prix_achat',
        'prix_vente',
        'tva',
        'fournisseur_id',
        'date_expiration',
        'emplacement',
        'ordonnance_obligatoire',
        'actif',
        'notes',
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
            'prix_achat' => 'decimal:2',
            'prix_vente' => 'decimal:2',
            'tva' => 'decimal:2',
            'fournisseur_id' => 'integer',
            'date_expiration' => 'date',
            'ordonnance_obligatoire' => 'boolean',
            'actif' => 'boolean',
        ];
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    public function lignePrescriptions(): HasMany
    {
        return $this->hasMany(LignePrescription::class);
    }

    public function mouvementStocks(): HasMany
    {
        return $this->hasMany(MouvementStock::class);
    }

    public function ligneCommandes(): HasMany
    {
        return $this->hasMany(LigneCommande::class);
    }

public function categorieMedicament(): BelongsTo
{
    return $this->belongsTo(CategorieMedicament::class, 'categorie_medicament_id');
}

}
