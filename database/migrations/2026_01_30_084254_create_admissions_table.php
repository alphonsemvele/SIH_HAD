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

        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('service_id')->constrained();
            $table->foreignId('lit_id')->nullable()->constrained();
            $table->foreignId('medecin_id')->constrained('users');
            $table->enum('type', ["urgence","programmee","transfert"])->default('programmee');
            $table->text('motif');
            $table->text('diagnostic_entree')->nullable();
            $table->text('diagnostic_sortie')->nullable();
            $table->dateTime('date_admission');
            $table->dateTime('date_sortie')->nullable();
            $table->enum('mode_sortie', ["guerison","amelioration","transfert","evasion","deces","contre_avis"])->nullable();
            $table->string('accompagnant_nom', 100)->nullable();
            $table->string('accompagnant_telephone', 20)->nullable();
            $table->string('accompagnant_lien', 50)->nullable();
            $table->text('notes')->nullable();
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
        Schema::dropIfExists('admissions');
    }
};
