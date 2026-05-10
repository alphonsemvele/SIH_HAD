<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlertesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== AlertesDemoSeeder ===');

        DB::table('alertes')->delete();

        $alertes = [
            ['patient_nom' => 'KAMGA Marie',       'diagnostic' => 'AVC ischémique',                      'alerte' => 'Tension artérielle élevée: 165/95 mmHg',   'quartier' => 'Bastos',           'telephone' => '+237699000001', 'age' => 76, 'niveau' => 'Critique', 'heure' => '08:45', 'minutes_ago' => 45],
            ['patient_nom' => 'BERNARD Pierre',    'diagnostic' => 'Adénocarcinome - Chimiothérapie',     'alerte' => 'Nausées importantes après séance chimio', 'quartier' => 'Lyon - Part-Dieu', 'telephone' => '+33699000004', 'age' => 82, 'niveau' => 'Urgent',   'heure' => '11:30', 'minutes_ago' => 15],
            ['patient_nom' => 'NGUEMA Joseph',     'diagnostic' => 'Diabète type 2 + ulcère pied',        'alerte' => 'Glycémie haute: 2.4 g/L à 9h30',          'quartier' => 'Mvog-Mbi',         'telephone' => '+237699000002', 'age' => 68, 'niveau' => 'Urgent',   'heure' => '09:30', 'minutes_ago' => 120],
            ['patient_nom' => 'FOUDA Bernadette',  'diagnostic' => 'Cancer sein - Soins palliatifs',      'alerte' => 'EVA douleur 7/10, palier 3 demandé',      'quartier' => 'Etoa-Meki',        'telephone' => '+237699000003', 'age' => 64, 'niveau' => 'Critique', 'heure' => '10:15', 'minutes_ago' => 60],
            ['patient_nom' => 'MARTIN Camille',    'diagnostic' => 'Endocardite - Antibio IV',            'alerte' => 'Voie veineuse à changer (J+5)',           'quartier' => 'Paris - Voltaire', 'telephone' => '+33699000020', 'age' => 51, 'niveau' => 'Moyen',    'heure' => '14:00', 'minutes_ago' => 180],
        ];

        foreach ($alertes as $a) {
            $minutesAgo = $a['minutes_ago'];
            unset($a['minutes_ago']);
            DB::table('alertes')->insert(array_merge($a, [
                'date'       => today()->toDateString(),
                'created_at' => now()->subMinutes($minutesAgo),
                'updated_at' => now()->subMinutes($minutesAgo),
            ]));
        }

        $this->command->info('  ✅ ' . count($alertes) . ' alertes créées (Critique: 2, Urgent: 2, Moyen: 1)');
    }
}
