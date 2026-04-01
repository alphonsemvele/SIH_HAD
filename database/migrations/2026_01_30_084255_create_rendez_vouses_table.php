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

        Schema::create('rendez_vouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('medecin_id')->constrained('users');
            $table->foreignId('service_id')->nullable()->constrained();
            $table->dateTime('date_heure');
            $table->unsignedInteger('duree_minutes')->default(30);
            $table->enum('type', ["consultation","suivi","examen","chirurgie","vaccination"])->default('consultation');
            $table->text('motif')->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["planifie","confirme","en_attente","en_cours","termine","annule","absent"])->default('planifie');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rendez_vouses');
    }
};
