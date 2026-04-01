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

        Schema::create('pointages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->date('date');
            $table->dateTime('heure_arrivee')->nullable();
            $table->dateTime('heure_depart')->nullable();
            $table->enum('type', ["normal","garde","astreinte"])->default('normal');
            $table->enum('equipe', ["matin","apres_midi","nuit"])->nullable();
            $table->enum('source', ["manuel","biometrique","mobile"])->default('manuel');
            $table->string('localisation', 255)->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["present","absent","retard","conge","maladie"])->default('present');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pointages');
    }
};
