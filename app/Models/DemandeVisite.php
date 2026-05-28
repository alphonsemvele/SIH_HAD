<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DemandeVisite extends Model
{
    use HasFactory;

    protected $table = 'demandes_visite';

    protected $fillable = [
        'patient_id',
        'patient_nom',
        'patient_telephone',
        'patient_age',
        'adresse',
        'quartier',
        'ville',
        'latitude',
        'longitude',
        'symptomes',
        'duree_symptomes',
        'urgence',
        'type',
        'statut',
        'demandeur_nom',
        'demandeur_relation',
        'assigned_to',
        'visite_id',
        'notes_infirmier',
        'raison_refus',
        'date_souhaitee',
        'heure_souhaitee',
    ];

    protected $casts = [
        'patient_age' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'date_souhaitee' => 'date',
    ];

    // Constantes pour les enums
    public const URGENCES = ['faible', 'moyenne', 'urgente', 'critique'];
    public const TYPES = ['visite', 'conseil_tel', 'urgence'];
    public const STATUTS = ['en_attente', 'acceptee', 'en_cours', 'terminee', 'refusee'];

    // Relations
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Scopes
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeAcceptees($query)
    {
        return $query->whereIn('statut', ['acceptee', 'en_cours']);
    }

    public function scopeTerminees($query)
    {
        return $query->whereIn('statut', ['terminee', 'refusee']);
    }

    public function scopeCritiques($query)
    {
        return $query->whereIn('urgence', ['critique', 'urgente']);
    }

    // Helpers
    public function getUrgenceLibelleAttribute(): string
    {
        return match($this->urgence) {
            'faible' => 'Faible',
            'moyenne' => 'Moyenne',
            'urgente' => 'Urgente',
            'critique' => 'Critique',
            default => '—',
        };
    }

    public function getStatutLibelleAttribute(): string
    {
        return match($this->statut) {
            'en_attente' => 'En attente',
            'acceptee' => 'Acceptée',
            'en_cours' => 'En cours',
            'terminee' => 'Terminée',
            'refusee' => 'Refusée',
            default => '—',
        };
    }

    public function getTypeLibelleAttribute(): string
    {
        return match($this->type) {
            'visite' => 'Visite à domicile',
            'conseil_tel' => 'Conseil téléphonique',
            'urgence' => 'Urgence',
            default => '—',
        };
    }
}
