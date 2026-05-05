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
        Schema::create('signatures_visite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visite_had_id')->constrained('visite_hads')->onDelete('cascade');
            $table->enum('signataire_type', ['patient', 'aidant', 'refus']);
            $table->foreignId('aidant_id')->nullable()->constrained('users');
            $table->string('chemin_image_png')->nullable();
            $table->string('hash_sha256', 64)->nullable();
            $table->text('motif_refus')->nullable();
            $table->timestamp('signe_a');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signatures_visite');
    }
};
