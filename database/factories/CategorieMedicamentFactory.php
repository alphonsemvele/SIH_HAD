<?php

namespace Database\Factories;

use App\Models\CategorieMedicament;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategorieMedicamentFactory extends Factory
{
    protected $model = CategorieMedicament::class;

    public function definition(): array
    {
        return [
            'code'        => strtoupper(fake()->unique()->bothify('CAT-####')),
            'nom'         => fake()->randomElement([
                'Antalgique', 'Antibiotique', 'Anti-inflammatoire',
                'Antidiabétique', 'Antihypertenseur', 'Antipaludéen',
                'Antiseptique', 'Vitamine',
            ]) . ' ' . fake()->unique()->numerify('###'),
            'description' => fake()->optional()->sentence(),
            'couleur'     => fake()->safeColorName(),
            'actif'       => true,
        ];
    }
}
