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

        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('medecin_id')->constrained('users');
            $table->foreignId('consultation_id')->nullable()->constrained();
            $table->foreignId('admission_id')->nullable()->constrained();
            $table->dateTime('date_prescription');
            $table->date('date_validite')->nullable();
            $table->text('instructions_generales')->nullable();
            $table->enum('statut', ["en_attente","partiellement_delivree","delivree","annulee"])->default('en_attente');
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
        Schema::dropIfExists('prescriptions');
    }
};
