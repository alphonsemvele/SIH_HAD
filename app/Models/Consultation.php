<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultation extends Model
{
    use HasFactory, SoftDeletes;

    // ── Statuts ───────────────────────────────────────────────────────────

    const STATUT_EN_ATTENTE = 'en_attente';
    const STATUT_EN_COURS   = 'en_cours';
    const STATUT_TERMINEE   = 'terminee';
    const STATUT_ANNULEE    = 'annulee';

    const STATUTS = [
        self::STATUT_EN_ATTENTE,
        self::STATUT_EN_COURS,
        self::STATUT_TERMINEE,
        self::STATUT_ANNULEE,
    ];

    // ── Types ─────────────────────────────────────────────────────────────

    const TYPE_INTERNE          = 'interne';
    const TYPE_EXTERNE          = 'externe';
    const TYPE_URGENCE          = 'urgence';
    const TYPE_TELECONSULTATION = 'teleconsultation';

    const TYPES = [
        self::TYPE_INTERNE,
        self::TYPE_EXTERNE,
        self::TYPE_URGENCE,
        self::TYPE_TELECONSULTATION,
    ];

    // ── Fillable ──────────────────────────────────────────────────────────

    protected $fillable = [
        'numero',
        'patient_id',
        'medecin_id',
        'admission_id',
        'rendez_vous_id',
        'service_id',
        'date_consultation',
        'motif',
        'type',
        'statut',
        'histoire_maladie',
        'examen_clinique',
        'hypotheses_diagnostiques',
        'diagnostic_principal',
        'diagnostics_secondaires',
        'conduite_a_tenir',
        'recommandations',
        'prochain_rdv',
        'duree_minutes',
        'heure_debut',
        'heure_fin',
        'ordonnance',
        'examens_demandes',
        'notes',
        'anomalie_ids',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────

    protected function casts(): array
    {
        return [
            'id'                       => 'integer',
            'patient_id'               => 'integer',
            'medecin_id'               => 'integer',
            'admission_id'             => 'integer',
            'rendez_vous_id'           => 'integer',
            'service_id'               => 'integer',
            'duree_minutes'            => 'integer',
            'date_consultation'        => 'datetime',
            'prochain_rdv'             => 'date',
            'hypotheses_diagnostiques' => 'array',
            'diagnostics_secondaires'  => 'array',
            'ordonnance'               => 'boolean',
            'examens_demandes'         => 'boolean',
            'heure_debut'              => 'string',
            'heure_fin'                => 'string',
        'anomalie_ids'             => 'array',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function rendezVous(): BelongsTo
    {
        return $this->belongsTo(RendezVous::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function analyseLaboratoires(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }

    public function examenImageries(): HasMany
    {
        return $this->hasMany(ExamenImagerie::class);
    }

    public function acteMedicals(): HasMany
    {
        return $this->hasMany(ActeMedical::class);
    }

    // ── Accesseurs ────────────────────────────────────────────────────────

    public function getTypeLabel(): string
    {
        return match ($this->type) {
            self::TYPE_INTERNE          => 'Interne',
            self::TYPE_EXTERNE          => 'Externe',
            self::TYPE_URGENCE          => 'Urgence',
            self::TYPE_TELECONSULTATION => 'Téléconsultation',
            default                     => ucfirst($this->type ?? ''),
        };
    }

    public function getStatutLabel(): string
    {
        return match ($this->statut) {
            self::STATUT_EN_ATTENTE => 'En attente',
            self::STATUT_EN_COURS   => 'En cours',
            self::STATUT_TERMINEE   => 'Terminée',
            self::STATUT_ANNULEE    => 'Annulée',
            default                 => ucfirst($this->statut ?? ''),
        };
    }

    /**
     * Durée effective en minutes calculée depuis heure_debut / heure_fin.
     * Retourne duree_minutes si heure_fin non renseignée.
     */
    public function getDureeCalculee(): ?int
    {
        if ($this->heure_debut && $this->heure_fin) {
            [$hd, $md] = explode(':', $this->heure_debut);
            [$hf, $mf] = explode(':', $this->heure_fin);
            return ((int)$hf * 60 + (int)$mf) - ((int)$hd * 60 + (int)$md);
        }

        return $this->duree_minutes;
    }

    // ── Scopes ────────────────────────────────────────────────────────────

    public function scopeDuJour($query)
    {
        return $query->whereDate('date_consultation', today());
    }

    public function scopeEnCours($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS);
    }

    public function scopeUrgences($query)
    {
        return $query->where('type', self::TYPE_URGENCE);
    }

    public function scopeRecents($query)
    {
        return $query->orderBy('date_consultation', 'desc')
                     ->orderBy('heure_debut', 'desc');
    }
}