<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TourneesPlanifieesSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== TourneesPlanifieesSeeder ===');

        $paul    = DB::table('users')->where('email', 'infirmier@sih.local')->value('id');
        $service = DB::table('services')->value('id') ?? 1;

        if (!$paul) {
            $this->command->warn('  ⚠️ User Paul TCHOUMI absent - skip TourneesPlanifieesSeeder');
            return;
        }

        // Supprimer les anciennes "planifiees" pour idempotence
        DB::table('tournees')->where('statut', 'planifiee')->delete();

        $tournees = [
            ['date_offset' => 1, 'heure_debut' => '08:00', 'heure_fin' => '12:00', 'notes' => 'Tournée matinée — secteur Bastos'],
            ['date_offset' => 2, 'heure_debut' => '14:00', 'heure_fin' => '18:00', 'notes' => 'Tournée après-midi — secteur Mvog-Mbi'],
        ];

        foreach ($tournees as $t) {
            DB::table('tournees')->insert([
                'soignant_id'         => $paul,
                'service_id'          => $service,
                'date'                => today()->addDays($t['date_offset'])->toDateString(),
                'heure_debut_prevue'  => $t['heure_debut'],
                'heure_fin_prevue'    => $t['heure_fin'],
                'vehicule'            => 'Hilux CE-1234-Y',
                'type'                => 'complete',
                'statut'              => 'planifiee',
                'notes'               => $t['notes'],
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);
        }

        $this->command->info('  ✅ ' . count($tournees) . ' tournées planifiées créées');
    }
}
