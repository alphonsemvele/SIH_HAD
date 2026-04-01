<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OccupationRoom extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'occupation_rooms';

    protected $fillable = [
        'lit_id',
        'service_id',
        'patient_id',
        'medecin_id',
        'infirmier_id',
        'cree_par',
        'diagnostic_principal',
        'notes_admission',
        'notes_sortie',
        'date_entree',
        'date_sortie_prevue',
        'date_sortie',
        'statut',
        'motif_sortie',
        'lit_destination_id',
        'service_destination_id',
        'cout_sejour',
        'chambre'
    ];

    protected function casts(): array
    {
        return [
            'lit_id'                 => 'integer',
            'service_id'             => 'integer',
            'patient_id'             => 'integer',
            'medecin_id'             => 'integer',
            'infirmier_id'           => 'integer',
            'cree_par'               => 'integer',
            'lit_destination_id'     => 'integer',
            'service_destination_id' => 'integer',
            'date_entree'            => 'datetime',
            'date_sortie_prevue'     => 'datetime',
            'date_sortie'            => 'datetime',
            'cout_sejour'            => 'decimal:2',
        ];
    }

    // ── Relations ───────────────────────────────────────────────────

    public function lit(): BelongsTo
    {
        return $this->belongsTo(Lit::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medecin_id');
    }

    public function infirmier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'infirmier_id');
    }

    public function creePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cree_par');
    }

    public function litDestination(): BelongsTo
    {
        return $this->belongsTo(Lit::class, 'lit_destination_id');
    }

    public function serviceDestination(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_destination_id');
    }

    // ── Scopes ──────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('statut', 'active');
    }

    public function scopeTerminees($query)
    {
        return $query->whereIn('statut', ['terminee', 'transfere', 'annulee']);
    }

    public function scopeParService($query, int $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    public function scopeParPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // ── Accesseurs ──────────────────────────────────────────────────

    /**
     * Durée du séjour en jours (en cours ou terminé).
     */
    public function getDureeSejourAttribute(): int
    {
        $fin = $this->date_sortie ?? now();
        return (int) $this->date_entree->diffInDays($fin);
    }

    /**
     * Coût calculé basé sur tarif journalier du lit.
     */
    public function getCoutCalculeAttribute(): float
    {
        $tarif = $this->lit?->tarif_journalier ?? 0;
        return round($this->duree_sejour * $tarif, 2);
    }

    public function getEstActiveAttribute(): bool
    {
        return $this->statut === 'active';
    }

    // ── Méthodes métier ─────────────────────────────────────────────

    /**
     * Terminer une occupation (sortie patient).
     */
    public function terminer(string $motif, ?string $notesSortie = null, ?int $userId = null): void
    {
        $this->update([
            'statut'       => 'terminee',
            'motif_sortie' => $motif,
            'notes_sortie' => $notesSortie,
            'date_sortie'  => now(),
            'cout_sejour'  => $this->cout_calcule,
        ]);

        // Passer le lit en nettoyage
        $this->lit->update(['statut' => 'nettoyage']);

        HistoriqueLit::create([
            'lit_id'        => $this->lit_id,
            'service_id'    => $this->service_id,
            'user_id'       => $userId,
            'occupation_id' => $this->id,
            'ancien_statut' => 'occupe',
            'nouveau_statut' => 'nettoyage',
            'action'        => 'sortie',
            'commentaire'   => "Sortie patient — motif : {$motif}",
        ]);
    }

    /**
     * Transférer le patient vers un autre lit (même hôpital).
     */
    public function transferer(Lit $litDestination, ?string $commentaire = null, ?int $userId = null): self
    {
        $litSource = $this->lit;

        // Clore l'occupation courante
        $this->update([
            'statut'                 => 'transfere',
            'motif_sortie'           => 'transfert_interne',
            'date_sortie'            => now(),
            'cout_sejour'            => $this->cout_calcule,
            'lit_destination_id'     => $litDestination->id,
            'service_destination_id' => $litDestination->service_id,
        ]);

        $litSource->update(['statut' => 'nettoyage']);

        HistoriqueLit::create([
            'lit_id'                 => $this->lit_id,
            'service_id'             => $this->service_id,
            'user_id'                => $userId,
            'occupation_id'          => $this->id,
            'ancien_statut'          => 'occupe',
            'nouveau_statut'         => 'nettoyage',
            'action'                 => 'transfert_source',
            'service_source_id'      => $this->service_id,
            'service_destination_id' => $litDestination->service_id,
            'commentaire'            => $commentaire,
        ]);

        // Nouvelle occupation sur le lit destination
        $nouvelle = self::create([
            'lit_id'               => $litDestination->id,
            'service_id'           => $litDestination->service_id,
            'patient_id'           => $this->patient_id,
            'medecin_id'           => $this->medecin_id,
            'infirmier_id'         => $this->infirmier_id,
            'cree_par'             => $userId,
            'diagnostic_principal' => $this->diagnostic_principal,
            'notes_admission'      => $this->notes_admission,
            'date_entree'          => now(),
            'statut'               => 'active',
        ]);

        $litDestination->update(['statut' => 'occupe']);

        HistoriqueLit::create([
            'lit_id'                 => $litDestination->id,
            'service_id'             => $litDestination->service_id,
            'user_id'                => $userId,
            'occupation_id'          => $nouvelle->id,
            'ancien_statut'          => $litDestination->statut,
            'nouveau_statut'         => 'occupe',
            'action'                 => 'transfert_destination',
            'service_source_id'      => $this->service_id,
            'service_destination_id' => $litDestination->service_id,
            'commentaire'            => $commentaire,
        ]);

        return $nouvelle;
    }

    /**
     * Marquer le lit en nettoyage sans sortie de patient (maintenance).
     */
    public function marquerNettoyage(?int $userId = null): void
    {
        $ancienStatut = $this->lit->statut;

        $this->update([
            'statut'      => 'terminee',
            'motif_sortie' => 'autre',
            'date_sortie' => now(),
        ]);

        $this->lit->update(['statut' => 'nettoyage']);

        HistoriqueLit::create([
            'lit_id'        => $this->lit_id,
            'service_id'    => $this->service_id,
            'user_id'       => $userId,
            'occupation_id' => $this->id,
            'ancien_statut' => $ancienStatut,
            'nouveau_statut' => 'nettoyage',
            'action'        => 'nettoyage_debut',
            'commentaire'   => 'Lit marqué en nettoyage',
        ]);
    }
}