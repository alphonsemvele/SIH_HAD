<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InsiAppel extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'demandeur_id',
        'mode',
        'parametres_appel',
        'statut',
        'reponse_brute',
        'insi_relation_id',
        'duree_ms',
    ];

    protected $casts = [
        'parametres_appel' => 'array',
        'reponse_brute' => 'array',
        'duree_ms' => 'integer',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function demandeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'demandeur_id');
    }
}
