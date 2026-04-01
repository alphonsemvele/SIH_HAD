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

        Schema::create('demande_conges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->enum('type', ["annuel","maladie","maternite","paternite","sans_solde","recuperation","formation"]);
            $table->date('date_debut');
            $table->date('date_fin');
            $table->unsignedInteger('nombre_jours');
            $table->text('motif')->nullable();
            $table->string('piece_jointe')->nullable();
            $table->foreignId('valideur_id')->nullable()->constrained('users');
            $table->dateTime('date_validation')->nullable();
            $table->text('commentaire_validation')->nullable();
            $table->enum('statut', ["en_attente","approuve","refuse","annule"])->default('en_attente');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demande_conges');
    }
};
