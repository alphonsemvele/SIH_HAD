<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamenImagerie extends Model
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
        'radiologue_id',
        'manipulateur_id',
        'type_examen_id',
        'date_prescription',
        'date_examen',
        'date_resultat',
        'indication_clinique',
        'technique',
        'resultat',
        'conclusion',
        'images_path',
        'urgent',
        'statut',
        'type_examen_imagerie_id',
        
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
            'radiologue_id' => 'integer',
            'manipulateur_id' => 'integer',
            'type_examen_id' => 'integer',
            'date_prescription' => 'datetime',
            'date_examen' => 'datetime',
            'date_resultat' => 'datetime',
            'images_path' => 'array',
            'urgent' => 'boolean',
            'type_examen_imagerie_id' => 'integer',
            'modalite_imagerie_id'
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
        return $this->belongsTo(User::class,'medecin_prescripteur_id');
    }

    public function radiologue(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function manipulateur(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function typeExamenImagerie(): BelongsTo
    {
        return $this->belongsTo(TypeExamenImagerie::class);
    }

    public function typeExamen(): BelongsTo
    {
        return $this->belongsTo(TypeExamen::class);
    }
}
