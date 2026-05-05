<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mssante_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compte_id')->constrained('mssante_comptes')->comment('ID compte MSSanté');
            $table->enum('sens', ['entrant', 'sortant'])->comment('Sens du message');
            $table->string('message_id')->unique()->comment('Message-ID RFC');
            $table->string('expediteur')->comment('Expéditeur');
            $table->json('destinataires')->comment('Destinataires');
            $table->json('cc')->nullable()->comment('Copie cachée');
            $table->string('sujet')->comment('Sujet');
            $table->text('corps_texte')->nullable()->comment('Corps texte');
            $table->text('corps_html')->nullable()->comment('Corps HTML');
            $table->foreignId('patient_id')->nullable()->comment('ID patient lié');
            $table->string('patient_ins_matricule', 16)->nullable()->comment('Matricule INS patient');
            $table->enum('statut', ['brouillon', 'envoye', 'recu', 'lu', 'echoue'])->default('brouillon')->comment('Statut');
            $table->json('metadonnees')->nullable()->comment('Métadonnées');
            $table->timestamp('envoye_a')->nullable()->comment('Date d\'envoi');
            $table->timestamp('recu_a')->nullable()->comment('Date de réception');
            $table->timestamp('lu_a')->nullable()->comment('Date de lecture');
            $table->text('erreur')->nullable()->comment('Message d\'erreur');
            $table->timestamps();
            
            // Indexes
            $table->index(['compte_id', 'created_at']);
            $table->index(['patient_id', 'created_at']);
            $table->index(['statut', 'created_at']);
            $table->index('patient_ins_matricule');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mssante_messages');
    }
};
