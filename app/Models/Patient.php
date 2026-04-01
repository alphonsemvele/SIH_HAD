<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero_dossier',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'lieu_naissance',
        'nationalite',
        'cni',
        'telephone',
        'telephone_urgence',
        'email',
        'adresse',
        'ville',
        'quartier',
        'profession',
        'situation_matrimoniale',
        'groupe_sanguin',
        'allergies',
        'antecedents_medicaux',
        'antecedents_chirurgicaux',
        'antecedents_familiaux',
        'assurance_id',
        'numero_assurance',
        'personne_contact_nom',
        'personne_contact_telephone',
        'personne_contact_lien',
        'photo',
        'notes',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'date_naissance' => 'date',
            'allergies' => 'array',
            'antecedents_medicaux' => 'array',
            'antecedents_chirurgicaux' => 'array',
            'antecedents_familiaux' => 'array',
            'assurance_id' => 'integer',
        ];
    }

    // Constantes pour les statuts
    const STATUT_HOSPITALISE = 'Hospitalisé';
    const STATUT_CONSULTATION = 'Consultation';
    const STATUT_URGENCE = 'Urgence';
    const STATUT_SORTIE = 'Sortie';

    public static function getStatuts(): array
    {
        return [
            self::STATUT_HOSPITALISE,
            self::STATUT_CONSULTATION,
            self::STATUT_URGENCE,
            self::STATUT_SORTIE,
        ];
    }

    public function assurance(): BelongsTo
    {
        return $this->belongsTo(Assurance::class);
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function rendezVouses(): HasMany
    {
        return $this->hasMany(RendezVous::class);
    }

    public function factures(): HasMany
    {
        return $this->hasMany(Facture::class);
    }

    public function analyseLaboratoires(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }

    public function examenImageries(): HasMany
    {
        return $this->hasMany(ExamenImagerie::class);
    }

    public function constanteVitales(): HasMany
    {
        return $this->hasMany(ConstanteVitale::class);
    }

    public function patientHads(): HasMany
    {
        return $this->hasMany(PatientHad::class);
    }

     public function dossierMedical()
    {
        return $this->hasOne(DossierMedical::class);
    }

    /**
     * Accès direct aux visites/entrées du patient
     * via son dossier médical
     */
    public function visites()
    {
        return $this->hasManyThrough(
            PatientDossier::class,
            DossierMedical::class,
            'patient_id',         // FK sur dossiers_medicaux
            'dossier_medical_id', // FK sur patient_dossiers
            'id',                 // PK sur patients
            'id'                  // PK sur dossiers_medicaux
        );
    }

    /**
     * Obtenir toutes les consultations du patient
     */
    public function toutesConsultations()
    {
        return $this->visites()->where('type', 'Consultation');
    }

    /**
     * Obtenir toutes les hospitalisations du patient
     */
    public function toutesHospitalisations()
    {
        return $this->visites()->where('type', 'Hospitalisation');
    }

    /**
     * Obtenir la dernière visite du patient
     */
    public function derniereVisite()
    {
        return $this->visites()->latest('date_entree')->first();
    }

    /**
     * Vérifier si le patient a un dossier médical
     */
    public function hasDossierMedical(): bool
    {
        return $this->dossierMedical()->exists();
    }

    /**
     * Obtenir ou créer le dossier médical
     */
    public function getOrCreateDossierMedical(): DossierMedical
    {
        if (!$this->dossierMedical) {
            return DossierMedical::create([
                'patient_id' => $this->id,
                'numero_dossier_medical' => DossierMedical::generateNumeroDossier(),
                'date_ouverture' => now(),
                'groupe_sanguin' => $this->groupe_sanguin,
                'allergies_confirmees' => $this->allergies,
                'statut' => 'Actif',
            ]);
        }
        return $this->dossierMedical;
    }

    /**
     * Créer une nouvelle visite pour le patient
     */
    public function creerVisite(array $data): PatientDossier
    {
        $dossier = $this->getOrCreateDossierMedical();
        
        return $dossier->entrees()->create(array_merge([
            'date_entree' => now(),
            'statut' => 'En cours',
        ], $data));
    }

    /**
     * Nombre total de visites
     */
    public function getNombreVisitesAttribute(): int
    {
        return $this->visites()->count();
    }
}