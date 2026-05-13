<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemandesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== DemandesDemoSeeder ===');

        DB::table('demandes_visite')->delete();

        $paul = DB::table('users')->where('email', 'infirmier@sih.local')->value('id');

        $demandes = [
            // 1. En attente - URGENTE
            [
                'patient_nom'        => 'MBARGA Sylvie',
                'patient_telephone'  => '+237699555111',
                'patient_age'        => 58,
                'adresse'            => 'Quartier Mvog-Ada, derrière la pharmacie centrale, maison bleue',
                'quartier'           => 'Mvog-Ada',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8480,
                'longitude'          => 11.5021,
                'symptomes'          => 'Douleur thoracique intense, essoufflement depuis 1h. Pas d\'antécédent cardiaque connu.',
                'duree_symptomes'    => '1 heure',
                'urgence'            => 'critique',
                'type'               => 'urgence',
                'statut'             => 'en_attente',
                'demandeur_nom'      => 'MBARGA Antoine',
                'demandeur_relation' => 'mari',
                'created_offset'     => -10,  // minutes ago
            ],

            // 2. En attente - URGENTE
            [
                'patient_nom'        => 'ONANA Joseph',
                'patient_telephone'  => '+237677888222',
                'patient_age'        => 72,
                'adresse'            => 'Quartier Etoa-Meki, rue derrière la station Total',
                'quartier'           => 'Etoa-Meki',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8682,
                'longitude'          => 11.5174,
                'symptomes'          => 'Diabétique. Glycémie à 3.8 g/L ce matin, vomissements, soif intense.',
                'duree_symptomes'    => '6 heures',
                'urgence'            => 'urgente',
                'type'               => 'visite',
                'statut'             => 'en_attente',
                'demandeur_nom'      => 'ONANA Pauline',
                'demandeur_relation' => 'fille',
                'created_offset'     => -45,
            ],

            // 3. En attente - MOYENNE
            [
                'patient_nom'        => 'KAMDEM Pierre',
                'patient_telephone'  => '+237691234567',
                'patient_age'        => 35,
                'adresse'            => 'Quartier Nlongkak, immeuble Sicotec 3ème étage app. 12',
                'quartier'           => 'Nlongkak',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8755,
                'longitude'          => 11.5253,
                'symptomes'          => 'Fièvre 39°C depuis 2 jours, maux de tête, fatigue intense. Pas de toux.',
                'duree_symptomes'    => '2 jours',
                'urgence'            => 'moyenne',
                'type'               => 'visite',
                'statut'             => 'en_attente',
                'demandeur_nom'      => null,
                'demandeur_relation' => null,
                'created_offset'     => -180,
            ],

            // 4. Acceptée (par Paul)
            [
                'patient_nom'        => 'BIYAGA Marthe',
                'patient_telephone'  => '+237695666777',
                'patient_age'        => 67,
                'adresse'            => 'Quartier Bastos, près de l\'ambassade USA, villa avec portail vert',
                'quartier'           => 'Bastos',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8950,
                'longitude'          => 11.5119,
                'symptomes'          => 'Hypertension non contrôlée. Tension 180/110 hier soir. Maux de tête.',
                'duree_symptomes'    => '24 heures',
                'urgence'            => 'urgente',
                'type'               => 'visite',
                'statut'             => 'acceptee',
                'assigned_to'        => $paul,
                'notes_infirmier'    => 'Vais passer après ma tournée Bastos. Préparer matériel TA + amlodipine.',
                'date_souhaitee'    => today()->toDateString(),
                'heure_souhaitee'   => '15:00',
                'demandeur_nom'      => 'BIYAGA Roger',
                'demandeur_relation' => 'fils',
                'created_offset'     => -300,
            ],

            // 5. Acceptée
            [
                'patient_nom'        => 'NDONG Etienne',
                'patient_telephone'  => '+237678123456',
                'patient_age'        => 81,
                'adresse'            => 'Quartier Messa, à côté du marché central',
                'quartier'           => 'Messa',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8487,
                'longitude'          => 11.5046,
                'symptomes'          => 'Pansement à refaire (plaie chronique pied diabétique). Suivi régulier.',
                'duree_symptomes'    => 'Chronique',
                'urgence'            => 'faible',
                'type'               => 'visite',
                'statut'             => 'acceptee',
                'assigned_to'        => $paul,
                'notes_infirmier'    => 'Patient connu, programmer pour demain matin.',
                'date_souhaitee'    => today()->addDay()->toDateString(),
                'heure_souhaitee'   => '09:30',
                'demandeur_nom'      => null,
                'demandeur_relation' => null,
                'created_offset'     => -480,
            ],

            // 6. Terminée
            [
                'patient_nom'        => 'EYENGA Claire',
                'patient_telephone'  => '+237696543210',
                'patient_age'        => 28,
                'adresse'            => 'Quartier Mvog-Mbi, rue 1.404, maison avec antenne parabolique',
                'quartier'           => 'Mvog-Mbi',
                'ville'              => 'Yaoundé',
                'latitude'           => 3.8328,
                'longitude'          => 11.5128,
                'symptomes'          => 'Vertiges, nausées matinales. Suspicion grossesse.',
                'duree_symptomes'    => '1 semaine',
                'urgence'            => 'moyenne',
                'type'               => 'conseil_tel',
                'statut'             => 'terminee',
                'assigned_to'        => $paul,
                'notes_infirmier'    => 'Conseil téléphonique donné. Test grossesse positif confirmé. Orientée vers gynéco.',
                'demandeur_nom'      => null,
                'demandeur_relation' => null,
                'created_offset'     => -1440,  // 1 jour
            ],

            // 7. Refusée
            [
                'patient_nom'        => 'TCHATCHOUA Marc',
                'patient_telephone'  => '+237699234123',
                'patient_age'        => 42,
                'adresse'            => 'Douala - Bonanjo (hors zone)',
                'quartier'           => 'Bonanjo',
                'ville'              => 'Douala',
                'symptomes'          => 'Douleurs dorsales chroniques.',
                'duree_symptomes'    => '1 mois',
                'urgence'            => 'faible',
                'type'               => 'visite',
                'statut'             => 'refusee',
                'assigned_to'        => $paul,
                'raison_refus'       => 'Hors zone de couverture (Douala). Orientation vers HAD Douala recommandée.',
                'demandeur_nom'      => null,
                'demandeur_relation' => null,
                'created_offset'     => -2880,  // 2 jours
            ],
        ];

        foreach ($demandes as $d) {
            $offset = $d['created_offset'];
            unset($d['created_offset']);
            DB::table('demandes_visite')->insert(array_merge($d, [
                'created_at' => now()->subMinutes(abs($offset)),
                'updated_at' => now()->subMinutes(abs($offset)),
            ]));
        }

        $this->command->info('  ✅ ' . count($demandes) . ' demandes de visite créées');
        $this->command->info('  📊 En attente: 3 (1 critique + 1 urgente + 1 moyenne)');
        $this->command->info('  📋 Acceptées: 2');
        $this->command->info('  ✓ Terminées: 1');
        $this->command->info('  ✗ Refusées: 1');
    }
}
