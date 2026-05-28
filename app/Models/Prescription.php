<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class Prescription extends Model
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
        'medecin_id',
        'consultation_id',
        'admission_id',
        'date_prescription',
        'date_validite',
        'instructions_generales',
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
            'consultation_id' => 'integer',
            'admission_id' => 'integer',
            'date_prescription' => 'datetime',
            'date_validite' => 'date',
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

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }

    public function lignePrescriptions(): HasMany
    {
        return $this->hasMany(LignePrescription::class);
    }

    public function delivrances(): HasMany
    {
        return $this->hasMany(Delivrance::class);
    }

public function anomalie(): BelongsTo
{
    return $this->belongsTo(Anomalie::class);
}

public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
{
    return \Spatie\Activitylog\LogOptions::defaults()
        ->logOnly(['date_prescription', 'date_validite', 'instructions_generales', 'statut'])
        ->logOnlyDirty()
        ->dontSubmitEmptyLogs();
}
 
}
