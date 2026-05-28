<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VisiteHad extends Model
{
    use HasFactory;

    const PRIORITE_NORMAL       = 'normal';
    const PRIORITE_SURVEILLANCE = 'surveillance';
    const PRIORITE_CRITIQUE     = 'critique';

    protected $fillable = [
        'tournee_id',
        'patient_id',
        'priorite',
        'ordre',
        'chambre',
        'lit',
        'diagnostic',
        'jours_hospitalisation',
        'observations',
        'visite_at',
        'heure_prevue',
        'duree_prevue',
        'temperature',
        'tension',
        'pouls',
        'saturation',
        'notes_soignant',
    ];

    protected function casts(): array
    {
        return [
            'id'                    => 'integer',
            'tournee_id'            => 'integer',
            'patient_id'            => 'integer',
            'ordre'                 => 'integer',
            'jours_hospitalisation' => 'integer',
            'duree_prevue'          => 'integer',
            'visite_at'             => 'datetime',
            'heure_prevue'          => 'datetime',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────

    public function tournee(): BelongsTo
    {
        return $this->belongsTo(Tournee::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function actesRealises(): HasMany
    {
        return $this->hasMany(ActeRealise::class, 'visite_had_id');
    }

    public function photosVisite(): HasMany
    {
        return $this->hasMany(PhotoVisite::class, 'visite_had_id');
    }

    public function signatureVisite(): HasOne
    {
        return $this->hasOne(SignatureVisite::class, 'visite_had_id');
    }

    public function qrScans(): HasMany
    {
        return $this->hasMany(QrScan::class, 'visite_had_id');
    }

    public function qrCodes(): HasMany
    {
        return $this->hasMany(QrCode::class, 'visite_had_id');
    }

    public function preuveVisite(): HasOne
    {
        return $this->hasOne(PreuveVisite::class, 'visite_had_id');
    }

    // ── Accesseurs ────────────────────────────────────────────────────────

    public function getEstVisiteAttribute(): bool
    {
        return $this->visite_at !== null;
    }
}
