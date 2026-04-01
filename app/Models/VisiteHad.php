<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisiteHad extends Model
{
    use HasFactory;

    const PRIORITE_NORMAL      = 'normal';
    const PRIORITE_SURVEILLANCE = 'surveillance';
    const PRIORITE_CRITIQUE    = 'critique';

    protected $fillable = [
        'tournee_id',
        'patient_id',
        'priorite',          // normal | surveillance | critique
        'ordre',             // ordre de passage dans la tournée
        'chambre',
        'lit',
        'diagnostic',
        'jours_hospitalisation',
        'observations',      // observations saisies lors de cette visite
        'visite_at',         // null = pas encore visité, datetime = heure de visite
        // Constantes vitales
        'temperature',
        'tension',
        'pouls',
        'saturation',
        'notes_soignant',
    ];

    protected function casts(): array
    {
        return [
            'id'                   => 'integer',
            'tournee_id'           => 'integer',
            'patient_id'           => 'integer',
            'ordre'                => 'integer',
            'jours_hospitalisation'=> 'integer',
            'visite_at'            => 'datetime',
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

    // ── Accesseurs ────────────────────────────────────────────────────────

    public function getEstVisiteAttribute(): bool
    {
        return $this->visite_at !== null;
    }

    // ── Méthodes ──────────────────────────────────────────────────────────

    /**
     * Valide la visite : enregistre l'heure et les observations.
     */
    public function valider(array $data): void
    {
        $this->update([
            'visite_at'       => now(),
            'observations'    => $data['observations'] ?? $this->observations,
            'temperature'     => $data['temperature']  ?? $this->temperature,
            'tension'         => $data['tension']      ?? $this->tension,
            'pouls'           => $data['pouls']        ?? $this->pouls,
            'saturation'      => $data['saturation']   ?? $this->saturation,
            'notes_soignant'  => $data['notes_soignant'] ?? $this->notes_soignant,
        ]);
    }
}