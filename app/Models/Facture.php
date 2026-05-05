<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class Facture extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'numero',
        'patient_id',
        'admission_id',
        'assurance_id',
        'date_facture',
        'date_echeance',
        'montant_brut',
        'remise',
        'montant_assurance',
        'montant_patient',
        'montant_total',
        'montant_paye',
        'tva',
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
            'admission_id' => 'integer',
            'assurance_id' => 'integer',
            'date_facture' => 'date',
            'date_echeance' => 'date',
            'montant_brut' => 'decimal:2',
            'remise' => 'decimal:2',
            'montant_assurance' => 'decimal:2',
            'montant_patient' => 'decimal:2',
            'montant_total' => 'decimal:2',
            'montant_paye' => 'decimal:2',
            'tva' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function assurance(): BelongsTo
    {
        return $this->belongsTo(Assurance::class);
    }

    public function ligneFactures(): HasMany
    {
        return $this->hasMany(LigneFacture::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['date_facture', 'date_echeance', 'montant_brut', 'remise', 'montant_assurance', 'montant_patient', 'montant_total', 'montant_paye', 'tva', 'statut'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
