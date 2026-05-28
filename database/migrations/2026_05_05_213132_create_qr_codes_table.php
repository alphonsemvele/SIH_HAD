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
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('visite_had_id')->constrained('visite_hads')->onDelete('cascade');
            $table->foreignId('patient_had_id')->constrained('patient_hads')->onDelete('cascade');
            $table->unsignedBigInteger('plan_soins_prestation_id')->nullable()->index();
            $table->dateTime('creneau_debut');
            $table->dateTime('creneau_fin');
            $table->enum('statut', ['actif', 'utilise', 'expire', 'revoque'])->default('actif');
            $table->string('payload_signe', 512)->comment('JWS signé HMAC');
            $table->foreignId('genere_par_id')->constrained('users');
            $table->foreignId('remplace_qr_id')->nullable()->constrained('qr_codes')->onDelete('set null');
            $table->timestamp('utilise_a')->nullable();
            $table->timestamps();
            
            $table->index(['visite_had_id', 'statut']);
            $table->index(['creneau_debut', 'creneau_fin']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_codes');
    }
};
