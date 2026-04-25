<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DossierMedical extends Model
{
    use HasFactory;

    protected $table = 'dossiers_medicaux';

    protected $fillable = [
        'patient_id',
        'numero_dossier_medical',
        'date_ouverture',
        'antecedents_medicaux',
        'antecedents_chirurgicaux',
        'antecedents_familiaux',
        'allergies_confirmees',
        'groupe_sanguin',
        'rhesus',
        'taille_cm',
        'poids_kg',
        'maladies_chroniques',
        'traitements_en_cours',
        'notes_generales',
        'statut',
    ];

    protected $casts = [
        'date_ouverture' => 'date',
        'antecedents_medicaux' => 'array',
        'antecedents_chirurgicaux' => 'array',
        'antecedents_familiaux' => 'array',
        'allergies_confirmees' => 'array',
        'maladies_chroniques' => 'array',
        'traitements_en_cours' => 'array',
        'taille_cm' => 'decimal:2',
        'poids_kg' => 'decimal:2',
    ];

    /**
     * Générer un numéro de dossier médical unique
     */
    public static function generateNumeroDossier(): string
    {
        $year = date('Y');
        $lastDossier = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastDossier) {
            // Extraire le numéro séquentiel du dernier dossier
            $parts = explode('-', $lastDossier->numero_dossier_medical);
            $sequence = isset($parts[2]) ? intval($parts[2]) + 1 : 1;
        } else {
            $sequence = 1;
        }

        return sprintf('DM-%s-%05d', $year, $sequence);
    }

    /**
     * Relation avec le patient
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Relation avec les entrées/visites du dossier
     */
    public function entrees(): HasMany
    {
        return $this->hasMany(PatientDossier::class, 'dossier_medical_id');
    }

    /**
     * Alias pour les entrées - visites
     */
    public function visites(): HasMany
    {
        return $this->entrees();
    }

    /**
     * Obtenir uniquement les consultations
     */
    public function consultations(): HasMany
    {
        return $this->entrees()->where('type', 'Consultation');
    }

    /**
     * Obtenir uniquement les hospitalisations
     */
    public function hospitalisations(): HasMany
    {
        return $this->entrees()->where('type', 'Hospitalisation');
    }

    /**
     * Obtenir uniquement les urgences
     */
    public function urgences(): HasMany
    {
        return $this->entrees()->where('type', 'Urgence');
    }

    /**
     * Obtenir uniquement les examens
     */
    public function examens(): HasMany
    {
        return $this->entrees()->where('type', 'Examen');
    }

    /**
     * Obtenir la dernière visite
     */
    public function derniereVisite()
    {
        return $this->entrees()->latest('date_entree')->first();
    }

    /**
     * Obtenir les visites en cours
     */
    public function visitesEnCours(): HasMany
    {
        return $this->entrees()->where('statut', 'En cours');
    }

    /**
     * Calculer l'IMC si taille et poids disponibles
     */
    public function getImcAttribute(): ?float
    {
        if ($this->taille_cm && $this->poids_kg) {
            $tailleMetres = $this->taille_cm / 100;
            return round($this->poids_kg / ($tailleMetres * $tailleMetres), 2);
        }
        return null;
    }

    /**
     * Interpréter l'IMC
     */
    public function getImcInterpretationAttribute(): ?string
    {
        $imc = $this->imc;
        if (!$imc) return null;

        if ($imc < 18.5) return 'Insuffisance pondérale';
        if ($imc < 25) return 'Poids normal';
        if ($imc < 30) return 'Surpoids';
        if ($imc < 35) return 'Obésité modérée';
        if ($imc < 40) return 'Obésité sévère';
        return 'Obésité morbide';
    }

    /**
     * Nombre total de visites
     */
    public function getNombreVisitesAttribute(): int
    {
        return $this->entrees()->count();
    }

    /**
     * Vérifier si le dossier est actif
     */
    public function isActif(): bool
    {
        return $this->statut === 'actif';
    }

    /**
     * Scope pour les dossiers actifs
     */
    public function scopeActifs($query)
    {
        return $query->where('statut', 'actif');
    }

    /**
     * Scope pour recherche
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('numero_dossier_medical', 'like', "%{$search}%")
            ->orWhereHas('patient', function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('numero_dossier', 'like', "%{$search}%");
            });
    }
}