<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AnalyseLaboratoire extends Model
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
        'consultation_id',
        'medecin_prescripteur_id',
        'technicien_id',
        'biologiste_id',
        'type_examen_id',
        'date_prescription',
        'date_prelevement',
        'date_resultat',
        'resultat',
        'interpretation',
        'conclusion',
        'commentaire_medecin',
        'urgent',
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
            'consultation_id' => 'integer',
            'medecin_prescripteur_id' => 'integer',
            'technicien_id' => 'integer',
            'biologiste_id' => 'integer',
            'type_analyse_id' => 'integer',
            'date_prescription' => 'datetime',
            'date_prelevement' => 'datetime',
            'date_resultat' => 'datetime',
            'resultat' => 'array',
            'urgent' => 'boolean',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function medecinPrescripteur(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function technicien(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function biologiste(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function typeExamen(): BelongsTo
    {
        return $this->belongsTo(TypeExamen::class);
    }
}
