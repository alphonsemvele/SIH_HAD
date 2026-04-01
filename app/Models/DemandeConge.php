<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandeConge extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'type',
        'date_debut',
        'date_fin',
        'nombre_jours',
        'motif',
        'piece_jointe',
        'valideur_id',
        'date_validation',
        'commentaire_validation',
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
            'user_id' => 'integer',
            'date_debut' => 'date',
            'date_fin' => 'date',
            'valideur_id' => 'integer',
            'date_validation' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function valideur(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
