<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mes_depots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('segur_document_id')->constrained('segur_documents')->comment('ID document Ségur');
            $table->enum('statut', ['en_file', 'en_cours', 'depose', 'echec', 'rejete_metadata'])->default('en_file')->comment('Statut du dépôt');
            $table->string('document_unique_id')->nullable()->comment('UUID XDS');
            $table->string('repository_unique_id')->nullable()->comment('UUID repository');
            $table->json('accuse_reception')->nullable()->comment('Accusé de réception');
            $table->json('metadata_envoyees')->nullable()->comment('Métadonnées envoyées');
            $table->text('erreur')->nullable()->comment('Message d\'erreur');
            $table->integer('tentatives')->default(0)->comment('Nombre de tentatives');
            $table->timestamp('depose_a')->nullable()->comment('Date de dépôt');
            $table->timestamps();
            
            // Indexes
            $table->index(['statut', 'created_at']);
            $table->index(['segur_document_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mes_depots');
    }
};
