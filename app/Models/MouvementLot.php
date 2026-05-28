<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MouvementLot extends Model
{
    protected $table = 'mouvements_lot';

    use HasFactory;

    protected $fillable = [
        'medicament_id',
        'numero_lot',
        'date_peremption',
        'type',
        'quantite_signed',
        'source_type',
        'source_id',
        'user_id',
        'commentaire',
    ];

    protected $casts = [
        'date_peremption' => 'date',
        'quantite_signed' => 'integer',
    ];

    public function medicament(): BelongsTo
    {
        return $this->belongsTo(Medicament::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
