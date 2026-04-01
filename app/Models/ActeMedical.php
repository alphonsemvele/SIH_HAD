<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActeMedical extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'code',
        'libelle',
        'consultation_id',
        'admission_id',
        'patient_id',
        'medecin_id',
        'date_acte',
        'description',
        'resultat',
        'quantite',
        'prix_unitaire',
        'prix_total',
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
            'consultation_id' => 'integer',
            'admission_id' => 'integer',
            'patient_id' => 'integer',
            'medecin_id' => 'integer',
            'date_acte' => 'datetime',
            'prix_unitaire' => 'decimal:2',
            'prix_total' => 'decimal:2',
        ];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
