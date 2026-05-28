<?php

namespace Database\Factories;

use App\Models\PatientHad;
use App\Models\Tournee;
use Illuminate\Database\Eloquent\Factories\Factory;

class VisiteHadFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'tournee_id' => Tournee::factory(),
            'patient_id' => \App\Models\Patient::factory(),
            'ordre' => fake()->randomNumber(),
            'heure_prevue' => fake()->dateTimeBetween('now', '+1 week'),
            'duree_prevue' => fake()->numberBetween(30, 120),
            'priorite' => fake()->randomElement(['normal', 'surveillance', 'critique']),
            'chambre' => fake()->numberBetween(1, 50),
            'lit' => fake()->numberBetween(1, 4),
            'diagnostic' => fake()->sentence(),
            'jours_hospitalisation' => fake()->numberBetween(1, 30),
            'visite_at' => fake()->dateTimeBetween('-1 week', 'now'),
            'observations' => fake()->text(),
            'notes_soignant' => fake()->text(),
            'temperature' => fake()->numberBetween(35, 41) . '.0°C',
            'tension' => fake()->numberBetween(80, 180) . '/' . fake()->numberBetween(40, 100),
            'pouls' => fake()->numberBetween(40, 120) . ' bpm',
            'saturation' => fake()->numberBetween(85, 100) . '%',
        ];
    }
}
