<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RapportsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== RapportsDemoSeeder ===');

        $paul = DB::table('users')->where('email', 'infirmier@sih.local')->value('id');
        if (!$paul) {
            $this->command->warn('  ⚠️ User Paul TCHOUMI absent - skip RapportsDemoSeeder');
            return;
        }

        // Récupérer dynamiquement les IDs patients (résiste aux re-seeds)
        $patientKamga   = DB::table('patients')->where('nom', 'KAMGA')->value('id');
        $patientNguema  = DB::table('patients')->where('nom', 'NGUEMA')->value('id');
        $patientFouda   = DB::table('patients')->where('nom', 'FOUDA')->value('id');

        $tourneeAujourdhui = DB::table('tournees')->where('soignant_id', $paul)->whereDate('date', today())->value('id');
        $tourneeHier       = DB::table('tournees')->whereDate('date', today()->subDay())->value('id');

        DB::table('rapports')->delete();

        $rapports = [
            ['titre' => 'CR visite Mme KAMGA',          'contenu' => "Patiente AVC J+15. Tension 145/85, Glasgow 15. Voie veineuse OK. Furosémide 60mg administré. État stable, surveillance continue.",                                                  'type' => 'visite',   'status' => 'complet',  'date_offset' => -2, 'patient_id' => $patientKamga,  'tournee_id' => $tourneeAujourdhui, 'notes' => 'Photo plaie pied annexée'],
            ['titre' => 'Bilan tournée matinée',         'contenu' => "Tournée 8h-12h, 6 patients visités (3 réalisés à 12h00). Score moyen Glasgow 14/15. RAS sur lensemble. Carburant: 4.2L.",                                                       'type' => 'tournee',  'status' => 'en_cours', 'date_offset' => 0,  'patient_id' => null,           'tournee_id' => $tourneeAujourdhui, 'notes' => null],
            ['titre' => 'CR visite M. NGUEMA',           'contenu' => "Patient diabète type 2 + ulcère pied. Glycémie 2.4 g/L (HAUTE). Pansement refait. Insuline 12 UI administrée. Suivre 3x/sem.",                                                  'type' => 'visite',   'status' => 'complet',  'date_offset' => -1, 'patient_id' => $patientNguema, 'tournee_id' => $tourneeHier,        'notes' => 'Voir Dr NDIAYE pour ajustement traitement'],
            ['titre' => 'CR visite Mme FOUDA',           'contenu' => "Cancer sein - Soins palliatifs. EVA 7/10. Passage palier 3 (oxycodone 10mg). Famille présente, soutien psy demandé.",                                                            'type' => 'visite',   'status' => 'complet',  'date_offset' => -1, 'patient_id' => $patientFouda,  'tournee_id' => $tourneeHier,        'notes' => null],
            ['titre' => 'Incident — Vol médicaments',    'contenu' => "Le 09/05 à 15h30, sac de tournée laissé 5min véhicule entrouvert. 2 ampoules Furosémide manquantes. Plainte déposée commissariat Bastos.",                                       'type' => 'incident', 'status' => 'complet',  'date_offset' => -1, 'patient_id' => null,           'tournee_id' => $tourneeHier,        'notes' => 'PV n° 2026-1247'],
        ];

        foreach ($rapports as $r) {
            $offset = $r['date_offset'];
            unset($r['date_offset']);
            DB::table('rapports')->insert(array_merge($r, [
                'date_rapport' => today()->addDays($offset)->toDateString(),
                'fichier_path' => null,
                'created_by'   => $paul,
                'created_at'   => now()->subHours(rand(1, 48)),
                'updated_at'   => now(),
            ]));
        }

        $this->command->info('  ✅ ' . count($rapports) . ' rapports créés (3 visites, 1 tournée, 1 incident)');
    }
}
