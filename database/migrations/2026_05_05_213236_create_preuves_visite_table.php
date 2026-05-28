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
        Schema::create('preuves_visite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visite_had_id')->constrained('visite_hads')->unique();
            $table->foreignId('qr_scan_id')->constrained('qr_scans');
            $table->string('pdf_chemin');
            $table->string('pdf_hash_sha256', 64);
            $table->bigInteger('pdf_taille_octets');
            $table->json('contenu_synthese');
            $table->timestamp('genere_a');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preuves_visite');
    }
};
