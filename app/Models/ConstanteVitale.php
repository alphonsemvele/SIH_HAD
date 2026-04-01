<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConstanteVitale extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'admission_id',
        'user_id',
        'date_mesure',
        'poids',
        'taille',
        'temperature',
        'tension_systolique',
        'tension_diastolique',
        'frequence_cardiaque',
        'frequence_respiratoire',
        'saturation_oxygene',
        'glycemie',
        'score_douleur',
        'notes',
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
            'user_id' => 'integer',
            'date_mesure' => 'datetime',
            'poids' => 'decimal:2',
            'taille' => 'decimal:2',
            'temperature' => 'decimal:2',
            'glycemie' => 'decimal:2',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
