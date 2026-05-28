<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('insi_appels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->nullable()->comment('ID patient concerné');
            $table->foreignId('demandeur_id')->constrained('users')->comment('ID utilisateur ayant fait l\'appel');
            $table->enum('mode', ['vitale', 'traits'])->comment('Mode d\'appel INSi');
            $table->json('parametres_appel')->nullable()->comment('Paramètres de l\'appel');
            $table->enum('statut', ['succes', 'echec', 'multi_resultats', 'aucun_resultat'])->default('aucun_resultat')->comment('Statut de l\'appel');
            $table->json('reponse_brute')->nullable()->comment('Réponse brute retournée par INSi');
            $table->string('insi_relation_id')->nullable()->comment('ID de relation INSi');
            $table->integer('duree_ms')->nullable()->comment('Durée de l\'appel en millisecondes');
            $table->timestamps();
            
            // Indexes
            $table->index(['patient_id', 'created_at']);
            $table->index(['demandeur_id', 'created_at']);
            $table->index(['statut', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('insi_appels');
    }
};
