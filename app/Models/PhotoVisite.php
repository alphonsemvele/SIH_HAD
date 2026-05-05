<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PhotoVisite extends Model
{
    use HasFactory;

    protected $fillable = [
        'visite_had_id',
        'chemin',
        'hash_sha256',
        'taille_octets',
        'mime_type',
        'exif',
        'legende',
        'intervenant_id',
    ];

    protected $casts = [
        'exif' => 'array',
    ];

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function intervenant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intervenant_id');
    }
}
