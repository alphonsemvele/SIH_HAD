<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mssante_comptes', function (Blueprint $table) {
            $table->id();
            $table->string('adresse')->unique()->comment('Adresse MSSanté');
            $table->enum('type', ['organisationnelle', 'nominative'])->comment('Type de compte');
            $table->foreignId('user_id')->nullable()->comment('ID utilisateur lié');
            $table->string('operateur', 64)->comment('Opérateur');
            $table->json('config_smtp')->nullable()->comment('Configuration SMTP (chiffrée)');
            $table->json('config_imap')->nullable()->comment('Configuration IMAP');
            $table->boolean('actif')->default(true)->comment('Compte actif');
            $table->timestamps();
            
            // Indexes
            $table->index(['type', 'actif']);
            $table->index(['user_id', 'actif']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mssante_comptes');
    }
};
