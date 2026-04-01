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

        Schema::create('acte_medicals', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20);
            $table->string('libelle', 255);
            $table->foreignId('consultation_id')->nullable()->constrained();
            $table->foreignId('admission_id')->nullable()->constrained();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('medecin_id')->constrained('users');
            $table->dateTime('date_acte');
            $table->text('description')->nullable();
            $table->text('resultat')->nullable();
            $table->unsignedInteger('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2)->default(0);
            $table->decimal('prix_total', 10, 2)->default(0);
            $table->enum('statut', ["planifie","en_cours","termine","annule"])->default('planifie');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acte_medicals');
    }
};
