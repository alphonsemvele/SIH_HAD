<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MssantePieceJointe extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'nom_fichier',
        'mime_type',
        'taille_octets',
        'chemin',
        'hash_sha256',
    ];

    protected $casts = [
        'taille_octets' => 'integer',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(MssanteMessage::class, 'message_id');
    }
}
