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

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero',
        'patient_id',
        'medecin_id',
        'admission_id',
        'rendez_vous_id',
        'service_id',
        'date_consultation',
        'motif',
        'histoire_maladie',
        'examen_clinique',
        'hypotheses_diagnostiques',
        'diagnostic_principal',
        'diagnostics_secondaires',
        'conduite_a_tenir',
        'recommandations',
        'prochain_rdv',
        'duree_minutes',
        'statut',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'patient_id' => 'integer',
            'medecin_id' => 'integer',
            'admission_id' => 'integer',
            'rendez_vous_id' => 'integer',
            'service_id' => 'integer',
            'date_consultation' => 'datetime',
            'hypotheses_diagnostiques' => 'array',
            'diagnostics_secondaires' => 'array',
            'prochain_rdv' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
}
