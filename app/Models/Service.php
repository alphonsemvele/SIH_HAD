<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'nom',
        'description',
        'chef_service_id',
        'etage',
        'batiment',
        'telephone',
        'email',
        'capacite_lits',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'id'             => 'integer',
            'chef_service_id' => 'integer',
            'actif'          => 'boolean',
        ];
    }

    // ── Relations existantes ─────────────────────────────────────────

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function lits(): HasMany
    {
        return $this->hasMany(Lit::class);
    }

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    public function chefService(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_service_id');
    }

    // ── Nouvelles relations module lits ─────────────────────────────

    /** Toutes les occupations du service */
    public function occupations(): HasMany
    {
        return $this->hasMany(OccupationRoom::class);
    }

    /** Occupations actuellement actives */
    public function occupationsActives(): HasMany
    {
        return $this->hasMany(OccupationRoom::class)->where('statut', 'active');
    }

    /** Journal du service */
    public function historiqueLits(): HasMany
    {
        return $this->hasMany(HistoriqueLit::class)->latest('effectue_le');
    }

    // ── Scopes ──────────────────────────────────────────────────────

    public function scopeActif($query)
    {
        return $query->where('actif', true);
    }

    // ── Accesseurs calculés ──────────────────────────────────────────

    public function getCapaciteAttribute(): int
    {
        return $this->lits()->count();
    }

    public function getOccupesAttribute(): int
    {
        return $this->lits()->where('statut', 'occupe')->count();
    }

    public function getDisponiblesAttribute(): int
    {
        return $this->lits()->where('statut', 'disponible')->count();
    }

    public function getEnNettoyageAttribute(): int
    {
        return $this->lits()->where('statut', 'nettoyage')->count();
    }

    public function getHorsServiceAttribute(): int
    {
        return $this->lits()->where('statut', 'hors-service')->count();
    }

    public function getTauxOccupationAttribute(): float
    {
        $cap = $this->capacite;
        return $cap > 0 ? round(($this->occupes / $cap) * 100, 1) : 0.0;
    }
}