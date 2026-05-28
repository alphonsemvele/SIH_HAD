<?php

namespace Database\Factories;

use App\Models\CategorieMedicament;
use App\Models\Fournisseur;
use App\Models\Medicament;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicamentFactory extends Factory
{
    protected $model = Medicament::class;

    public function definition(): array
    {
        $prixAchat = fake()->randomFloat(2, 100, 5000);
        $prixVente = round($prixAchat * fake()->randomFloat(2, 1.2, 2.0), 2);
        $stockMin  = fake()->numberBetween(5, 20);
        $stockMax  = fake()->numberBetween(100, 500);

        return [
            'code'                    => 'MED' . fake()->unique()->numerify('#####'),
            'nom'                     => fake()->randomElement([
                'Paracétamol', 'Amoxicilline', 'Ibuprofène', 'Métronidazole',
                'Oméprazole', 'Diclofénac', 'Ciprofloxacine', 'Azithromycine',
            ]) . ' ' . fake()->numberBetween(100, 1000) . 'mg',
            'dci'                     => fake()->word(),
            'forme'                   => fake()->randomElement([
                'comprime', 'gelule', 'sirop', 'injectable', 'pommade',
                'collyre', 'suppositoire', 'solution', 'poudre', 'autre',
            ]),
            'dosage'                  => fake()->numberBetween(50, 1000) . 'mg',
            'categorie_medicament_id' => CategorieMedicament::factory(),
            'voie_administration'     => fake()->randomElement([
                'orale', 'injectable', 'cutanee', 'rectale',
                'oculaire', 'nasale', 'auriculaire', 'autre',
            ]),
            'conditionnement'         => 'Boîte de ' . fake()->numberBetween(10, 50),
            'stock_actuel'            => fake()->numberBetween(0, $stockMax),
            'stock_minimum'           => $stockMin,
            'stock_maximum'           => $stockMax,
            'prix_achat'              => $prixAchat,
            'prix_vente'              => $prixVente,
            'tva'                     => 19.25,
            'fournisseur_id'          => Fournisseur::factory(),
            'date_expiration'         => fake()->dateTimeBetween('+6 months', '+3 years'),
            'emplacement'             => fake()->randomElement(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
            'ordonnance_obligatoire'  => fake()->boolean(),
            'actif'                   => true,
            'notes'                   => fake()->optional(0.3)->sentence(),
        ];
    }
}
