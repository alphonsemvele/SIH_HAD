<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneDelivrance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'delivrance_id',
        'medicament_id',
        'quantite',
        'prix_unitaire',
        'prix_total',
        'lot',
        'date_expiration',
        'numero_lot',
        'date_peremption',
        'code_cip13',
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
            'delivrance_id' => 'integer',
            'medicament_id' => 'integer',
            'prix_unitaire' => 'decimal:2',
            'prix_total' => 'decimal:2',
            'date_expiration' => 'date',
            'date_peremption' => 'date',
        ];
    }

    public function delivrance(): BelongsTo
    {
        return $this->belongsTo(Delivrance::class);
    }

    public function medicament(): BelongsTo
    {
        return $this->belongsTo(Medicament::class);
    }
}
