<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PscSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'id_token_jti',
        'access_token_hash',
        'emis_a',
        'expire_a',
        'ip_emission',
        'claims',
    ];

    protected $casts = [
        'claims' => 'array',
        'emis_a' => 'datetime',
        'expire_a' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
