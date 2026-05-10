<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Seeder maître - lance TOUT dans l'ordre.
 *
 * Usage:
 *   php artisan db:seed                    # Tout
 *   php artisan db:seed --class=DemoSeeder # Juste les patients/tournées
 *
 * IMPORTANT: certains seeders dépendent les uns des autres :
 *   1. UserSeeder         → crée les users (Paul, Sophie, Dr NDIAYE)
 *   2. ServiceSeeder      → services hospitaliers
 *   3. DemoSeeder         → patients, patient_hads, tournées 11+12, visites, QR codes
 *   4. TourneesPlanifieesSeeder → tournées 'planifiee' demain/après-demain (dépend de Paul)
 *   5. AlertesDemoSeeder  → 5 alertes
 *   6. PlanningDemoSeeder → 5 événements planning
 *   7. RapportsDemoSeeder → 5 rapports (dépend des patients + tournées)
 *   8. ConversationsDemoSeeder → 3 conversations + messages (dépend des users)
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  🌱 SEEDING COMPLET - SIH/HAD Démo Ségur');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('');

        $this->call([
            // 1. Fondations
            UserSeeder::class,
            ServiceSeeder::class,

            // 2. Données métier de base
            DemoSeeder::class,

            // 3. Données dépendantes
            TourneesPlanifieesSeeder::class,
            AlertesDemoSeeder::class,
            PlanningDemoSeeder::class,
            RapportsDemoSeeder::class,
            ConversationsDemoSeeder::class,
        ]);

        $this->command->info('');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('  ✅ SEEDING TERMINÉ');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
}
