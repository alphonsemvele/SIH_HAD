<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero',
        'facture_id',
        'date_paiement',
        'montant',
        'mode_paiement',
        'reference',
        'banque',
        'telephone_mobile_money',
        'recu_par',
        'notes',
        'statut',
        'recu_par_id',
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
            'date_paiement' => 'datetime',
            'montant' => 'decimal:2',
            'recu_par' => 'integer',
            'recu_par_id' => 'integer',
        ];
    }

    public function facture(): BelongsTo
    {
        return $this->belongsTo(Facture::class);
    }

    public function recuPar(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

 
}
