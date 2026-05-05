<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;

class Admission extends Model
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
        'service_id',
        'lit_id',
        'medecin_id',
        'type',
        'motif',
        'diagnostic_entree',
        'diagnostic_sortie',
        'date_admission',
        'date_sortie',
        'mode_sortie',
        'accompagnant_nom',
        'accompagnant_telephone',
        'accompagnant_lien',
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
            'service_id' => 'integer',
            'lit_id' => 'integer',
            'medecin_id' => 'integer',
            'date_admission' => 'datetime',
            'date_sortie' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function lit(): BelongsTo
    {
        return $this->belongsTo(Lit::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function constanteVitales(): HasMany
    {
        return $this->hasMany(ConstanteVitale::class);
    }

    public function acteMedicals(): HasMany
    {
        return $this->hasMany(ActeMedical::class);
    }

    public function getActivitylogOptions(): \Spatie\Activitylog\LogOptions
    {
        return \Spatie\Activitylog\LogOptions::defaults()
            ->logOnly(['date_admission', 'date_sortie', 'motif', 'diagnostic_entree', 'diagnostic_sortie', 'mode_sortie', 'statut'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
