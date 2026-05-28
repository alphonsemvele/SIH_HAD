<?php

namespace App\Services\Pharmacie;

use App\Models\Medicament;
use App\Models\MouvementLot;
use App\Models\User;
use App\Models\Alerte;
use App\Models\AlerteUser;
use App\Services\Audit\AuditTrailService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Exception;

class StockLotService
{
    public function __construct(
        private AuditTrailService $auditService
    ) {}

    /**
     * Entrée de stock pour un médicament
     */
    public function entreeStock(Medicament $med, string $lot, Carbon $peremption, int $quantite, ?Model $source = null): MouvementLot
    {
        $this->auditService->log(
            'stock_entree_lot',
            $med,
            [
                'medicament_id' => $med->id,
                'lot' => $lot,
                'peremption' => $peremption->format('Y-m-d'),
                'quantite' => $quantite,
                'source_type' => $source?->getMorphClass(),
                'source_id' => $source?->id,
            ],
            'pharmacie'
        );

        return MouvementLot::create([
            'medicament_id' => $med->id,
            'numero_lot' => $lot,
            'date_peremption' => $peremption,
            'type' => 'entree',
            'quantite_signed' => abs($quantite), // Toujours positif pour les entrées
            'source_type' => $source?->getMorphClass(),
            'source_id' => $source?->id,
            'user_id' => auth()->id(),
            'commentaire' => 'Entrée de stock',
        ]);
    }

    /**
     * Sortie de stock pour un médicament
     */
    public function sortieStock(Medicament $med, string $lot, int $quantite, Model $source): MouvementLot
    {
        // Vérifier le stock disponible
        $stockDisponible = $this->getStockDisponibleLot($med, $lot);
        
        if ($stockDisponible < $quantite) {
            throw new Exception("Stock insuffisant pour le lot {$lot}. Disponible: {$stockDisponible}, Demandé: {$quantite}");
        }

        $this->auditService->log(
            'stock_sortie_lot',
            $med,
            [
                'medicament_id' => $med->id,
                'lot' => $lot,
                'quantite' => $quantite,
                'source_type' => $source->getMorphClass(),
                'source_id' => $source->id,
                'stock_disponible_avant' => $stockDisponible,
            ],
            'pharmacie'
        );

        return MouvementLot::create([
            'medicament_id' => $med->id,
            'numero_lot' => $lot,
            'date_peremption' => $this->getDatePeremptionLot($med, $lot),
            'type' => 'sortie',
            'quantite_signed' => -abs($quantite), // Négatif pour les sorties
            'source_type' => $source->getMorphClass(),
            'source_id' => $source->id,
            'user_id' => auth()->id(),
            'commentaire' => 'Sortie de stock',
        ]);
    }

    /**
     * Ajustement d'inventaire
     */
    public function inventaire(Medicament $med, string $lot, int $quantiteReelle, User $user): MouvementLot
    {
        $stockActuel = $this->getStockDisponibleLot($med, $lot);
        $difference = $quantiteReelle - $stockActuel;

        $this->auditService->log(
            'stock_inventaire_lot',
            $med,
            [
                'medicament_id' => $med->id,
                'lot' => $lot,
                'stock_actuel' => $stockActuel,
                'quantite_reelle' => $quantiteReelle,
                'difference' => $difference,
                'user_id' => $user->id,
            ],
            'pharmacie'
        );

        return MouvementLot::create([
            'medicament_id' => $med->id,
            'numero_lot' => $lot,
            'date_peremption' => $this->getDatePeremptionLot($med, $lot),
            'type' => 'inventaire',
            'quantite_signed' => $difference, // Positif si gain, négatif si perte
            'user_id' => $user->id,
            'commentaire' => "Ajustement inventaire: {$stockActuel} → {$quantiteReelle}",
        ]);
    }

    /**
     * Lister les lots expirant bientôt
     */
    public function lotsExpirantBientot(int $jours = 60): Collection
    {
        $dateLimite = Carbon::now()->addDays($jours);
        
        return MouvementLot::select([
            'medicament_id',
            'numero_lot',
            'date_peremption',
            \DB::raw('SUM(quantite_signed) as stock_actuel')
        ])
            ->where('date_peremption', '<=', $dateLimite)
            ->where('date_peremption', '>', Carbon::now())
            ->groupBy(['medicament_id', 'numero_lot', 'date_peremption'])
            ->havingRaw('SUM(quantite_signed) > 0')
            ->with('medicament')
            ->orderBy('date_peremption')
            ->get();
    }

    /**
     * Obtenir le stock par lot pour un médicament
     */
    public function getStockParLot(Medicament $med): array
    {
        $stocks = MouvementLot::select([
            'numero_lot',
            'date_peremption',
            \DB::raw('SUM(quantite_signed) as stock_actuel')
        ])
            ->where('medicament_id', $med->id)
            ->groupBy(['numero_lot', 'date_peremption'])
            ->havingRaw('SUM(quantite_signed) > 0')
            ->orderBy('date_peremption')
            ->get();

        return $stocks->map(function ($stock) {
            return [
                'numero_lot' => $stock->numero_lot,
                'date_peremption' => $stock->date_peremption->format('Y-m-d'),
                'stock_actuel' => (int) $stock->stock_actuel,
                'jours_restants' => Carbon::now()->diffInDays($stock->date_peremption),
                'statut' => $this->getStatutLot($stock->date_peremption),
            ];
        })->toArray();
    }

    /**
     * Obtenir le stock disponible pour un lot spécifique
     */
    private function getStockDisponibleLot(Medicament $med, string $lot): int
    {
        return MouvementLot::where('medicament_id', $med->id)
            ->where('numero_lot', $lot)
            ->sum('quantite_signed');
    }

    /**
     * Obtenir la date de péremption pour un lot
     */
    private function getDatePeremptionLot(Medicament $med, string $lot): Carbon
    {
        $mouvement = MouvementLot::where('medicament_id', $med->id)
            ->where('numero_lot', $lot)
            ->first();

        if (!$mouvement) {
            throw new Exception("Lot {$lot} non trouvé pour le médicament {$med->id}");
        }

        return $mouvement->date_peremption;
    }

    /**
     * Obtenir le statut d'un lot selon sa péremption
     */
    private function getStatutLot(Carbon $peremption): string
    {
        $joursRestants = Carbon::now()->diffInDays($peremption);
        
        if ($joursRestants < 0) {
            return 'expiré';
        } elseif ($joursRestants <= 7) {
            return 'urgent';
        } elseif ($joursRestants <= 30) {
            return 'alerte';
        } elseif ($joursRestants <= 60) {
            return 'attention';
        }
        
        return 'normal';
    }
}
