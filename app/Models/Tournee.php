<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Tournee extends Model
{
    use HasFactory, SoftDeletes;

    // ── Statuts ──────────────────────────────────────────────────────────
    const STATUT_PLANIFIEE  = 'planifiee';
    const STATUT_EN_COURS   = 'en_cours';
    const STATUT_TERMINEE   = 'terminee';
    const STATUT_ANNULEE    = 'annulee';

    const STATUTS = [
        self::STATUT_PLANIFIEE,
        self::STATUT_EN_COURS,
        self::STATUT_TERMINEE,
        self::STATUT_ANNULEE,
    ];

    // ── Types de tournée ─────────────────────────────────────────────────
    const TYPE_COMPLETE       = 'complete';
    const TYPE_CAS_CRITIQUES  = 'cas_critiques';
    const TYPE_CHAMBRE_SPECIF = 'chambre_specifique';

    const TYPES = [
        self::TYPE_COMPLETE,
        self::TYPE_CAS_CRITIQUES,
        self::TYPE_CHAMBRE_SPECIF,
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'soignant_id',          // FK vers users (médecin / infirmier qui fait la tournée)
        'service_id',           // FK vers services
        'date',
        'vehicule',             // immatriculation ou libellé du véhicule (HAD)
        'heure_debut_prevue',
        'heure_fin_prevue',
        'heure_debut_effective',
        'heure_fin_effective',
        'kilometres',           // km parcourus (HAD)
        'type',                 // complete | cas_critiques | chambre_specifique
        'notes',
        'statut',               // planifiee | en_cours | terminee | annulee
    ];

    /**
     * Casts
     */
    protected function casts(): array
    {
        return [
            'id'                     => 'integer',
            'soignant_id'            => 'integer',
            'service_id'             => 'integer',
            'date'                   => 'date',
            'heure_debut_prevue'     => 'datetime:H:i',
            'heure_fin_prevue'       => 'datetime:H:i',
            'heure_debut_effective'  => 'datetime:H:i',
            'heure_fin_effective'    => 'datetime:H:i',
            'kilometres'             => 'decimal:2',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────

    /** Soignant (médecin / infirmier) qui effectue la tournée */
    public function soignant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'soignant_id');
    }

    /** Service hospitalier concerné */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** Visites individuelles par patient au sein de cette tournée */
    public function visiteHads(): HasMany
    {
        return $this->hasMany(VisiteHad::class);
    }

    /** Visites déjà effectuées (visite_at non null) */
    public function visitesEffectuees(): HasMany
    {
        return $this->visiteHads()->whereNotNull('visite_at');
    }

    // ── Accesseurs ────────────────────────────────────────────────────────

    /** Nombre total de patients à visiter */
    public function getPatientsTotal(): int
    {
        return $this->visiteHads()->count();
    }

    /** Nombre de patients déjà visités */
    public function getPatientsVus(): int
    {
        return $this->visitesEffectuees()->count();
    }

    /** Durée effective en minutes (null si pas encore terminée) */
    public function getDureeEffective(): ?int
    {
        if (!$this->heure_debut_effective || !$this->heure_fin_effective) {
            return null;
        }
        return (int) Carbon::parse($this->heure_debut_effective)
            ->diffInMinutes(Carbon::parse($this->heure_fin_effective));
    }

    /** Libellé du statut pour l'affichage */
    public function getStatutLabel(): string
    {
        return match ($this->statut) {
            self::STATUT_PLANIFIEE => 'Planifiée',
            self::STATUT_EN_COURS  => 'En cours',
            self::STATUT_TERMINEE  => 'Terminée',
            self::STATUT_ANNULEE   => 'Annulée',
            default                => ucfirst($this->statut),
        };
    }

    // ── Scopes ────────────────────────────────────────────────────────────

    public function scopePlanifiees($query)
    {
        return $query->where('statut', self::STATUT_PLANIFIEE);
    }

    public function scopeEnCours($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS);
    }

    public function scopeTerminees($query)
    {
        return $query->where('statut', self::STATUT_TERMINEE);
    }

    public function scopeDuJour($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeDuService($query, int $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    public function scopeDuSoignant($query, int $soignantId)
    {
        return $query->where('soignant_id', $soignantId);
    }

    // ── Méthodes métier ───────────────────────────────────────────────────

    /**
     * Démarre la tournée : passe le statut à "en_cours",
     * enregistre l'heure de début effective.
     */
    public function demarrer(): void
    {
        $this->update([
            'statut'                 => self::STATUT_EN_COURS,
            'heure_debut_effective'  => now(),
        ]);
    }

    /**
     * Termine la tournée : passe le statut à "terminee",
     * enregistre l'heure de fin effective.
     */
    public function terminer(): void
    {
        $this->update([
            'statut'                => self::STATUT_TERMINEE,
            'heure_fin_effective'   => now(),
        ]);
    }

    /**
     * Annule la tournée.
     */
    public function annuler(string $raison = ''): void
    {
        $this->update([
            'statut' => self::STATUT_ANNULEE,
            'notes'  => $raison ? ($this->notes . "\n[Annulation] " . $raison) : $this->notes,
        ]);
    }

    /**
     * Suspend temporairement la tournée (repasse en planifiée).
     */
    public function suspendre(): void
    {
        $this->update(['statut' => self::STATUT_PLANIFIEE]);
    }
}