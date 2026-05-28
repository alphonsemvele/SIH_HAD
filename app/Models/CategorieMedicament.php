<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategorieMedicament extends Model
{
    use HasFactory;

    protected $table = 'categorie_medicaments';

    protected $fillable = [
        'code',
        'nom',
        'description',
        'couleur',
        'actif',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    // ──────────────────────────────────────────
    // Relations
    // ──────────────────────────────────────────

    public function medicaments(): HasMany
    {
        return $this->hasMany(Medicament::class, 'categorie_medicament_id');
    }

    // ──────────────────────────────────────────
    // Accesseurs / helpers
    // ──────────────────────────────────────────

    /** Nombre de médicaments rattachés à cette catégorie */
    public function getNbMedicamentsAttribute(): int
    {
        return $this->medicaments()->count();
    }

    public function getStatutLabelAttribute(): string
    {
        return $this->actif ? 'Actif' : 'Inactif';
    }

    // ──────────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────────

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }
}