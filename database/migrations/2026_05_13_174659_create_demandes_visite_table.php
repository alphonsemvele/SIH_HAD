<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_visite', function (Blueprint $table) {
            $table->id();

            // Patient
            $table->string('patient_nom');
            $table->string('patient_telephone', 20);
            $table->integer('patient_age')->nullable();

            // Localisation
            $table->text('adresse');
            $table->string('quartier', 100)->nullable();
            $table->string('ville', 100)->default('Yaoundé');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Demande médicale
            $table->text('symptomes');
            $table->string('duree_symptomes', 50)->nullable();

            // Type & urgence
            $table->enum('urgence', ['faible', 'moyenne', 'urgente', 'critique'])->default('moyenne');
            $table->enum('type', ['visite', 'conseil_tel', 'urgence'])->default('visite');

            // Statut
            $table->enum('statut', ['en_attente', 'acceptee', 'en_cours', 'terminee', 'refusee'])->default('en_attente');

            // Si demande faite par un tiers (famille, voisin)
            $table->string('demandeur_nom')->nullable();
            $table->string('demandeur_relation', 50)->nullable();

            // Traitement par soignant
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('visite_id')->nullable();  // FK ajoutée plus tard si table visite_hads existe
            $table->text('notes_infirmier')->nullable();
            $table->text('raison_refus')->nullable();

            // Planification souhaitée
            $table->date('date_souhaitee')->nullable();
            $table->time('heure_souhaitee')->nullable();

            $table->timestamps();

            // Index pour performance
            $table->index('statut');
            $table->index('urgence');
            $table->index('assigned_to');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_visite');
    }
};
