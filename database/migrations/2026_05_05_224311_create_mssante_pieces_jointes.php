<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mssante_pieces_jointes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('mssante_messages')->onDelete('cascade')->comment('ID message');
            $table->string('nom_fichier')->comment('Nom du fichier');
            $table->string('mime_type', 96)->comment('Type MIME');
            $table->bigInteger('taille_octets')->comment('Taille en octets');
            $table->string('chemin')->comment('Chemin de stockage');
            $table->string('hash_sha256', 64)->comment('Hash SHA256');
            $table->timestamps();
            
            // Indexes
            $table->index(['message_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mssante_pieces_jointes');
    }
};
