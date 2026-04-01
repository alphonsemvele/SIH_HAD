<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'numero',
        'service_id',
        'chambre',
        'type',
        'statut',
        'equipements',
        'tarif_journalier',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'id'              => 'integer',
            'service_id'      => 'integer',
            'equipements'     => 'array',
            'tarif_journalier' => 'decimal:2',
        ];
    }

    // ── Relations ───────────────────────────────────────────────────

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /** Occupation actuellement active sur ce lit (au plus 1) */
    public function occupationActive(): HasOne
    {
        return $this->hasOne(OccupationRoom::class)
            ->where('statut', 'active')
            ->latest('date_entree');
    }

    /** Toutes les occupations (actives + passées) — historique complet */
    public function occupations(): HasMany
    {
        return $this->hasMany(OccupationRoom::class)->orderByDesc('date_entree');
    }

    /** Journal de changements de statut */
    public function historique(): HasMany
    {
        return $this->hasMany(HistoriqueLit::class)->latest('effectue_le');
    }

    // ── Scopes ──────────────────────────────────────────────────────

    public function scopeDisponible($query)
    {
        return $query->where('statut', 'disponible');
    }

    public function scopeOccupe($query)
    {
        return $query->where('statut', 'occupe');
    }

    public function scopeNettoyage($query)
    {
        return $query->where('statut', 'nettoyage');
    }

    public function scopeHorsService($query)
    {
        return $query->where('statut', 'horsservice');
    }

    public function scopeDuService($query, int $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    // ── Accesseurs ──────────────────────────────────────────────────

    public function getEstDisponibleAttribute(): bool
    {
        return $this->statut === 'disponible';
    }

    public function getEstOccupeAttribute(): bool
    {
        return $this->statut === 'occupe';
    }

    // ── Méthodes métier ─────────────────────────────────────────────

    /**
     * Admettre un patient dans ce lit.
     */
    public function admettre(int $patientId, array $data = [], ?int $userId = null): OccupationRoom
    {
        if (!$this->est_disponible) {
            throw new \RuntimeException("Le lit {$this->numero} n'est pas disponible.");
        }

        $occupation = OccupationRoom::create([
            'lit_id'               => $this->id,
            'service_id'           => $this->service_id,
            'patient_id'           => $patientId,
            'medecin_id'           => $data['medecin_id'] ?? null,
            'infirmier_id'         => $data['infirmier_id'] ?? null,
            'cree_par'             => $userId,
            'diagnostic_principal' => $data['diagnostic_principal'] ?? null,
            'notes_admission'      => $data['notes_admission'] ?? null,
            'date_entree'          => $data['date_entree'] ?? now(),
            'date_sortie_prevue'   => $data['date_sortie_prevue'] ?? null,
            'statut'               => 'active',
        ]);

        $this->update(['statut' => 'occupe']);

        HistoriqueLit::create([
            'lit_id'        => $this->id,
            'service_id'    => $this->service_id,
            'user_id'       => $userId,
            'occupation_id' => $occupation->id,
            'ancien_statut' => 'disponible',
            'nouveau_statut' => 'occupe',
            'action'        => 'admission',
            'commentaire'   => "Admission du patient #{$patientId}",
        ]);

        return $occupation;
    }

    /**
     * Marquer ce lit comme nettoyé (disponible).
     */
    public function marquerDisponible(?int $userId = null): void
    {
        $ancienStatut = $this->statut;
        $this->update(['statut' => 'disponible']);

        HistoriqueLit::create([
            'lit_id'        => $this->id,
            'service_id'    => $this->service_id,
            'user_id'       => $userId,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => 'disponible',
            'action'        => 'nettoyage_fin',
            'commentaire'   => 'Nettoyage terminé, lit disponible',
        ]);
    }

    /**
     * Mettre hors service.
     */
    public function mettreHorsService(?string $raison = null, ?int $userId = null): void
    {
        $ancienStatut = $this->statut;
        $this->update(['statut' => 'horsservice']);

        HistoriqueLit::create([
            'lit_id'        => $this->id,
            'service_id'    => $this->service_id,
            'user_id'       => $userId,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => 'horsservice',
            'action'        => 'mise_hors_service',
            'commentaire'   => $raison ?? 'Mise hors service',
        ]);
    }
}