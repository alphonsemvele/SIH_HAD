<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanSoins extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_had_id',
        'cree_par_id',
        'date_debut',
        'date_fin_prevue',
        'reevaluation_prevue_le',
        'statut',
        'version',
        'plan_precedent_id',
        'objectifs',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin_prevue' => 'date',
        'reevaluation_prevue_le' => 'date',
        'version' => 'integer',
        'objectifs' => 'string',
    ];

    /**
     * Relation avec le patient HAD
     */
    public function patientHad(): BelongsTo
    {
        return $this->belongsTo(PatientHad::class);
    }

    /**
     * Relation avec l'utilisateur créateur
     */
    public function creePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par_id');
    }

    /**
     * Relation avec le plan précédent (versioning)
     */
    public function planPrecedent(): BelongsTo
    {
        return $this->belongsTo(PlanSoins::class, 'plan_precedent_id');
    }

    /**
     * Relation avec les versions suivantes
     */
    public function versionsSuivantes(): HasMany
    {
        return $this->hasMany(PlanSoins::class, 'plan_precedent_id');
    }

    /**
     * Relation avec les prestations du plan
     */
    public function prestations(): HasMany
    {
        return $this->hasMany(PlanSoinsPrestation::class);
    }

    /**
     * Scope pour les plans actifs
     */
    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    /**
     * Scope pour les plans en brouillon
     */
    public function scopeBrouillons($query)
    {
        return $query->where('statut', 'brouillon');
    }

    /**
     * Scope pour les plans archivés
     */
    public function scopeArchives($query)
    {
        return $query->where('statut', 'archive');
    }

    /**
     * Vérifier si le plan est actif
     */
    public function estActif(): bool
    {
        return $this->statut === 'actif';
    }

    /**
     * Vérifier si le plan est en brouillon
     */
    public function estBrouillon(): bool
    {
        return $this->statut === 'brouillon';
    }

    /**
     * Vérifier si le plan est archivé
     */
    public function estArchive(): bool
    {
        return $this->statut === 'archive';
    }
}
