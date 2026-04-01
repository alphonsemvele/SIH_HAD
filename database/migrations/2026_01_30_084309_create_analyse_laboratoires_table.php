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

        Schema::create('analyse_laboratoires', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('consultation_id')->nullable()->constrained();
            $table->foreignId('medecin_prescripteur_id')->constrained('users');
            $table->foreignId('technicien_id')->nullable()->constrained('users');
            $table->foreignId('biologiste_id')->nullable()->constrained('users');
            $table->foreignId('type_analyse_id')->constrained('type_analyses');
            $table->dateTime('date_prescription');
            $table->dateTime('date_prelevement')->nullable();
            $table->dateTime('date_resultat')->nullable();
            $table->json('resultat')->nullable();
            $table->text('interpretation')->nullable();
            $table->text('conclusion')->nullable();
            $table->text('commentaire_medecin')->nullable();
            $table->boolean('urgent')->default(false);
            $table->enum('statut', ["prescrit","preleve","en_cours","resultat_disponible","valide","annule"])->default('prescrit');
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
        Schema::dropIfExists('analyse_laboratoires');
    }
};
