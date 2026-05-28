<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alerte extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_nom',
        'diagnostic',
        'alerte',
        'quartier',
        'telephone',
        'age',
        'niveau',
        'date',
        'heure',
    ];

    protected $casts = [
        'age' => 'integer',
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Niveaux d'urgence possibles
    const NIVEAU_CRITIQUE = 'Critique';
    const NIVEAU_URGENT = 'Urgent';
    const NIVEAU_MOYEN = 'Moyen';
    const NIVEAU_FAIBLE = 'Faible';

    public static function getNiveaux(): array
    {
        return [
            self::NIVEAU_CRITIQUE,
            self::NIVEAU_URGENT,
            self::NIVEAU_MOYEN,
            self::NIVEAU_FAIBLE,
        ];
    }

    // Scope pour les alertes critiques
    public function scopeCritiques($query)
    {
        return $query->where('niveau', self::NIVEAU_CRITIQUE);
    }

    // Scope pour les alertes urgentes
    public function scopeUrgentes($query)
    {
        return $query->where('niveau', self::NIVEAU_URGENT);
    }

    // Scope pour les alertes du jour
    public function scopeAujourdhui($query)
    {
        return $query->whereDate('date', now());
    }

    // Accesseur pour le niveau formaté
    public function getNiveauCouleurAttribute(): string
    {
        return match($this->niveau) {
            self::NIVEAU_CRITIQUE => '#FF4433',
            self::NIVEAU_URGENT => '#FF9800',
            self::NIVEAU_MOYEN => '#FFC107',
            self::NIVEAU_FAIBLE => '#4CAF50',
            default => '#9E9E9E',
        };
    }

    // Accesseur pour l'icône du niveau
    public function getNiveauIconeAttribute(): string
    {
        return match($this->niveau) {
            self::NIVEAU_CRITIQUE => 'emergency',
            self::NIVEAU_URGENT => 'warning_amber',
            self::NIVEAU_MOYEN => 'warning',
            self::NIVEAU_FAIBLE => 'info',
            default => 'help',
        };
    }
}
