<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanSoinsPrestation extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_soins_id',
        'acte_medical_id',
        'libelle',
        'frequence_type',
        'frequence_detail',
        'duree_min',
        'intervenants_profils',
        'materiel_requis',
        'protocole',
        'date_debut',
        'date_fin',
    ];

    protected $casts = [
        'frequence_detail' => 'array',
        'intervenants_profils' => 'array',
        'materiel_requis' => 'array',
        'duree_min' => 'integer',
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];

    /**
     * Relation avec le plan de soins
     */
    public function planSoins(): BelongsTo
    {
        return $this->belongsTo(PlanSoins::class);
    }

    /**
     * Relation avec l'acte médical
     */
    public function acteMedical(): BelongsTo
    {
        return $this->belongsTo(ActeMedical::class);
    }

    /**
     * Relation avec les visites générées
     */
    public function visites(): HasMany
    {
        return $this->hasMany(VisiteHad::class, 'plan_soins_prestation_id');
    }

    /**
     * Scope pour les prestations quotidiennes
     */
    public function scopeQuotidiennes($query)
    {
        return $query->where('frequence_type', 'quotidienne');
    }

    /**
     * Scope pour les prestations hebdomadaires
     */
    public function scopeHebdomadaires($query)
    {
        return $query->where('frequence_type', 'hebdomadaire');
    }

    /**
     * Scope pour les prestations ponctuelles
     */
    public function scopePonctuelles($query)
    {
        return $query->where('frequence_type', 'ponctuelle');
    }

    /**
     * Scope pour les prestations personnalisées
     */
    public function scopePersonnalisees($query)
    {
        return $query->where('frequence_type', 'personnalisee');
    }

    /**
     * Vérifier si la prestation est quotidienne
     */
    public function estQuotidienne(): bool
    {
        return $this->frequence_type === 'quotidienne';
    }

    /**
     * Vérifier si la prestation est hebdomadaire
     */
    public function estHebdomadaire(): bool
    {
        return $this->frequence_type === 'hebdomadaire';
    }

    /**
     * Vérifier si la prestation est ponctuelle
     */
    public function estPonctuelle(): bool
    {
        return $this->frequence_type === 'ponctuelle';
    }

    /**
     * Vérifier si la prestation est personnalisée
     */
    public function estPersonnalisee(): bool
    {
        return $this->frequence_type === 'personnalisee';
    }

    /**
     * Obtenir les jours de la semaine pour la fréquence personnalisée
     */
    public function getJoursSemaine(): array
    {
        if (!$this->frequence_detail || !isset($this->frequence_detail['jours'])) {
            return [];
        }

        return $this->frequence_detail['jours'];
    }

    /**
     * Obtenir l'heure prévue pour la fréquence personnalisée
     */
    public function getHeurePrevue(): ?string
    {
        if (!$this->frequence_detail || !isset($this->frequence_detail['heure'])) {
            return null;
        }

        return $this->frequence_detail['heure'];
    }
}
