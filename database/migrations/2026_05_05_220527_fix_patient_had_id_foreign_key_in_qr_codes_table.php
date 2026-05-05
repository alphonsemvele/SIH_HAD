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
        Schema::table('qr_codes', function (Blueprint $table) {
            // Supprimer la contrainte foreign key existante
            $table->dropForeign(['patient_had_id']);
            
            // Recréer la contrainte vers la table patients
            $table->foreign('patient_had_id')
                  ->references('id')
                  ->on('patients')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('qr_codes', function (Blueprint $table) {
            // Supprimer la contrainte vers patients
            $table->dropForeign(['patient_had_id']);
            
            // Recréer la contrainte vers patient_hads
            $table->foreign('patient_had_id')
                  ->references('id')
                  ->on('patient_hads')
                  ->onDelete('cascade');
        });
    }
};
