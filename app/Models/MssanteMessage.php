<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MssanteMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'compte_id',
        'sens',
        'message_id',
        'expediteur',
        'destinataires',
        'cc',
        'sujet',
        'corps_texte',
        'corps_html',
        'patient_id',
        'patient_ins_matricule',
        'statut',
        'metadonnees',
        'envoye_a',
        'recu_a',
        'lu_a',
        'erreur',
    ];

    protected $casts = [
        'destinataires' => 'array',
        'cc' => 'array',
        'metadonnees' => 'array',
        'envoye_a' => 'datetime',
        'recu_a' => 'datetime',
        'lu_a' => 'datetime',
    ];

    public function compte(): BelongsTo
    {
        return $this->belongsTo(MssanteCompte::class, 'compte_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function piecesJointes(): HasMany
    {
        return $this->hasMany(MssantePieceJointe::class, 'message_id');
    }
}
