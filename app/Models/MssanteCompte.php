<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MssanteCompte extends Model
{
    use HasFactory;

    protected $fillable = [
        'adresse',
        'type',
        'user_id',
        'operateur',
        'config_smtp',
        'config_imap',
        'actif',
    ];

    protected $casts = [
        'config_smtp' => 'array',
        'config_imap' => 'array',
        'actif' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MssanteMessage::class, 'compte_id');
    }
}
