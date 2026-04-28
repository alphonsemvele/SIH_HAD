<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Tournee extends Model
{
    use HasFactory, SoftDeletes;

    // ── Statuts ───────────────────────────────────────────────────────────
    const STATUT_PLANIFIEE = 'planifiee';
    const STATUT_EN_COURS  = 'en_cours';
    const STATUT_TERMINEE  = 'terminee';
    const STATUT_ANNULEE   = 'annulee';

    const STATUTS = [
        self::STATUT_PLANIFIEE,
        self::STATUT_EN_COURS,
        self::STATUT_TERMINEE,
        self::STATUT_ANNULEE,
    ];

    // ── Types de tournée ──────────────────────────────────────────────────
    const TYPE_COMPLETE       = 'complete';
    const TYPE_CAS_CRITIQUES  = 'cas_critiques';
    const TYPE_CHAMBRE_SPECIF = 'chambre_specifique';

    const TYPES = [
        self::TYPE_COMPLETE,
        self::TYPE_CAS_CRITIQUES,
        self::TYPE_CHAMBRE_SPECIF,
    ];

    // ── Récurrences ───────────────────────────────────────────────────────
    const REC_UNIQUE        = 'unique';
    const REC_QUOTIDIENNE   = 'quotidienne';
    const REC_HEBDOMADAIRE  = 'hebdomadaire';
    const REC_PERSONNALISEE = 'personnalisee';

    const RECURRENCES = [
        self::REC_UNIQUE,
        self::REC_QUOTIDIENNE,
        self::REC_HEBDOMADAIRE,
        self::REC_PERSONNALISEE,
    ];

    // ── Fillable ──────────────────────────────────────────────────────────
    protected $fillable = [
        'soignant_id',
        'service_id',
        'date',
        'vehicule',
        'heure_debut_prevue',
        'heure_fin_prevue',
        'heure_debut_effective',
        'heure_fin_effective',
        'heure_debut_2',
        'heure_debut_3',
        'kilometres',
        'type',
        'statut',
        'notes',
        // Récurrence
        'recurrence',
        'jours_actifs',
        'frequence_journaliere',
        'date_fin_recurrence',
        'recurrence_parent_id',
    ];

    // ── Casts ─────────────────────────────────────────────────────────────
    protected function casts(): array
    {
        return [
            'id'                     => 'integer',
            'soignant_id'            => 'integer',
            'service_id'             => 'integer',
            'recurrence_parent_id'   => 'integer',
            'date'                   => 'date',
            'date_fin_recurrence'    => 'date',
            'heure_debut_prevue'     => 'datetime:H:i',
            'heure_fin_prevue'       => 'datetime:H:i',
            'heure_debut_effective'  => 'datetime:H:i',
            'heure_fin_effective'    => 'datetime:H:i',
            'heure_debut_2'          => 'datetime:H:i',
            'heure_debut_3'          => 'datetime:H:i',
            'kilometres'             => 'decimal:2',
            'frequence_journaliere'  => 'integer',
            'jours_actifs'           => 'array',
        ];
    }

    // ── Relations ─────────────────────────────────────────────────────────

    public function soignant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'soignant_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function visiteHads(): HasMany
    {
        return $this->hasMany(VisiteHad::class);
    }

    public function visitesEffectuees(): HasMany
    {
        return $this->visiteHads()->whereNotNull('visite_at');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Tournee::class, 'recurrence_parent_id');
    }

    public function occurrences(): HasMany
    {
        return $this->hasMany(Tournee::class, 'recurrence_parent_id');
    }

    // ── Accesseurs ────────────────────────────────────────────────────────

    public function getPatientsTotal(): int
    {
        return $this->visiteHads()->count();
    }

    public function getPatientsVus(): int
    {
        return $this->visitesEffectuees()->count();
    }

    public function getDureeEffective(): ?int
    {
        if (!$this->heure_debut_effective || !$this->heure_fin_effective) {
            return null;
        }
        return (int) Carbon::parse($this->heure_debut_effective)
            ->diffInMinutes(Carbon::parse($this->heure_fin_effective));
    }

    public function getStatutLabel(): string
    {
        return match ($this->statut) {
            self::STATUT_PLANIFIEE => 'Planifiée',
            self::STATUT_EN_COURS  => 'En cours',
            self::STATUT_TERMINEE  => 'Terminée',
            self::STATUT_ANNULEE   => 'Annulée',
            default                => ucfirst($this->statut),
        };
    }

    public function estUneOccurrence(): bool
    {
        return $this->recurrence_parent_id !== null;
    }

    public function estRecurrente(): bool
    {
        return $this->recurrence !== self::REC_UNIQUE;
    }

    // ── Scopes ────────────────────────────────────────────────────────────

    public function scopePlanifiees($query)
    {
        return $query->where('statut', self::STATUT_PLANIFIEE);
    }

    public function scopeEnCours($query)
    {
        return $query->where('statut', self::STATUT_EN_COURS);
    }

    public function scopeTerminees($query)
    {
        return $query->where('statut', self::STATUT_TERMINEE);
    }

    public function scopeDuJour($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeDeLaSemaine($query, Carbon $lundi = null)
    {
        $debut = $lundi ?? now()->startOfWeek();
        return $query->whereBetween('date', [$debut, $debut->copy()->endOfWeek()]);
    }

    public function scopeDuService($query, int $serviceId)
    {
        return $query->where('service_id', $serviceId);
    }

    public function scopeDuSoignant($query, int $soignantId)
    {
        return $query->where('soignant_id', $soignantId);
    }

    public function scopeSouches($query)
    {
        return $query->whereNull('recurrence_parent_id');
    }

    // ── Méthodes métier ───────────────────────────────────────────────────

    public function demarrer(): void
    {
        $this->update([
            'statut'                => self::STATUT_EN_COURS,
            'heure_debut_effective' => now(),
        ]);
    }

    public function terminer(): void
    {
        $this->update([
            'statut'              => self::STATUT_TERMINEE,
            'heure_fin_effective' => now(),
        ]);
    }

    public function annuler(string $raison = ''): void
    {
        $this->update([
            'statut' => self::STATUT_ANNULEE,
            'notes'  => $raison
                ? trim($this->notes . "\n[Annulation] " . $raison)
                : $this->notes,
        ]);
    }

    public function suspendre(): void
    {
        $this->update(['statut' => self::STATUT_PLANIFIEE]);
    }

    public function genererOccurrences(): int
    {
        if (!$this->estRecurrente()) {
            return 0;
        }

        $debut       = $this->date->copy()->addDay();
        $fin         = $this->date_fin_recurrence
                          ? Carbon::parse($this->date_fin_recurrence)
                          : $this->date->copy()->addWeeks(8);
        $joursActifs = $this->jours_actifs ?? [1, 2, 3, 4, 5];

        $creneaux = array_filter([
            $this->heure_debut_prevue instanceof Carbon
                ? $this->heure_debut_prevue->format('H:i')
                : $this->heure_debut_prevue,
            $this->frequence_journaliere >= 2 ? (
                $this->heure_debut_2 instanceof Carbon
                    ? $this->heure_debut_2->format('H:i')
                    : $this->heure_debut_2
            ) : null,
            $this->frequence_journaliere >= 3 ? (
                $this->heure_debut_3 instanceof Carbon
                    ? $this->heure_debut_3->format('H:i')
                    : $this->heure_debut_3
            ) : null,
        ]);

        $occurrences = [];
        $cursor      = $debut->copy();
        $now         = now();

        while ($cursor->lte($fin)) {
            $jourSemaine = (int) $cursor->dayOfWeek;

            $inclure = match ($this->recurrence) {
                self::REC_QUOTIDIENNE   => true,
                self::REC_HEBDOMADAIRE  => in_array($jourSemaine, $joursActifs),
                self::REC_PERSONNALISEE => in_array($jourSemaine, $joursActifs),
                default                 => false,
            };

            if ($inclure) {
                foreach ($creneaux as $heure) {
                    $occurrences[] = [
                        'soignant_id'           => $this->soignant_id,
                        'service_id'            => $this->service_id,
                        'date'                  => $cursor->format('Y-m-d'),
                        'vehicule'              => $this->vehicule,
                        'heure_debut_prevue'    => $heure,
                        'heure_fin_prevue'      => $this->heure_fin_prevue instanceof Carbon
                                                    ? $this->heure_fin_prevue->format('H:i')
                                                    : $this->heure_fin_prevue,
                        'type'                  => $this->type,
                        'statut'                => self::STATUT_PLANIFIEE,
                        'recurrence'            => self::REC_UNIQUE,
                        'frequence_journaliere' => 1,
                        'recurrence_parent_id'  => $this->id,
                        'notes'                 => $this->notes,
                        'created_at'            => $now,
                        'updated_at'            => $now,
                    ];
                }
            }

            $cursor->addDay();
        }

        if (empty($occurrences)) {
            return 0;
        }

        foreach (array_chunk($occurrences, 500) as $chunk) {
            Tournee::insert($chunk);
        }

        return count($occurrences);
    }
}