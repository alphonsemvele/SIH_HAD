<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MesDepot extends Model
{
    use HasFactory;

    protected $fillable = [
        'segur_document_id',
        'statut',
        'document_unique_id',
        'repository_unique_id',
        'accuse_reception',
        'metadata_envoyees',
        'erreur',
        'tentatives',
        'depose_a',
    ];

    protected $casts = [
        'accuse_reception' => 'array',
        'metadata_envoyees' => 'array',
        'tentatives' => 'integer',
        'depose_a' => 'datetime',
    ];

    public function segurDocument(): BelongsTo
    {
        return $this->belongsTo(SegurDocument::class, 'segur_document_id');
    }
}
