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
        Schema::create('qr_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('qr_code_id')->constrained('qr_codes')->onDelete('cascade');
            $table->foreignId('visite_had_id')->constrained('visite_hads')->onDelete('cascade');
            $table->foreignId('intervenant_id')->constrained('users');
            $table->timestamp('scanned_at');
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->integer('precision_m')->nullable();
            $table->enum('statut_scan', ['accepte', 'refuse_doublon', 'refuse_creneau', 'refuse_intervenant', 'refuse_patient'])->default('accepte');
            $table->text('motif_refus')->nullable();
            $table->json('device_info')->nullable();
            $table->timestamps();
            
            $table->index('scanned_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qr_scans');
    }
};
