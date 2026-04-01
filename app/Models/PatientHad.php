<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientHad extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'medecin_referent_id',
        'date_inclusion',
        'date_sortie',
        'motif_inclusion',
        'motif_sortie',
        'adresse_domicile',
        'latitude',
        'longitude',
        'personne_reference_nom',
        'personne_reference_telephone',
        'personne_reference_lien',
        'protocole_soins',
        'frequence_visites',
        'equipements_domicile',
        'notes',
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
            'medecin_referent_id' => 'integer',
            'date_inclusion' => 'date',
            'date_sortie' => 'date',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'equipements_domicile' => 'array',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecinReferent(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tournees(): HasMany
    {
        return $this->hasMany(Tournee::class);
    }

    public function visiteHads(): HasMany
    {
        return $this->hasMany(VisiteHad::class);
    }
}
