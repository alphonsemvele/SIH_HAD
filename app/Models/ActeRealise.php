<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActeRealise extends Model
{
    use HasFactory;

    protected $fillable = [
        'visite_had_id',
        'acte_medical_id',
        'libelle',
        'code_ccam',
        'observations',
        'non_prevu',
        'intervenant_id',
    ];

    protected $casts = [
        'non_prevu' => 'boolean',
    ];

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function acteMedical(): BelongsTo
    {
        return $this->belongsTo(ActeMedical::class);
    }

    public function intervenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intervenant_id');
    }
}
