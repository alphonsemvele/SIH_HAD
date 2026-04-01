<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivrance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero',
        'prescription_id',
        'pharmacien_id',
        'date_delivrance',
        'montant_total',
        'montant_paye',
        'mode_paiement',
        'notes',
        'statut',
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
            'prescription_id' => 'integer',
            'pharmacien_id' => 'integer',
            'date_delivrance' => 'datetime',
            'montant_total' => 'decimal:2',
            'montant_paye' => 'decimal:2',
        ];
    }

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function pharmacien(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ligneDelivrances(): HasMany
    {
        return $this->hasMany(LigneDelivrance::class);
    }
}
