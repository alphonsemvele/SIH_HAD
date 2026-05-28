<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SegurDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'type_loinc',
        'libelle',
        'auteur_id',
        'auteur_rpps',
        'date_document',
        'statut',
        'xml_cdar2_chemin',
        'pdf_chemin',
        'xml_hash_sha256',
        'metadonnees_xds',
        'source_type',
        'source_id',
    ];

    protected $casts = [
        'metadonnees_xds' => 'array',
        'date_document' => 'date',
        'xml_hash_sha256' => 'string',
        'statut' => 'string',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    public function mesDepots(): HasMany
    {
        return $this->hasMany(MesDepot::class, 'segur_document_id');
    }
}
