<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PatientDossier extends Model
{
    use HasFactory;

    protected $table = 'patient_dossiers';

    protected $fillable = [
        'dossier_medical_id',
        'consultation_id',
        'medecin_id',
        'reference',
        'type',
        'date_entree',
        'date_sortie',
        'motif',
        'symptomes',
        'examen_clinique',
        'diagnostic',
        'diagnostic_secondaire',
        'constantes_vitales',
        'prescriptions',
        'examens_demandes',
        'resultats_examens',
        'actes_medicaux',
        'traitement_administre',
        'recommandations',
        'date_prochain_rdv',
        'documents',
        'notes_medecin',
        'notes_infirmier',
        'montant_total',
        'statut_paiement',
        'statut',
        'niveau_urgence',
    ];

    protected $casts = [
        'date_entree' => 'datetime',
        'date_sortie' => 'datetime',
        'date_prochain_rdv' => 'date',
        'constantes_vitales' => 'array',
        'prescriptions' => 'array',
        'examens_demandes' => 'array',
        'resultats_examens' => 'array',
        'actes_medicaux' => 'array',
        'documents' => 'array',
        'montant_total' => 'decimal:2',
    ];

    /**
     * Types de visites disponibles
     */
    public const TYPES = [
        'Consultation',
        'Examen',
        'Hospitalisation',
        'Urgence',
        'Suivi',
        'Chirurgie',
        'Vaccination',
        'Bilan',
        'Autre',
    ];

    /**
     * Statuts possibles
     */
    public const STATUTS = [
        'En cours',
        'En attente',
        'Terminé',
        'Annulé',
        'Transféré',
    ];

    /**
     * Niveaux d'urgence
     */
    public const NIVEAUX_URGENCE = [
        'Normal',
        'Urgent',
        'Très urgent',
        'Critique',
    ];

    /**
     * Statuts de paiement
     */
    public const STATUTS_PAIEMENT = [
        'Non payé',
        'Partiel',
        'Payé',
        'Exonéré',
    ];

    /**
     * Générer une référence unique pour la visite
     */
    public static function generateReference(string $type = 'CON'): string
    {
        $prefixes = [
            'Consultation' => 'CON',
            'Examen' => 'EXA',
            'Hospitalisation' => 'HOS',
            'Urgence' => 'URG',
            'Suivi' => 'SUI',
            'Chirurgie' => 'CHI',
            'Vaccination' => 'VAC',
            'Bilan' => 'BIL',
            'Autre' => 'AUT',
        ];

        $prefix = $prefixes[$type] ?? 'VIS';
        $date = date('Ymd');
        $random = strtoupper(substr(uniqid(), -4));
        
        return sprintf('%s-%s-%s', $prefix, $date, $random);
    }

    /**
     * Boot du modèle
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->reference)) {
                $model->reference = self::generateReference($model->type);
            }
            if (empty($model->date_entree)) {
                $model->date_entree = now();
            }
        });
    }

    /**
     * Relation avec le dossier médical
     */
    public function dossierMedical(): BelongsTo
    {
        return $this->belongsTo(DossierMedical::class, 'dossier_medical_id');
    }

    /**
     * Relation avec la consultation
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Relation avec le médecin
     */
    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    /**
     * Accès direct au patient via le dossier médical
     */
    public function getPatientAttribute()
    {
        return $this->dossierMedical?->patient;
    }

    /**
     * Durée de la visite en jours
     */
    public function getDureeJoursAttribute(): ?int
    {
        if ($this->date_sortie) {
            return $this->date_entree->diffInDays($this->date_sortie);
        }
        return null;
    }

    /**
     * Durée de la visite en heures
     */
    public function getDureeHeuresAttribute(): ?int
    {
        if ($this->date_sortie) {
            return $this->date_entree->diffInHours($this->date_sortie);
        }
        return null;
    }

    /**
     * Vérifier si la visite est en cours
     */
    public function isEnCours(): bool
    {
        return $this->statut === 'En cours';
    }

    /**
     * Vérifier si la visite est terminée
     */
    public function isTerminee(): bool
    {
        return $this->statut === 'Terminé';
    }

    /**
     * Vérifier si c'est une urgence
     */
    public function isUrgence(): bool
    {
        return $this->type === 'Urgence' || in_array($this->niveau_urgence, ['Urgent', 'Très urgent', 'Critique']);
    }

    /**
     * Terminer la visite
     */
    public function terminer(): void
    {
        $this->update([
            'statut' => 'Terminé',
            'date_sortie' => now(),
        ]);
    }

    /**
     * Ajouter une prescription
     */
    public function ajouterPrescription(array $prescription): void
    {
        $prescriptions = $this->prescriptions ?? [];
        $prescriptions[] = $prescription;
        $this->update(['prescriptions' => $prescriptions]);
    }

    /**
     * Ajouter un examen demandé
     */
    public function ajouterExamen(array $examen): void
    {
        $examens = $this->examens_demandes ?? [];
        $examens[] = array_merge($examen, ['statut' => 'En attente', 'date_demande' => now()->toDateTimeString()]);
        $this->update(['examens_demandes' => $examens]);
    }

    /**
     * Ajouter un document
     */
    public function ajouterDocument(array $document): void
    {
        $documents = $this->documents ?? [];
        $documents[] = array_merge($document, ['date_ajout' => now()->toDateTimeString()]);
        $this->update(['documents' => $documents]);
    }

    /**
     * Mettre à jour les constantes vitales
     */
    public function updateConstantes(array $constantes): void
    {
        $this->update(['constantes_vitales' => $constantes]);
    }

    /**
     * Scope pour les visites en cours
     */
    public function scopeEnCours($query)
    {
        return $query->where('statut', 'En cours');
    }

    /**
     * Scope pour les visites terminées
     */
    public function scopeTerminees($query)
    {
        return $query->where('statut', 'Terminé');
    }

    /**
     * Scope pour les urgences
     */
    public function scopeUrgences($query)
    {
        return $query->where('type', 'Urgence')
            ->orWhereIn('niveau_urgence', ['Urgent', 'Très urgent', 'Critique']);
    }

    /**
     * Scope par type
     */
    public function scopeDeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope par médecin
     */
    public function scopeParMedecin($query, int $medecinId)
    {
        return $query->where('medecin_id', $medecinId);
    }

    /**
     * Scope pour aujourd'hui
     */
    public function scopeAujourdhui($query)
    {
        return $query->whereDate('date_entree', today());
    }

    /**
     * Scope pour cette semaine
     */
    public function scopeCetteSemaine($query)
    {
        return $query->whereBetween('date_entree', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    /**
     * Scope pour ce mois
     */
    public function scopeCeMois($query)
    {
        return $query->whereMonth('date_entree', now()->month)
            ->whereYear('date_entree', now()->year);
    }

    /**
     * Scope pour recherche
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('reference', 'like', "%{$search}%")
            ->orWhere('motif', 'like', "%{$search}%")
            ->orWhere('diagnostic', 'like', "%{$search}%");
    }
}