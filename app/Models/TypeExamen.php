<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TypeExamen extends Model
{
    protected $table = 'type_examens';

    protected $fillable = [
        'code', 'nom', 'description', 'module', 'categorie',
        'modalite_imagerie_id',   // ← FK, pas 'modalite_imagerie'
        'prix', 'duree_minutes', 'actif',
    ];

    protected function casts(): array
    {
        return [
            'prix'          => 'decimal:2',
            'duree_minutes' => 'integer',
            'actif'         => 'boolean',
        ];
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }

    public function examensImagerie(): HasMany
    {
        return $this->hasMany(ExamenImagerie::class);
    }

    public function modaliteImagerie(): BelongsTo
    {
        return $this->belongsTo(ModaliteImagerie::class, 'modalite_imagerie_id');
    }

    public function scopeActif($query)       { return $query->where('actif', true); }
    public function scopeLaboratoire($query) { return $query->where('module', 'laboratoire'); }
    public function scopeImagerie($query)    { return $query->where('module', 'imagerie'); }
}