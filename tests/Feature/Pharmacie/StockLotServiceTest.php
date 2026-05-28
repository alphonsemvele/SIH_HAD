<?php

namespace Tests\Feature\Pharmacie;

use App\Models\Medicament;
use App\Models\MouvementLot;
use App\Models\User;
use App\Services\Pharmacie\StockLotService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockLotServiceTest extends TestCase
{
    use RefreshDatabase;

    private StockLotService $stockService;
    private User $user;
    private Medicament $medicament;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->stockService = app(StockLotService::class);
        $this->user = User::factory()->create(['fonction' => 'pharmacien']);
        
        // Créer un médicament avec les champs minimaux requis
        $this->medicament = Medicament::create([
            'code' => 'MED001',
            'nom' => 'Paracétamol',
            'forme' => 'comprime',
            'categorie' => 'antalgique',
            'voie_administration' => 'orale',
        ]);
        
        $this->actingAs($this->user);
    }

    public function test_entree_stock(): void
    {
        $lot = 'LOT001';
        $peremption = Carbon::now()->addMonths(6);
        $quantite = 100;

        $mouvement = $this->stockService->entreeStock(
            $this->medicament,
            $lot,
            $peremption,
            $quantite
        );

        $this->assertInstanceOf(MouvementLot::class, $mouvement);
        $this->assertEquals($this->medicament->id, $mouvement->medicament_id);
        $this->assertEquals($lot, $mouvement->numero_lot);
        $this->assertEquals($peremption->format('Y-m-d'), $mouvement->date_peremption->format('Y-m-d'));
        $this->assertEquals('entree', $mouvement->type);
        $this->assertEquals($quantite, $mouvement->quantite_signed);
        $this->assertEquals($this->user->id, $mouvement->user_id);

        // Vérifier le stock disponible
        $stockDisponible = $this->stockService->getStockParLot($this->medicament);
        $this->assertEquals($quantite, $stockDisponible[0]['stock_actuel']);
    }

    public function test_sortie_stock_succes(): void
    {
        // D'abord faire une entrée
        $lot = 'LOT002_SORTIE';
        $peremption = Carbon::now()->addMonths(6);
        $quantiteEntree = 50;
        
        $this->stockService->entreeStock($this->medicament, $lot, $peremption, $quantiteEntree);

        // Puis faire une sortie
        $quantiteSortie = 20;
        $source = MouvementLot::where('numero_lot', $lot)->first(); // Utiliser le mouvement d'entrée comme source

        $mouvement = $this->stockService->sortieStock(
            $this->medicament,
            $lot,
            $quantiteSortie,
            $source
        );

        $this->assertInstanceOf(MouvementLot::class, $mouvement);
        $this->assertEquals('sortie', $mouvement->type);
        $this->assertEquals(-$quantiteSortie, $mouvement->quantite_signed);

        // Vérifier le stock disponible pour ce lot spécifique
        $stockDisponible = $this->stockService->getStockParLot($this->medicament);
        $stockLot = collect($stockDisponible)->firstWhere('numero_lot', $lot);
        $this->assertEquals($quantiteEntree - $quantiteSortie, $stockLot['stock_actuel']);
    }

    public function test_sortie_stock_insuffisant(): void
    {
        // D'abord faire une entrée
        $lot = 'LOT003_INSUFFISANT';
        $peremption = Carbon::now()->addMonths(6);
        $quantiteEntree = 10;
        
        $this->stockService->entreeStock($this->medicament, $lot, $peremption, $quantiteEntree);

        // Tenter une sortie supérieure au stock
        $quantiteSortie = 20;
        $source = MouvementLot::where('numero_lot', $lot)->first();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage("Stock insuffisant pour le lot {$lot}. Disponible: {$quantiteEntree}, Demandé: {$quantiteSortie}");

        $this->stockService->sortieStock(
            $this->medicament,
            $lot,
            $quantiteSortie,
            $source
        );
    }

    public function test_lots_expirant_bientot(): void
    {
        // Créer plusieurs lots avec différentes péremptions
        $lots = [
            ['lot' => 'LOT004_EXPIRANT', 'jours' => 5, 'quantite' => 10], // Doit apparaître
            ['lot' => 'LOT005_EXPIRANT', 'jours' => 25, 'quantite' => 15], // Doit apparaître
            ['lot' => 'LOT006_EXPIRANT', 'jours' => 65, 'quantite' => 20], // Ne doit pas apparaître
            ['lot' => 'LOT007_EXPIRANT', 'jours' => -5, 'quantite' => 5], // Déjà expiré, ne doit pas apparaître
        ];

        foreach ($lots as $data) {
            $peremption = Carbon::now()->addDays($data['jours']);
            $this->stockService->entreeStock(
                $this->medicament,
                $data['lot'],
                $peremption,
                $data['quantite']
            );
        }

        // Tester avec 60 jours
        $lotsExpirant = $this->stockService->lotsExpirantBientot(60);
        
        $this->assertCount(2, $lotsExpirant);
        $lotNumbers = $lotsExpirant->pluck('numero_lot')->toArray();
        $this->assertContains('LOT004_EXPIRANT', $lotNumbers);
        $this->assertContains('LOT005_EXPIRANT', $lotNumbers);

        // Tester avec 30 jours
        $lotsExpirant30 = $this->stockService->lotsExpirantBientot(30);
        $this->assertCount(1, $lotsExpirant30);
        $this->assertEquals('LOT004_EXPIRANT', $lotsExpirant30[0]->numero_lot);
    }

    public function test_get_stock_par_lot(): void
    {
        // Créer plusieurs mouvements pour tester l'agrégation
        $lot = 'LOT008_AGGREGATION';
        $peremption = Carbon::now()->addMonths(3);

        // Entrée 1
        $this->stockService->entreeStock($this->medicament, $lot, $peremption, 100);
        
        // Sortie 1
        $source = MouvementLot::where('numero_lot', $lot)->first();
        $this->stockService->sortieStock($this->medicament, $lot, 30, $source);
        
        // Entrée 2
        $this->stockService->entreeStock($this->medicament, $lot, $peremption, 50);

        $stockParLot = $this->stockService->getStockParLot($this->medicament);

        // Trouver le lot spécifique dans les résultats
        $stockLot = collect($stockParLot)->firstWhere('numero_lot', $lot);
        $this->assertNotNull($stockLot);
        $this->assertEquals($lot, $stockLot['numero_lot']);
        $this->assertEquals(120, $stockLot['stock_actuel']); // 100 - 30 + 50
        $this->assertArrayHasKey('jours_restants', $stockLot);
        $this->assertArrayHasKey('statut', $stockLot);
    }
}
