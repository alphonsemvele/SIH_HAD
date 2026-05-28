<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QrCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'visite_had_id',
        'patient_had_id',
        'plan_soins_prestation_id',
        'creneau_debut',
        'creneau_fin',
        'statut',
        'payload_signe',
        'genere_par_id',
        'remplace_qr_id',
        'utilise_a',
    ];

    protected $casts = [
        'creneau_debut' => 'datetime',
        'creneau_fin' => 'datetime',
        'utilise_a' => 'datetime',
        'payload_signe' => 'array',
    ];

    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function patientHad(): BelongsTo
    {
        return $this->belongsTo(PatientHad::class);
    }

    public function generePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'genere_par_id');
    }

    public function remplaceQr(): BelongsTo
    {
        return $this->belongsTo(QrCode::class, 'remplace_qr_id');
    }

    public function qrScans(): HasMany
    {
        return $this->hasMany(QrScan::class);
    }
}
