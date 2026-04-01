<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossiers_medicaux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');

            $table->string('numero_dossier_medical', 20)->unique();
            $table->date('date_ouverture');

            // Champs JSON pour les listes
            $table->json('antecedents_medicaux')->nullable();
            $table->json('antecedents_chirurgicaux')->nullable();
            $table->json('antecedents_familiaux')->nullable();
            $table->json('allergies_confirmees')->nullable();
            $table->json('maladies_chroniques')->nullable();
            $table->json('traitements_en_cours')->nullable();

            // Champs simples
            $table->string('groupe_sanguin', 5)->nullable();     // ex: A+, O-, AB-
            $table->string('rhesus', 10)->nullable();            // ou enum('+', '-', 'inconnu')
            $table->unsignedInteger('taille_cm')->nullable();
            $table->unsignedInteger('poids_kg')->nullable();

            $table->text('notes_generales')->nullable();

            // Statut avec ENUM
            $table->enum('statut', ['actif', 'inactif', 'archive', 'transfere'])
                  ->default('actif');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossiers_medicaux');
    }
};