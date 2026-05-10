<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanningDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== PlanningDemoSeeder ===');

        DB::table('plannings')->delete();

        $events = [
            ['titre' => 'Tournée matinée Bastos',         'description' => 'Tournée HAD - 6 patients, secteur Bastos-Nlongkak', 'type' => 'tournee',      'date_offset' => 0,  'heure_debut' => '08:00', 'heure_fin' => '12:00', 'secteur' => 'Bastos - Nlongkak', 'lieu' => null],
            ['titre' => 'Réunion équipe HAD',             'description' => 'Point hebdomadaire coordination',                    'type' => 'reunion',      'date_offset' => 0,  'heure_debut' => '14:00', 'heure_fin' => '15:00', 'secteur' => null,                'lieu' => 'Salle conférence - HCY'],
            ['titre' => 'Formation AFGSU',                'description' => 'Recyclage gestes et soins durgence',               'type' => 'formation',    'date_offset' => 1,  'heure_debut' => '09:00', 'heure_fin' => '12:00', 'secteur' => null,                'lieu' => 'Centre de formation HCY'],
            ['titre' => 'Tournée après-midi Mvog-Mbi',    'description' => 'Tournée HAD - 4 patients',                          'type' => 'tournee',      'date_offset' => 2,  'heure_debut' => '14:00', 'heure_fin' => '18:00', 'secteur' => 'Mvog-Mbi',          'lieu' => null],
            ['titre' => 'Consultation Dr NDIAYE',         'description' => 'Réévaluation Mme KAMGA - AVC',                      'type' => 'consultation', 'date_offset' => -1, 'heure_debut' => '10:00', 'heure_fin' => '10:30', 'secteur' => null,                'lieu' => 'Cabinet médecin HCY'],
        ];

        foreach ($events as $e) {
            $offset = $e['date_offset'];
            unset($e['date_offset']);
            DB::table('plannings')->insert(array_merge($e, [
                'date'       => today()->addDays($offset)->toDateString(),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        $this->command->info('  ✅ ' . count($events) . ' événements planning créés');
    }
}
