<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LigneCommande extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'commande_id',
        'medicament_id',
        'quantite_commandee',
        'quantite_recue',
        'prix_unitaire',
        'prix_total',
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
            'commande_id' => 'integer',
            'medicament_id' => 'integer',
            'prix_unitaire' => 'decimal:2',
            'prix_total' => 'decimal:2',
        ];
    }

    public function commande(): BelongsTo
    {
        return $this->belongsTo(CommandeFournisseur::class);
    }

    public function medicament(): BelongsTo
    {
        return $this->belongsTo(Medicament::class);
    }
}
