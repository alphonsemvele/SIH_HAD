<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConversationsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('=== ConversationsDemoSeeder ===');

        DB::transaction(function () {
            // Nettoyer les anciens
            DB::table('messages')->delete();
            DB::table('conversation_participants')->delete();
            DB::table('conversations')->delete();

            $paul    = DB::table('users')->where('email', 'infirmier@sih.local')->value('id');
            $sophie  = DB::table('users')->where('email', 'infirmier2@sih.local')->value('id');
            $medecin = DB::table('users')->where('email', 'medecin@sih.local')->value('id');
            $admin   = DB::table('users')->where('email', 'admin@sih.local')->value('id');

            if (!$paul || !$medecin) {
                $this->command->warn('Users démo manquants');
                return;
            }

            // ─── Conversation 1 : Paul ↔ Dr NDIAYE (à propos de Mme KAMGA) ───
            $conv1 = DB::table('conversations')->insertGetId([
                'title' => 'Mme KAMGA - Suivi AVC',
                'created_by' => $paul,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subMinutes(15),
            ]);

            DB::table('conversation_participants')->insert([
                ['conversation_id' => $conv1, 'user_id' => $paul,    'joined_at' => now()->subDays(2)],
                ['conversation_id' => $conv1, 'user_id' => $medecin, 'joined_at' => now()->subDays(2)],
            ]);

            $messages1 = [
                [$paul,    'Bonjour Docteur, comment ça se passe pour Mme KAMGA aujourd\'hui ?', now()->subDays(2)->setHour(8)->setMinute(15)],
                [$medecin, 'Bonjour Paul. Sa tension reste élevée. Vérifiez à 15h.', now()->subDays(2)->setHour(8)->setMinute(20)],
                [$paul,    'D\'accord, je passe vers 15h30.', now()->subDays(2)->setHour(8)->setMinute(22)],
                [$paul,    'Tension 145/85 à l\'instant. Patient stable, score Glasgow 15.', now()->subDays(2)->setHour(15)->setMinute(45)],
                [$medecin, 'Parfait, on continue le protocole. Mêmes constantes demain.', now()->subDays(2)->setHour(16)->setMinute(0)],
                [$paul,    'Visite faite ce matin 8h40, RAS. PDF preuve générée.', now()->subMinutes(45)],
                [$medecin, 'Reçu. Pouvez-vous augmenter le Furosémide à 60mg ?', now()->subMinutes(15)],
            ];

            foreach ($messages1 as $i => [$senderId, $content, $createdAt]) {
                DB::table('messages')->insert([
                    'conversation_id' => $conv1,
                    'sender_id' => $senderId,
                    'content' => $content,
                    'type' => 'text',
                    'read_at' => $i < count($messages1) - 1 ? $createdAt->copy()->addMinutes(2) : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }

            // ─── Conversation 2 : Paul ↔ Sophie (échange entre infirmiers) ───
            if ($sophie) {
                $conv2 = DB::table('conversations')->insertGetId([
                    'title' => 'Tournée Bastos - Coordination',
                    'created_by' => $sophie,
                    'created_at' => now()->subDay(),
                    'updated_at' => now()->subHours(2),
                ]);

                DB::table('conversation_participants')->insert([
                    ['conversation_id' => $conv2, 'user_id' => $paul,   'joined_at' => now()->subDay()],
                    ['conversation_id' => $conv2, 'user_id' => $sophie, 'joined_at' => now()->subDay()],
                ]);

                $messages2 = [
                    [$sophie, 'Salut Paul, je termine ma tournée d\'hier soir. RAS sur tous les patients.', now()->subDay()->setHour(18)->setMinute(0)],
                    [$paul,   'Merci Sophie ! Tu as pu voir M. NGUEMA pour le pansement ?', now()->subDay()->setHour(18)->setMinute(15)],
                    [$sophie, 'Oui, plaie en bon voie de cicatrisation. Photo dans le dossier.', now()->subDay()->setHour(18)->setMinute(30)],
                    [$paul,   'Super, je prends le relais ce matin 9h30.', now()->subHours(2)->subMinutes(30)],
                    [$sophie, 'Bonne tournée 👍', now()->subHours(2)],
                ];

                foreach ($messages2 as [$senderId, $content, $createdAt]) {
                    DB::table('messages')->insert([
                        'conversation_id' => $conv2,
                        'sender_id' => $senderId,
                        'content' => $content,
                        'type' => 'text',
                        'read_at' => $createdAt->copy()->addMinutes(5),
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);
                }
            }

            // ─── Conversation 3 : Paul ↔ Dr NDIAYE (récente, message non lu) ───
            $conv3 = DB::table('conversations')->insertGetId([
                'title' => 'M. BERNARD - Chimio domicile',
                'created_by' => $medecin,
                'created_at' => now()->subHour(),
                'updated_at' => now()->subMinutes(5),
            ]);

            DB::table('conversation_participants')->insert([
                ['conversation_id' => $conv3, 'user_id' => $paul,    'joined_at' => now()->subHour()],
                ['conversation_id' => $conv3, 'user_id' => $medecin, 'joined_at' => now()->subHour()],
            ]);

            DB::table('messages')->insert([
                [
                    'conversation_id' => $conv3,
                    'sender_id' => $medecin,
                    'content' => 'Paul, M. BERNARD reçoit sa chimio à 11h30. Surveillance étroite des constantes. Appelez-moi si nausées.',
                    'type' => 'text',
                    'read_at' => null, // NON LU pour démo badge rouge
                    'created_at' => now()->subMinutes(5),
                    'updated_at' => now()->subMinutes(5),
                ],
            ]);

            $this->command->info('');
            $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            $this->command->info('✅ ConversationsDemoSeeder terminé');
            $this->command->info('  💬 3 conversations créées');
            $this->command->info('  📩 13 messages au total (1 non lu)');
            $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    }
}
