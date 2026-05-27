<?php

namespace Database\Seeders;

use App\Models\ActeRealise;
use App\Models\Patient;
use App\Models\PatientHad;
use App\Models\PreuveVisite;
use App\Models\QrCode;
use App\Models\QrScan;
use App\Models\SignatureVisite;
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
        $this->command->info('=== DemoSeeder Mixte FR+CM (riche) ===');

        DB::transaction(function () {
            $this->command->info('🧹 Nettoyage des données démo précédentes...');
            DB::table('preuves_visite')->delete();
            DB::table('signatures_visite')->delete();
            DB::table('photos_visite')->delete();
            DB::table('actes_realises')->delete();
            DB::table('qr_scans')->delete();
            DB::table('qr_codes')->delete();
            DB::table('visite_hads')->delete();
            DB::table('tournees')->delete();
            DB::table('patient_hads')->delete();
            DB::table('patients')->where('numero_dossier', 'like', 'DEMO%')->delete();

            // ─── 1. Service HAD ───────────────────────────────────────────────
            $serviceId = DB::table('services')->where('code', 'HAD')->value('id')
                ?? DB::table('services')->insertGetId([
                    'code' => 'HAD',
                    'nom' => 'Hospitalisation à Domicile',
                    'description' => 'Service HAD — démo Ségur',
                    'capacite_lits' => 0,
                    'actif' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

            // ─── 2. Soignants démo ────────────────────────────────────────────
            $medecinRefId = $this->ensureUser('medecin@sih.local', 'Dr. NDIAYE', 'Aminata');
            $infirmierId  = $this->ensureUser('infirmier@sih.local', 'TCHOUMI', 'Paul');
            $infirmier2Id = $this->ensureUser('infirmier2@sih.local', 'DUPONT', 'Sophie');

            // ─── 3. Patients (8 = 4 CM + 4 FR) ────────────────────────────────
            $patients = [
                // CAMEROUN — 4 patients hospitalisés/HAD/consultation
                [
                    'numero_dossier' => 'DEMO-CM-001',
                    'nom' => 'KAMGA', 'prenom' => 'Marie',
                    'date_naissance' => '1948-03-15', 'sexe' => 'F',
                    'telephone' => '+237699000001',
                    'adresse' => 'Quartier Bastos, Yaoundé',
                    'ville' => 'Yaoundé', 'quartier' => 'Bastos',
                    'nationalite' => 'Camerounaise',
                    'pathologie' => 'Hypertension sévère - retour à domicile post-AVC',
                    'allergies' => ['pénicilline'],
                    'antecedents_medicaux' => ['HTA depuis 2008', 'AVC ischémique 2024'],
                    'priorite' => 'critique',
                    'lat' => 3.8865, 'lng' => 11.5223,
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-CM-002',
                    'nom' => 'NGUEMA', 'prenom' => 'Joseph',
                    'date_naissance' => '1955-07-22', 'sexe' => 'M',
                    'telephone' => '+237699000002',
                    'adresse' => 'Rue 1.234, Mvog-Mbi, Yaoundé',
                    'ville' => 'Yaoundé', 'quartier' => 'Mvog-Mbi',
                    'nationalite' => 'Camerounaise',
                    'pathologie' => 'Diabète type 2 décompensé + ulcère diabétique pied droit',
                    'allergies' => [],
                    'antecedents_medicaux' => ['Diabète depuis 1998', 'Néphropathie diabétique'],
                    'priorite' => 'surveillance',
                    'lat' => 3.8480, 'lng' => 11.5021,
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-CM-003',
                    'nom' => 'FOUDA', 'prenom' => 'Bernadette',
                    'date_naissance' => '1962-11-30', 'sexe' => 'F',
                    'telephone' => '+237699000003',
                    'adresse' => 'Rue de la Paix, Etoa-Meki',
                    'ville' => 'Yaoundé', 'quartier' => 'Etoa-Meki',
                    'nationalite' => 'Camerounaise',
                    'pathologie' => 'Soins palliatifs — cancer du sein stade IV',
                    'allergies' => ['morphine (intolérance digestive)'],
                    'antecedents_medicaux' => ['Cancer du sein 2022', 'Métastases osseuses 2025'],
                    'priorite' => 'critique',
                    'lat' => 3.8642, 'lng' => 11.5174,
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-CM-004',
                    'nom' => 'ETONDE', 'prenom' => 'Jean-Paul',
                    'date_naissance' => '1980-04-12', 'sexe' => 'M',
                    'telephone' => '+237699000010',
                    'adresse' => 'Avenue Kennedy, Centre-ville',
                    'ville' => 'Yaoundé', 'quartier' => 'Centre',
                    'nationalite' => 'Camerounaise',
                    'pathologie' => 'Suivi post-opératoire — appendicectomie',
                    'allergies' => [],
                    'antecedents_medicaux' => [],
                    'priorite' => 'normal',
                    'lat' => 3.8721, 'lng' => 11.5187,
                    'has_had' => false, // pas en HAD, juste consultation
                ],

                // FRANCE — 4 patients HAD avec INS
                [
                    'numero_dossier' => 'DEMO-FR-001',
                    'nom' => 'BERNARD', 'prenom' => 'Pierre',
                    'date_naissance' => '1942-02-08', 'sexe' => 'M',
                    'telephone' => '+33699000004',
                    'adresse' => '12 rue Pasteur, 69003 Lyon',
                    'ville' => 'Lyon', 'quartier' => 'Part-Dieu',
                    'nationalite' => 'Française',
                    'pathologie' => 'Chimiothérapie à domicile — adénocarcinome stade II',
                    'allergies' => ['iode (produits de contraste)'],
                    'antecedents_medicaux' => ['Cancer prostate 2020', 'AVC mineur 2023'],
                    'priorite' => 'critique',
                    'ins_qualifie' => true,
                    'ins_matricule' => '1420269123456',
                    'ins_oid'       => '1.2.250.1.213.1.4.8',
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-FR-002',
                    'nom' => 'LEFEVRE', 'prenom' => 'Hélène',
                    'date_naissance' => '1958-09-19', 'sexe' => 'F',
                    'telephone' => '+33699000005',
                    'adresse' => '5 avenue Foch, 33000 Bordeaux',
                    'ville' => 'Bordeaux', 'quartier' => 'Centre',
                    'nationalite' => 'Française',
                    'pathologie' => 'Plaies chroniques diabétiques + neuropathie',
                    'allergies' => ['latex'],
                    'antecedents_medicaux' => ['Diabète type 1 depuis 1990', 'Rétinopathie diabétique'],
                    'priorite' => 'surveillance',
                    'ins_qualifie' => true,
                    'ins_matricule' => '2580933987654',
                    'ins_oid'       => '1.2.250.1.213.1.4.8',
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-FR-003',
                    'nom' => 'MARTIN', 'prenom' => 'Camille',
                    'date_naissance' => '1975-06-04', 'sexe' => 'F',
                    'telephone' => '+33699000020',
                    'adresse' => '34 boulevard Voltaire, 75011 Paris',
                    'ville' => 'Paris', 'quartier' => 'Voltaire',
                    'nationalite' => 'Française',
                    'pathologie' => 'Antibiothérapie IV à domicile — endocardite',
                    'allergies' => ['céphalosporines'],
                    'antecedents_medicaux' => ['Valvulopathie mitrale congénitale'],
                    'priorite' => 'critique',
                    'ins_qualifie' => true,
                    'ins_matricule' => '2750675111222',
                    'ins_oid'       => '1.2.250.1.213.1.4.8',
                    'has_had' => true,
                ],
                [
                    'numero_dossier' => 'DEMO-FR-004',
                    'nom' => 'ROUX', 'prenom' => 'Antoine',
                    'date_naissance' => '1990-12-25', 'sexe' => 'M',
                    'telephone' => '+33699000021',
                    'adresse' => '8 rue des Lilas, 31000 Toulouse',
                    'ville' => 'Toulouse', 'quartier' => 'Saint-Michel',
                    'nationalite' => 'Française',
                    'pathologie' => 'Suivi post-greffe rénale',
                    'allergies' => [],
                    'antecedents_medicaux' => ['Insuffisance rénale terminale', 'Greffe rénale 03/2026'],
                    'priorite' => 'normal',
                    'ins_qualifie' => false, // INS non encore qualifié
                    'has_had' => false,
                ],
            ];

            $patientIds = [];
            foreach ($patients as $p) {
                $insertData = [
                    'numero_dossier'       => $p['numero_dossier'],
                    'nom'                  => $p['nom'],
                    'prenom'               => $p['prenom'],
                    'date_naissance'       => $p['date_naissance'],
                    'sexe'                 => $p['sexe'],
                    'telephone'            => $p['telephone'],
                    'adresse'              => $p['adresse'],
                    'ville'                => $p['ville'],
                    'quartier'             => $p['quartier'] ?? null,
                    'nationalite'          => $p['nationalite'],
                    'allergies'            => json_encode($p['allergies'] ?? []),
                    'antecedents_medicaux' => json_encode($p['antecedents_medicaux'] ?? []),
                    'priorite'             => $p['priorite'] ?? 'normal',
                    'latitude'             => $p['lat'] ?? null,
                    'longitude'            => $p['lng'] ?? null,
                    'ins_qualifie'         => $p['ins_qualifie'] ?? false,
                    'ins_matricule'        => $p['ins_matricule'] ?? null,
                    'ins_oid'              => $p['ins_oid'] ?? null,
                    'ins_qualifie_at'      => isset($p['ins_qualifie']) && $p['ins_qualifie'] ? now()->subDays(rand(1, 60)) : null,
                    'statut'               => 'Consultation',
                    'created_at'           => now()->subDays(rand(30, 180)),
                    'updated_at'           => now()->subDays(rand(0, 5)),
                ];
                $patientIds[$p['numero_dossier']] = DB::table('patients')->insertGetId($insertData);
                $this->command->info("  + Patient {$p['nom']} {$p['prenom']} (ID {$patientIds[$p['numero_dossier']]})");

                // Ajoute le bloc suivant après la création de TOUS les patients, 
// avant la section "─── 4. Patients HAD"

// ─── 3bis. Créer un compte User patient pour les 2 premiers patients HAD ──
$patientsAvecCompte = ['DEMO-CM-001', 'DEMO-CM-002'];  // adapte selon tes patients démo
foreach ($patientsAvecCompte as $dossier) {
    if (!isset($patientIds[$dossier])) continue;

    $patient = collect($patients)->firstWhere('numero_dossier', $dossier);
    if (!$patient) continue;

    $email = strtolower(
        \Illuminate\Support\Str::slug($patient['prenom']) . '.' .
        \Illuminate\Support\Str::slug($patient['nom']) . '@patient.local'
    );

    DB::table('users')->updateOrInsert(
    ['email' => $email],
    [
        'name'              => $patient['prenom'] . ' ' . $patient['nom'],
        'password'          => bcrypt('patient123'),
        'fonction'          => 'patient',         // ← changé de 'role' à 'fonction'
        'patient_id'        => $patientIds[$dossier],
        'email_verified_at' => now(),
        'statut'            => 'actif',           // ← nécessaire à cause du CHECK statut
        'created_at'        => now(),
        'updated_at'        => now(),
    ]
);

    $this->command->info("  + Compte patient : {$email} / patient123");
}
            }

            // ─── 4. Patients HAD (6 sur 8) ────────────────────────────────────
            $hadInclusions = [];
            foreach ($patients as $p) {
                if (!$p['has_had']) continue;

                $hadId = DB::table('patient_hads')->insertGetId([
                    'patient_id'           => $patientIds[$p['numero_dossier']],
                    'medecin_referent_id'  => $medecinRefId,
                    'date_inclusion'       => now()->subDays(rand(5, 40))->toDateString(),
                    'motif_inclusion'      => $p['pathologie'],
                    'adresse_domicile'     => $p['adresse'],
                    'latitude'             => $p['lat'] ?? null,
                    'longitude'            => $p['lng'] ?? null,
                    'frequence_visites'    => $p['priorite'] === 'critique' ? 'quotidien' : '2_fois_semaine',
                    'protocole_soins'      => "Surveillance des constantes, soins spécifiques selon pathologie ({$p['pathologie']})",
                    'statut'               => 'actif',
                    'created_at'           => now()->subDays(rand(5, 40)),
                    'updated_at'           => now(),
                ]);
                $hadInclusions[$p['numero_dossier']] = $hadId;
            }

            // ─── 5. Tournée 1 — EN COURS (aujourd'hui matin, Paul TCHOUMI) ────
            $tourneeAujourdhui = DB::table('tournees')->insertGetId([
                'soignant_id'        => $infirmierId,
                'service_id'         => $serviceId,
                'date'               => today()->toDateString(),
                'heure_debut_prevue' => '08:00',
                'heure_fin_prevue'   => '13:00',
                'vehicule'           => 'Hilux CE-1234-Y',
                'type'               => 'complete',
                'statut'             => 'en_cours',
                'notes'              => 'Tournée matinée — secteur Bastos/Mvog-Mbi/Etoa-Meki',
                'created_at'         => today()->setTime(7, 30),
                'updated_at'         => now(),
            ]);

            // ─── 6. Tournée 2 — TERMINÉE hier (Sophie DUPONT) ─────────────────
            $tourneeHier = DB::table('tournees')->insertGetId([
                'soignant_id'        => $infirmier2Id,
                'service_id'         => $serviceId,
                'date'               => today()->subDay()->toDateString(),
                'heure_debut_prevue' => '14:00',
                'heure_fin_prevue'   => '18:00',
                'vehicule'           => 'Hilux CE-5678-Y',
                'type'               => 'complete',
                'statut'             => 'terminee',
                'notes'              => 'Tournée après-midi terminée hier — 3 visites validées',
                'created_at'         => today()->subDay()->setTime(13, 30),
                'updated_at'         => today()->subDay()->setTime(18, 5),
            ]);

            // ─── 7. Visites de la tournée d'aujourd'hui ───────────────────────
            $visitesAujourdhui = [
                // Patient, ordre, priorite, heure, déjà réalisée?, diagnostic
                ['DEMO-CM-001', 1, 'critique',     '08:30', true,  'AVC ischémique - surveillance neuro'],
                ['DEMO-CM-002', 2, 'surveillance', '09:30', true,  'Diabète + ulcère pied droit'],
                ['DEMO-CM-003', 3, 'critique',     '10:30', true,  'Soins palliatifs - antalgie + soins de bouche'],
                ['DEMO-FR-001', 4, 'critique',     '11:30', false, 'Chimiothérapie à domicile - perfusion en cours'],
                ['DEMO-FR-002', 5, 'surveillance', '12:00', false, 'Pansement plaies chroniques diabétiques'],
                ['DEMO-FR-003', 6, 'critique',     '12:30', false, 'Antibiothérapie IV - endocardite'],
            ];

            $visiteIds = [];
            foreach ($visitesAujourdhui as $i => $v) {
                $patientId = $patientIds[$v[0]];
                $visiteData = [
                    'tournee_id'            => $tourneeAujourdhui,
                    'patient_id'            => $patientId,
                    'ordre'                 => $v[1],
                    'priorite'              => $v[2],
                    'duree_prevue'          => 30,
                    'heure_prevue'          => today()->setTimeFromTimeString($v[3]),
                    'diagnostic'            => $v[5],
                    'jours_hospitalisation' => rand(3, 30),
                    'created_at'            => today()->setTime(7, 30),
                    'updated_at'            => now(),
                ];
                if ($v[4]) {
                    // Visite déjà réalisée
                    $visiteData['visite_at']    = today()->setTimeFromTimeString($v[3])->addMinutes(rand(0, 10));
                    $visiteData['observations'] = "Patient stable. Constantes correctes. Soins effectués selon protocole.";
                    $visiteData['temperature']  = number_format(36.5 + (rand(0, 18) / 10), 1);
                    $visiteData['tension']      = (120 + rand(-15, 30)) . '/' . (75 + rand(-10, 20));
                    $visiteData['pouls']        = (string)(70 + rand(-5, 25));
                    $visiteData['saturation']   = (string)(95 + rand(0, 4));
                }
                $visiteIds[$v[0]] = DB::table('visite_hads')->insertGetId($visiteData);
            }

            // ─── 8. Visites de la tournée d'hier (toutes terminées) ───────────
            $visitesHier = [
                ['DEMO-CM-001', 1, 'critique',     '14:30', 'Bilan AVC J+5'],
                ['DEMO-FR-002', 2, 'surveillance', '15:30', 'Pansement plaies'],
                ['DEMO-FR-001', 3, 'critique',     '16:30', 'Surveillance chimio J7'],
            ];
            foreach ($visitesHier as $v) {
                $patientId = $patientIds[$v[0]];
                DB::table('visite_hads')->insert([
                    'tournee_id'            => $tourneeHier,
                    'patient_id'            => $patientId,
                    'ordre'                 => $v[1],
                    'priorite'               => $v[2],
                    'duree_prevue'          => 30,
                    'heure_prevue'          => today()->subDay()->setTimeFromTimeString($v[3]),
                    'visite_at'             => today()->subDay()->setTimeFromTimeString($v[3])->addMinutes(rand(0, 8)),
                    'diagnostic'            => $v[4],
                    'jours_hospitalisation' => rand(5, 30),
                    'observations'          => "Visite réalisée hier. Patient stable.",
                    'temperature'           => number_format(36.5 + (rand(0, 18) / 10), 1),
                    'tension'               => (120 + rand(-15, 30)) . '/' . (75 + rand(-10, 20)),
                    'pouls'                 => (string)(70 + rand(-5, 25)),
                    'saturation'            => (string)(95 + rand(0, 4)),
                    'created_at'            => today()->subDay()->setTime(13, 30),
                    'updated_at'            => today()->subDay(),
                ]);
            }

            // ─── 9. Actes pour les visites réalisées ──────────────────────────
            $actesParPatient = [
                'DEMO-CM-001' => [
                    ['Surveillance neurologique post-AVC', 'Score Glasgow stable à 15. Pas de signe de récidive.', 'AAQM099'],
                    ['Mesure constantes vitales',          'TA 145/85, FC 78, T° 37.1°C',                          'AKQM005'],
                ],
                'DEMO-CM-002' => [
                    ['Pansement ulcère diabétique pied droit', 'Plaie en voie de cicatrisation. Pas de signe d\'infection.', 'JL051'],
                    ['Glycémie capillaire',                    'Glycémie 1.65 g/L à 9h30',                                  'AHQM005'],
                    ['Injection insuline',                      '20 UI Humalog selon protocole',                            'AHQM004'],
                ],
                'DEMO-CM-003' => [
                    ['Évaluation douleur EVA',         'EVA 3/10 - amélioration depuis hier',          'AAQM099'],
                    ['Soins de bouche',                'Bouche propre, hydratée',                       'JCQM003'],
                    ['Administration morphine SC',     'Morphine 5mg SC - tolérance correcte',          'AHQK002'],
                ],
            ];

            $infirmierForActe = $infirmierId;
            foreach ($actesParPatient as $numDossier => $actes) {
                if (!isset($visiteIds[$numDossier])) continue;
                $vid = $visiteIds[$numDossier];

                foreach ($actes as $i => $a) {
                    DB::table('actes_realises')->insert([
                        'visite_had_id'   => $vid,
                        'libelle'         => $a[0],
                        'observations'    => $a[1],
                        'code_ccam'       => $a[2] ?? null,
                        'non_prevu'       => false,
                        'realise_a'       => today()->setTime(8 + $i, 35 + $i * 2),
                        'intervenant_id'  => $infirmierForActe,
                        'created_at'      => today()->setTime(8 + $i, 35 + $i * 2),
                        'updated_at'      => today()->setTime(8 + $i, 35 + $i * 2),
                    ]);
                }
            }

            // ─── 10. QR Codes pour TOUTES les visites d'aujourd'hui (créneau actuel) ────
            $hmacKey = config('app.qr_signing_key', env('QR_SIGNING_KEY', 'dev-key-change-me'));

            // Récupérer le patient_had_id depuis la visite -> patient
            foreach ($visiteIds as $numDossier => $vid) {
                $patientId = $patientIds[$numDossier];
                $patientHadId = DB::table('patient_hads')->where('patient_id', $patientId)->value('id');
                if (!$patientHadId) {
                    // Pas de HAD → on crée un PatientHad minimal pour pouvoir scanner le QR
                    continue;
                }

                $uuid = (string) Str::uuid();
                // Payload court (limite VARCHAR 512)
                $shortPayload = "v={$vid}&u={$uuid}&t=" . time();
                $signature = substr(hash_hmac('sha256', $shortPayload, $hmacKey), 0, 32);

                DB::table('qr_codes')->insert([
                    'uuid'            => $uuid,
                    'visite_had_id'   => $vid,
                    'patient_had_id'  => $patientHadId,
                    'payload_signe'   => $shortPayload . '.' . $signature,
                    'creneau_debut'   => now()->subMinutes(30),
                    'creneau_fin'     => now()->addMinutes(120),
                    'statut'          => 'actif',
                    'genere_par_id'   => $infirmierId,
                    'created_at'      => now()->subHours(2),
                    'updated_at'      => now(),
                ]);
            }

            // ─── 11. Récap ────────────────────────────────────────────────────
            $this->command->info('');
            $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            $this->command->info('✅ DemoSeeder terminé !');
            $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            $this->command->info("👤 Patients      : " . count($patientIds) . " (4 CM + 4 FR)");
            $this->command->info("🏠 Patients HAD  : " . count($hadInclusions));
            $this->command->info("🚐 Tournées      : 2 (1 en cours + 1 terminée hier)");
            $this->command->info("👁️  Visites      : " . (count($visitesAujourdhui) + count($visitesHier)) . " (6 réalisées + 6 planifiées)");
            $this->command->info("📋 Actes         : " . array_sum(array_map('count', $actesParPatient)));
            $this->command->info("📱 QR codes      : " . count($visiteIds) . " (créneau actuel ±2h)");
            $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            $this->command->info('🔑 Comptes :');
            $this->command->info('   admin@sih.local      / admin123');
            $this->command->info('   medecin@sih.local    / demo123');
            $this->command->info('   infirmier@sih.local  / demo123  (Paul, tournée du jour)');
            $this->command->info('   infirmier2@sih.local / demo123  (Sophie, tournée hier)');
            $this->command->info('   marie.kamga@patient.local  / patient123  (compte patient)');
$this->command->info('   joseph.nguema@patient.local / patient123 (compte patient)');
        });
    }

    private function ensureUser(string $email, string $nom, string $prenom): int
    {
        return DB::table('users')->where('email', $email)->value('id')
            ?? DB::table('users')->insertGetId([
                'name'              => "$prenom $nom",
                'email'             => $email,
                'password'          => Hash::make('demo123'),
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
    }
}
