<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneFacture extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'facture_id',
        'designation',
        'type',
        'reference_id',
        'quantite',
        'prix_unitaire',
        'remise',
        'tva',
        'prix_total',
        'couvert_assurance',
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
            'facture_id' => 'integer',
            'prix_unitaire' => 'decimal:2',
            'remise' => 'decimal:2',
            'tva' => 'decimal:2',
            'prix_total' => 'decimal:2',
            'couvert_assurance' => 'boolean',
        ];
    }

    public function facture(): BelongsTo
    {
        return $this->belongsTo(Facture::class);
    }
}
