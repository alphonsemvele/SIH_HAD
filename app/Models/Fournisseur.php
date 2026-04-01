<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'nom',
        'type',
        'adresse',
        'ville',
        'pays',
        'telephone',
        'email',
        'site_web',
        'contact_nom',
        'contact_telephone',
        'delai_livraison_jours',
        'conditions_paiement',
        'actif',
    ];

    protected $casts = [
        'actif'                 => 'boolean',
        'delai_livraison_jours' => 'integer',
    ];

    // ──────────────────────────────────────────
    // Relations
    // ──────────────────────────────────────────

    public function medicaments(): HasMany
    {
        return $this->hasMany(Medicament::class, 'fournisseur_id');
    }

    public function commandesFournisseur(): HasMany
    {
        return $this->hasMany(CommandeFournisseur::class, 'fournisseur_id');
    }

    // ──────────────────────────────────────────
    // Accesseurs
    // ──────────────────────────────────────────

    public function getDelaiLivraisonLabelAttribute(): string
    {
        $j = $this->delai_livraison_jours;
        if ($j <= 1) return '24h';
        if ($j <= 2) return '48h';
        if ($j <= 3) return '72h';
        return $j . ' jours';
    }

    public function getStatutLabelAttribute(): string
    {
        return $this->actif ? 'Actif' : 'Inactif';
    }

    public function getNbMedicamentsAttribute(): int
    {
        return $this->medicaments()->count();
    }

    public function getMontantTotalAttribute(): float
    {
        return $this->commandesFournisseur()->sum('montant_total') ?? 0;
    }

    public function getNbCommandesAttribute(): int
    {
        return $this->commandesFournisseur()->count();
    }

    // ──────────────────────────────────────────
    // Scopes
    // ──────────────────────────────────────────

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    public function scopeVille($query, string $ville)
    {
        return $query->where('ville', $ville);
    }
}