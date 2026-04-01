<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriqueLit extends Model
{
    public $timestamps = false;

    protected $table = 'historique_lits';

    protected $fillable = [
        'lit_id',
        'service_id',
        'user_id',
        'occupation_id',
        'ancien_statut',
        'nouveau_statut',
        'action',
        'service_source_id',
        'service_destination_id',
        'commentaire',
        'effectue_le',
    ];

    protected function casts(): array
    {
        return [
            'effectue_le' => 'datetime',
        ];
    }

    public function lit(): BelongsTo
    {
        return $this->belongsTo(Lit::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function occupation(): BelongsTo
    {
        return $this->belongsTo(OccupationRoom::class, 'occupation_id');
    }

    public function serviceSource(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_source_id');
    }

    public function serviceDestination(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_destination_id');
    }
}