<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rapport extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'contenu',
        'type',
        'status',
        'date_rapport',
        'patient_id',
        'tournee_id',
        'fichier_path',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date_rapport' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
    'date_formatee',
    'status_libelle',
    'type_libelle',
    'status_couleur',
    'type_icone',
    'status_icone',
    'time_ago',
    ];
    // Types de rapports possibles
    const TYPE_VISITE = 'visite';
    const TYPE_TOURNEE = 'tournee';
    const TYPE_INCIDENT = 'incident';
    const TYPE_MEDICAL = 'medical';
    const TYPE_ADMINISTRATIF = 'administratif';
    const TYPE_AUTRE = 'autre';

    // Statuts possibles
    const STATUS_BROUILLON = 'brouillon';
    const STATUS_EN_COURS = 'en_cours';
    const STATUS_COMPLET = 'complet';
    const STATUS_ANNULE = 'annule';

    public static function getTypes(): array
    {
        return [
            self::TYPE_VISITE,
            self::TYPE_TOURNEE,
            self::TYPE_INCIDENT,
            self::TYPE_MEDICAL,
            self::TYPE_ADMINISTRATIF,
            self::TYPE_AUTRE,
        ];
    }

    public static function getStatus(): array
    {
        return [
            self::STATUS_BROUILLON,
            self::STATUS_EN_COURS,
            self::STATUS_COMPLET,
            self::STATUS_ANNULE,
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function tournee(): BelongsTo
    {
        return $this->belongsTo(Tournee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scope pour les rapports de type visite
    public function scopeVisites($query)
    {
        return $query->where('type', self::TYPE_VISITE);
    }

    // Scope pour les rapports de tournée
    public function scopeTournees($query)
    {
        return $query->where('type', self::TYPE_TOURNEE);
    }

    // Scope pour les rapports d'incident
    public function scopeIncidents($query)
    {
        return $query->where('type', self::TYPE_INCIDENT);
    }

    // Scope pour les rapports médicaux
    public function scopeMedicals($query)
    {
        return $query->where('type', self::TYPE_MEDICAL);
    }

    // Scope pour les rapports administratifs
    public function scopeAdministratifs($query)
    {
        return $query->where('type', self::TYPE_ADMINISTRATIF);
    }

    // Scope pour les rapports complets
    public function scopeComplets($query)
    {
        return $query->where('status', self::STATUS_COMPLET);
    }

    // Scope pour les rapports en cours
    public function scopeEnCours($query)
    {
        return $query->where('status', self::STATUS_EN_COURS);
    }

    // Scope pour les rapports brouillons
    public function scopeBrouillons($query)
    {
        return $query->where('status', self::STATUS_BROUILLON);
    }

    // Scope pour les rapports d'aujourd'hui
    public function scopeAujourdhui($query)
    {
        return $query->whereDate('date_rapport', now());
    }

    // Scope pour les rapports de cette semaine
    public function scopeCetteSemaine($query)
    {
        return $query->whereBetween('date_rapport', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    // Scope pour les rapports de ce mois
    public function scopeCeMois($query)
    {
        return $query->whereMonth('date_rapport', now()->month)
                     ->whereYear('date_rapport', now()->year);
    }

    // Accesseur pour le type formaté
    public function getTypeLibelleAttribute(): string
    {
        return match($this->type) {
            self::TYPE_VISITE => 'Visite patient',
            self::TYPE_TOURNEE => 'Tournée HAD',
            self::TYPE_INCIDENT => 'Incident/Accident',
            self::TYPE_MEDICAL => 'Rapport médical',
            self::TYPE_ADMINISTRATIF => 'Rapport administratif',
            self::TYPE_AUTRE => 'Autre',
            default => 'Inconnu',
        };
    }

    // Accesseur pour le statut formaté
    public function getStatusLibelleAttribute(): string
    {
        return match($this->status) {
            self::STATUS_BROUILLON => 'Brouillon',
            self::STATUS_EN_COURS => 'En cours',
            self::STATUS_COMPLET => 'Complété',
            self::STATUS_ANNULE => 'Annulé',
            default => 'Inconnu',
        };
    }

    // Accesseur pour la couleur du statut
    public function getStatusCouleurAttribute(): string
    {
        return match($this->status) {
            self::STATUS_BROUILLON => '#9E9E9E',
            self::STATUS_EN_COURS => '#FF9800',
            self::STATUS_COMPLET => '#4CAF50',
            self::STATUS_ANNULE => '#F44336',
            default => '#9E9E9E',
        };
    }

    // Accesseur pour l'icône du type
    public function getTypeIconeAttribute(): string
    {
        return match($this->type) {
            self::TYPE_VISITE => 'person',
            self::TYPE_TOURNEE => 'directions_car',
            self::TYPE_INCIDENT => 'warning',
            self::TYPE_MEDICAL => 'medical_services',
            self::TYPE_ADMINISTRATIF => 'description',
            self::TYPE_AUTRE => 'article',
            default => 'help',
        };
    }

    // Accesseur pour l'icône du statut
    public function getStatusIconeAttribute(): string
    {
        return match($this->status) {
            self::STATUS_BROUILLON => 'edit',
            self::STATUS_EN_COURS => 'hourglass_empty',
            self::STATUS_COMPLET => 'check_circle',
            self::STATUS_ANNULE => 'cancel',
            default => 'help',
        };
    }

    // Accesseur pour le contenu résumé
    public function getResumeAttribute(): string
    {
        return strlen($this->contenu) > 100 
            ? substr($this->contenu, 0, 100) . '...' 
            : $this->contenu;
    }

    // Vérifier si le rapport est complet
    public function estComplet(): bool
    {
        return $this->status === self::STATUS_COMPLET;
    }

    // Vérifier si le rapport est en cours
    public function estEnCours(): bool
    {
        return $this->status === self::STATUS_EN_COURS;
    }

    // Vérifier si le rapport est un brouillon
    public function estBrouillon(): bool
    {
        return $this->status === self::STATUS_BROUILLON;
    }

    // Vérifier si le rapport est annulé
    public function estAnnule(): bool
    {
        return $this->status === self::STATUS_ANNULE;
    }

    // Vérifier si le rapport est d'aujourd'hui
    public function estAujourdhui(): bool
    {
        return $this->date_rapport->isToday();
    }

    // Obtenir le temps relatif
    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Obtenir la date formatée
    public function getDateFormateeAttribute(): string
    {
        return $this->date_rapport->format('d/m/Y');
    }
}
