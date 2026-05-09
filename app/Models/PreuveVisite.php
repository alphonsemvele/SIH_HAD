<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreuveVisite extends Model
{
    use HasFactory;

    protected $table = 'preuves_visite';

    protected $fillable = [
        'visite_had_id',
        'qr_scan_id',
        'pdf_chemin',
        'pdf_hash_sha256',
        'pdf_taille_octets',
        'contenu_synthese',
        'genere_a',
    ];

    protected $casts = [
        'contenu_synthese' => 'array',
        'pdf_taille_octets' => 'integer',
        'genere_a' => 'datetime',
    ];

    public function visiteHad(): BelongsTo
    {
        return $this->belongsTo(VisiteHad::class);
    }

    public function qrScan(): BelongsTo
    {
        return $this->belongsTo(QrScan::class);
    }
}
