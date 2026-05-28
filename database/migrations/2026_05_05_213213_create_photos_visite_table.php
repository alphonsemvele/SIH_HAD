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
        Schema::create('photos_visite', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visite_had_id')->constrained('visite_hads')->onDelete('cascade');
            $table->string('chemin');
            $table->string('hash_sha256', 64);
            $table->integer('taille_octets');
            $table->string('mime_type', 64);
            $table->json('exif')->nullable();
            $table->text('legende')->nullable();
            $table->foreignId('intervenant_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos_visite');
    }
};
