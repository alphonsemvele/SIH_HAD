<?php

namespace Database\Seeders;

use App\Models\ActeRealise;
use App\Models\Patient;
use App\Models\PatientHad;
use App\Models\QrCode;
use App\Models\Tournee;
use App\Models\User;
use App\Models\VisiteHad;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== DemoSeeder Ségur ===');

        DB::transaction(function () {
            // 1. Service HAD
            $serviceId = DB::table('services')->where('code', 'HAD')->value('id')
                ?? DB::table('services')->insertGetId([
                    'code' => 'HAD',
                    'nom' => 'Hospitalisation à Domicile',
                    'description' => 'Service HAD - Yaoundé Centre',
                    'capacite_lits' => 0,
                    'actif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            $this->command->info("✅ Service HAD ID: $serviceId");

            // 2. Soignants supplémentaires (en plus de l'admin id=3)
            $medecinId = $this->ensureUser('medecin@sih.local', 'Dr. NDIAYE', 'Aminata');
            $infirmierId = $this->ensureUser('infirmier@sih.local', 'TCHOUMI', 'Paul');
            $this->command->info("✅ Users: medecin=$medecinId, infirmier=$infirmierId");

            // 3. Patients (5 - mix Cameroun + 2 français HAD)
            $patients = [
                ['KAMGA',     'Marie',    '1948-03-15', 'F', '+237699000001', 'Bastos, Yaoundé',         'CM', 'fr_FR'],
                ['NGUEMA',    'Joseph',   '1955-07-22', 'M', '+237699000002', 'Mvog-Mbi, Yaoundé',       'CM', null],
                ['FOUDA',     'Bernadette','1962-11-30','F', '+237699000003', 'Etoa-Meki, Yaoundé',      'CM', 'fr_FR'],
                ['BERNARD',   'Pierre',   '1942-02-08', 'M', '+33699000004',  '12 rue Pasteur, Lyon',    'FR', 'fr_FR'],
                ['LEFEVRE',   'Hélène',   '1958-09-19', 'F', '+33699000005',  '5 av. Foch, Bordeaux',    'FR', 'fr_FR'],
            ];

            $patientIds = [];
            foreach ($patients as $i => [$nom, $prenom, $dn, $sexe, $tel, $adr, $pays, $ins]) {
                $patientIds[] = Patient::create([
                    'numero_dossier' => 'DEMO-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'date_naissance' => $dn,
                    'sexe' => $sexe,
                    'telephone' => $tel,
                    'adresse' => $adr,
                    'ville' => str_contains($adr, 'Lyon') ? 'Lyon' : (str_contains($adr, 'Bordeaux') ? 'Bordeaux' : 'Yaoundé'),
                    'nationalite' => $pays === 'FR' ? 'Française' : 'Camerounaise',
                    'ins_qualifie' => $pays === 'FR',
                    'ins_matricule' => $pays === 'FR' ? '1' . random_int(40, 95) . random_int(1, 12) . random_int(10000, 99999) . random_int(100, 999) : null,
                    'ins_qualifie_at' => $pays === 'FR' ? now()->subDays(rand(5, 60)) : null,
                ])->id;
            }
            $this->command->info("✅ 5 patients créés (IDs: " . implode(',', $patientIds) . ")");

            // 4. Patients en HAD (3 sur les 5)
            $hadPatients = [
                ['patient_idx' => 0, 'motif' => 'Pansement complexe post-opératoire (chirurgie hanche)', 'freq' => 'quotidien'],
                ['patient_idx' => 3, 'motif' => 'Chimiothérapie à domicile - tumeur sein stade II', 'freq' => '2_fois_semaine'],
                ['patient_idx' => 4, 'motif' => 'Prise en charge plaies chroniques diabétiques', 'freq' => 'hebdomadaire'],
            ];

            $patientHadIds = [];
            foreach ($hadPatients as $had) {
                $patientHadIds[] = PatientHad::create([
                    'patient_id' => $patientIds[$had['patient_idx']],
                    'medecin_referent_id' => $medecinId,
                    'date_inclusion' => now()->subDays(rand(5, 30))->toDateString(),
                    'motif_inclusion' => $had['motif'],
                    'adresse_domicile' => $patients[$had['patient_idx']][5],
                    'frequence_visites' => $had['freq'],
                    'statut' => 'actif',
                    'protocole_soins' => "Surveillance constantes vitales\nRéfection pansement aseptique\nÉvaluation douleur (EVA)\nObservation cicatrisation",
                    'personne_reference_nom' => 'Famille proche',
                    'personne_reference_telephone' => '+237699999999',
                    'personne_reference_lien' => 'Conjoint',
                ])->id;
            }
            $this->command->info("✅ 3 patients en HAD (IDs: " . implode(',', $patientHadIds) . ")");

            // 5. Tournée du jour - infirmier Paul
            $tourneeId = Tournee::create([
                'soignant_id' => $infirmierId,
                'service_id' => $serviceId,
                'date' => now()->toDateString(),
                'heure_debut_prevue' => '08:00:00',
                'heure_fin_prevue' => '13:00:00',
                'type' => 'complete',
                'statut' => 'en_cours',
                'vehicule' => 'Hilux CE-1234-Y',
            ])->id;
            $this->command->info("✅ Tournée du jour ID: $tourneeId");

            // 6. 10 visites planifiées sur la tournée (2 par patient HAD, sauf un avec 4)
            $visitePlan = [
                ['patient_idx' => 0, 'h' => '08:30', 'priorite' => 'normal'],
                ['patient_idx' => 0, 'h' => '15:00', 'priorite' => 'normal'],  // 2e visite jour pour patient 0
                ['patient_idx' => 3, 'h' => '09:30', 'priorite' => 'surveillance'],
                ['patient_idx' => 4, 'h' => '10:30', 'priorite' => 'normal'],
                ['patient_idx' => 0, 'h' => '11:30', 'priorite' => 'normal'],  // visite supplémentaire
                ['patient_idx' => 3, 'h' => '12:00', 'priorite' => 'critique'],
                ['patient_idx' => 4, 'h' => '13:30', 'priorite' => 'normal'],
                ['patient_idx' => 0, 'h' => '14:30', 'priorite' => 'normal'],
                ['patient_idx' => 3, 'h' => '16:00', 'priorite' => 'normal'],
                ['patient_idx' => 4, 'h' => '17:00', 'priorite' => 'normal'],
            ];

            $visiteIds = [];
            foreach ($visitePlan as $i => $v) {
                $visite = VisiteHad::create([
                    'tournee_id' => $tourneeId,
                    'patient_id' => $patientIds[$v['patient_idx']],
                    'ordre' => $i + 1,
                    'priorite' => $v['priorite'],
                    'jours_hospitalisation' => rand(2, 25),
                    'duree_prevue' => $v['priorite'] === 'critique' ? 60 : 30,
                    'heure_prevue' => Carbon::parse(now()->toDateString() . ' ' . $v['h'] . ':00'),
                    'diagnostic' => $hadPatients[array_search($v['patient_idx'], array_column($hadPatients, 'patient_idx'))]['motif'],
                ]);
                $visiteIds[] = $visite->id;
            }
            $this->command->info("✅ 10 visites planifiées (IDs: " . implode(',', $visiteIds) . ")");

            // 7. Première visite déjà réalisée (pour démo)
            $firstVisite = VisiteHad::find($visiteIds[0]);
            $firstVisite->update([
                'visite_at' => now()->subHours(2),
                'temperature' => '37.1',
                'tension' => '128/82',
                'pouls' => '76',
                'saturation' => '97',
                'observations' => 'Patient calme, plaie en bonne évolution, pas d\'écoulement. Antalgique pris ce matin.',
                'notes_soignant' => 'Surveiller demain: rougeur légère pourtour cicatrice',
            ]);

            ActeRealise::create([
                'visite_had_id' => $firstVisite->id,
                'libelle' => 'Pansement complexe',
                'code_ccam' => 'AKQP002',
                'observations' => 'Réfection pansement avec antiseptique, compresses stériles. Plaie de 4cm cicatrise correctement.',
                'non_prevu' => false,
                'intervenant_id' => $infirmierId,
                'realise_a' => now()->subHours(2),
            ]);

            ActeRealise::create([
                'visite_had_id' => $firstVisite->id,
                'libelle' => 'Surveillance constantes',
                'code_ccam' => null,
                'observations' => 'TA, FC, T°, SpO2 dans les normes',
                'non_prevu' => false,
                'intervenant_id' => $infirmierId,
                'realise_a' => now()->subHours(2),
            ]);

            $this->command->info("✅ Visite 1 marquée comme réalisée + 2 actes");

            // 8. QR codes pour les 5 prochaines visites (pour démo scan mobile)
            $signingKey = config('services.qr.signing_key');
            for ($i = 1; $i <= 5; $i++) {
                $vId = $visiteIds[$i] ?? null;
                if (!$vId) continue;

                $v = VisiteHad::find($vId);
                $uuid = (string) Str::uuid7();
                $payload = [
                    'uuid' => $uuid,
                    'v' => $v->id,
                    'p' => $v->patient_id,
                    'd' => $v->heure_prevue?->toIso8601String(),
                ];
                $signature = hash_hmac('sha256', json_encode($payload), $signingKey);

                QrCode::create([
                    'uuid' => $uuid,
                    'visite_had_id' => $v->id,
                    'patient_had_id' => $v->patient_id,
                    'creneau_debut' => $v->heure_prevue,
                    'creneau_fin' => $v->heure_prevue->copy()->addMinutes($v->duree_prevue ?? 30),
                    'statut' => 'actif',
                    'payload_signe' => $signature,
                    'genere_par_id' => $medecinId,
                ]);
            }
            $this->command->info("✅ 5 QR codes pré-générés");
        });

        $this->command->info('');
        $this->command->info('🎉 DemoSeeder terminé');
        $this->command->info('');
        $this->command->info('=== Identifiants démo ===');
        $this->command->info('  Admin       : admin@sih.local / admin123');
        $this->command->info('  Médecin     : medecin@sih.local / demo123');
        $this->command->info('  Infirmier   : infirmier@sih.local / demo123');
        $this->command->info('');
        $this->command->info('=== Token API admin ===');
        $this->command->info('  1|nAAkbcpcVTjA3ZBRhZQNkI2j8i5yXUQzcoeuuAs4d143b421');
    }

    private function ensureUser(string $email, string $nom, string $prenom): int
    {
        $existing = User::where('email', $email)->first();
        if ($existing) return $existing->id;

        // Insert direct DB pour bypasser les soucis fillable nom/prenom vs name
        return DB::table('users')->insertGetId([
            'name' => "$prenom $nom",
            'email' => $email,
            'password' => Hash::make('demo123'),
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
