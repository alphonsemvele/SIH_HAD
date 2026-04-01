<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('patient_hads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('medecin_referent_id')->constrained('users');
            $table->date('date_inclusion');
            $table->date('date_sortie')->nullable();
            $table->text('motif_inclusion');
            $table->text('motif_sortie')->nullable();
            $table->text('adresse_domicile');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('personne_reference_nom', 100)->nullable();
            $table->string('personne_reference_telephone', 20)->nullable();
            $table->string('personne_reference_lien', 50)->nullable();
            $table->text('protocole_soins')->nullable();
            $table->enum('frequence_visites', ["quotidien","2_fois_semaine","hebdomadaire","bimensuel"])->default('hebdomadaire');
            $table->json('equipements_domicile')->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["actif","suspendu","termine"])->default('actif');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_hads');
    }
};
