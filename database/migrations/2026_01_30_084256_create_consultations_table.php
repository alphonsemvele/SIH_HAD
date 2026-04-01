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

        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('medecin_id')->constrained('users');
            $table->foreignId('admission_id')->nullable()->constrained();
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vouses');
            $table->foreignId('service_id')->nullable()->constrained();
            $table->dateTime('date_consultation');
            $table->text('motif');
            $table->text('histoire_maladie')->nullable();
            $table->text('examen_clinique')->nullable();
            $table->json('hypotheses_diagnostiques')->nullable();
            $table->string('diagnostic_principal', 255)->nullable();
            $table->json('diagnostics_secondaires')->nullable();
            $table->text('conduite_a_tenir')->nullable();
            $table->text('recommandations')->nullable();
            $table->date('prochain_rdv')->nullable();
            $table->unsignedInteger('duree_minutes')->nullable();
            $table->enum('statut', ["en_cours","termine","annule"])->default('en_cours');
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
        Schema::dropIfExists('consultations');
    }
};
