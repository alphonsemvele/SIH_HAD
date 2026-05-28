<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RapportHistorique extends Model
{
    protected $table = 'rapport_historiques';

    protected $fillable = [
        'user_id',
        'type',
        'titre',
        'format',
        'taille',
        'statut',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // ── Relations ──────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ── Scopes ──────────────────────────────────────────────────────────────

    public function scopeDisponible($query)
    {
        return $query->where('statut', 'disponible');
    }

    public function scopeCeMois($query)
    {
        return $query->whereMonth('created_at', now()->month)
                     ->whereYear('created_at',  now()->year);
    }
}