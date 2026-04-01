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

        Schema::create('examen_imageries', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('consultation_id')->nullable()->constrained();
            $table->foreignId('medecin_prescripteur_id')->constrained('users');
            $table->foreignId('radiologue_id')->nullable()->constrained('users');
            $table->foreignId('manipulateur_id')->nullable()->constrained('users');
            $table->foreignId('type_examen_id')->constrained('type_examen_imageries');
            $table->dateTime('date_prescription');
            $table->dateTime('date_examen')->nullable();
            $table->dateTime('date_resultat')->nullable();
            $table->text('indication_clinique')->nullable();
            $table->text('technique')->nullable();
            $table->text('resultat')->nullable();
            $table->text('conclusion')->nullable();
            $table->json('images_path')->nullable();
            $table->boolean('urgent')->default(false);
            $table->enum('statut', ["prescrit","planifie","en_cours","resultat_disponible","valide","annule"])->default('prescrit');
            $table->foreignId('type_examen_imagerie_id');
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
        Schema::dropIfExists('examen_imageries');
    }
};
