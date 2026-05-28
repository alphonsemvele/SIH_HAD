<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planning extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'type',
        'date',
        'heure_debut',
        'heure_fin',
        'secteur',
        'lieu',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Types d'événements possibles
    const TYPE_TOURNEE = 'tournee';
    const TYPE_REUNION = 'reunion';
    const TYPE_FORMATION = 'formation';
    const TYPE_URGENCE = 'urgence';
    const TYPE_CONSULTATION = 'consultation';
    const TYPE_AUTRE = 'autre';

    public static function getTypes(): array
    {
        return [
            self::TYPE_TOURNEE,
            self::TYPE_REUNION,
            self::TYPE_FORMATION,
            self::TYPE_URGENCE,
            self::TYPE_CONSULTATION,
            self::TYPE_AUTRE,
        ];
    }

    // Scope pour les tournées
    public function scopeTournees($query)
    {
        return $query->where('type', self::TYPE_TOURNEE);
    }

    // Scope pour les réunions
    public function scopeReunions($query)
    {
        return $query->where('type', self::TYPE_REUNION);
    }

    // Scope pour les formations
    public function scopeFormations($query)
    {
        return $query->where('type', self::TYPE_FORMATION);
    }

    // Scope pour les événements d'aujourd'hui
    public function scopeAujourdhui($query)
    {
        return $query->whereDate('date', now());
    }

    // Scope pour les événements à venir
    public function scopeAVenir($query)
    {
        return $query->whereDate('date', '>=', now());
    }

    // Scope pour les événements passés
    public function scopePasses($query)
    {
        return $query->whereDate('date', '<', now());
    }

    // Accesseur pour le type formaté
    public function getTypeLibelleAttribute(): string
    {
        return match($this->type) {
            self::TYPE_TOURNEE => 'Tournée',
            self::TYPE_REUNION => 'Réunion',
            self::TYPE_FORMATION => 'Formation',
            self::TYPE_URGENCE => 'Urgence',
            self::TYPE_CONSULTATION => 'Consultation',
            self::TYPE_AUTRE => 'Autre',
            default => 'Inconnu',
        };
    }

    // Accesseur pour la couleur du type
    public function getTypeCouleurAttribute(): string
    {
        return match($this->type) {
            self::TYPE_TOURNEE => '#FF4433',
            self::TYPE_REUNION => '#2196F3',
            self::TYPE_FORMATION => '#9C27B0',
            self::TYPE_URGENCE => '#FF9800',
            self::TYPE_CONSULTATION => '#4CAF50',
            self::TYPE_AUTRE => '#607D8B',
            default => '#9E9E9E',
        };
    }

    // Accesseur pour l'icône du type
    public function getTypeIconeAttribute(): string
    {
        return match($this->type) {
            self::TYPE_TOURNEE => 'directions_car',
            self::TYPE_REUNION => 'groups',
            self::TYPE_FORMATION => 'school',
            self::TYPE_URGENCE => 'warning',
            self::TYPE_CONSULTATION => 'medical_services',
            self::TYPE_AUTRE => 'event',
            default => 'help',
        };
    }

    // Accesseur pour l'heure formatée
    public function getHeureFormatteeAttribute(): string
    {
        return "{$this->heure_debut} - {$this->heure_fin}";
    }

    // Vérifier si l'événement est aujourd'hui
    public function estAujourdhui(): bool
    {
        return $this->date->isToday();
    }

    // Vérifier si l'événement est passé
    public function estPasse(): bool
    {
        return $this->date < now()->startOfDay();
    }

    // Vérifier si l'événement est à venir
    public function estAVenir(): bool
    {
        return $this->date >= now()->startOfDay();
    }
}
