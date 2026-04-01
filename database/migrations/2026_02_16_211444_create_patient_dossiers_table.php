<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_dossiers', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('dossier_medical_id')
                  ->constrained('dossiers_medicaux')
                  ->onDelete('cascade');

            $table->foreignId('consultation_id')
                  ->nullable()
                  ->constrained('consultations')           // ← adapte si le nom de table est différent
                  ->onDelete('set null');

            $table->foreignId('medecin_id')
                  ->constrained('users')                   // ou 'medecins' selon ta structure
                  ->onDelete('restrict');

            // Référence unique
            $table->string('reference', 20)
                  ->unique()
                  ->nullable();

            // Type d'entrée / d'événement
            $table->string('type', 40)
                  ->default('consultation')
                  ->comment('consultation, hospitalisation, urgence, suivi post-op, contrôle, etc.');

            // Dates importantes
            $table->dateTime('date_entree')
                  ->useCurrent();

            $table->dateTime('date_sortie')
                  ->nullable();

            $table->date('date_prochain_rdv')
                  ->nullable();

            // Contenu clinique (textes longs)
            $table->text('motif')->nullable();
            $table->text('symptomes')->nullable();
            $table->text('examen_clinique')->nullable();
            $table->text('diagnostic')->nullable();
            $table->text('diagnostic_secondaire')->nullable();
            $table->text('recommandations')->nullable();

            // Données structurées → JSON
            $table->json('constantes_vitales')->nullable();     // TA, pouls, FR, SatO2, température, glycémie...
            $table->json('prescriptions')->nullable();          // liste de médicaments + posologie
            $table->json('examens_demandes')->nullable();
            $table->json('resultats_examens')->nullable();
            $table->json('actes_medicaux')->nullable();         // suture, pansement, injection, ECG...
            $table->json('traitement_administre')->nullable();  // ce qui a été fait sur place
            $table->json('documents')->nullable();              // tableau d'IDs ou chemins de fichiers

            // Notes libres
            $table->text('notes_medecin')->nullable();
            $table->text('notes_infirmier')->nullable();

            // Facturation / administratif
            $table->decimal('montant_total', 12, 2)
                  ->nullable()
                  ->default(0.00);

            $table->enum('statut_paiement', [
                'en_attente',
                'partiel',
                'paye',
                'annule',
                'rembourse'
            ])->default('en_attente');

            // Statut de l'entrée
            $table->enum('statut', [
                'brouillon',
                'en_cours',
                'termine',
                'annule',
                'transfere',
                'archive'
            ])->default('en_cours');

            // Tri / urgence (souvent utilisé aux urgences)
            $table->enum('niveau_urgence', [
                'non_urgent',
                'moyen',
                'urgent',
                'tres_urgent',
                'critique'
            ])->nullable();

            $table->timestamps();

            // Index fréquemment utilisés
            $table->index(['dossier_medical_id', 'date_entree']);
            $table->index('medecin_id');
            $table->index('date_entree');
            $table->index('type');
            $table->index('statut');
            $table->index('niveau_urgence');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_dossiers');
    }
};