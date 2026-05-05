<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SignatureVisite extends Model
{
    use HasFactory;

    protected $fillable = [
        'visite_had_id',
        'signataire_type',
        'aidant_id',
        'chemin_image_png',
        'hash_sha256',
        'motif_refus',
        'signe_a',
    ];

    protected $casts = [
        'signe_a' => 'datetime',
    ];

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function aidant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aidant_id');
    }
}
