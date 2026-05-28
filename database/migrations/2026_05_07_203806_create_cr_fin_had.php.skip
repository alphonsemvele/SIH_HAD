<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cr_fin_had', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_had_id')->constrained('patient_hads')->comment('ID patient HAD');
            $table->foreignId('redacteur_id')->constrained('users')->comment('ID utilisateur rédacteur');
            $table->date('date_fin_had')->comment('Date de fin HAD');
            $table->enum('motif_fin', ['guerison', 'transfert', 'deces', 'refus_patient', 'reorientation'])->comment('Motif de fin HAD');
            $table->text('synthese_clinique')->comment('Synthèse clinique');
            $table->text('actes_realises')->comment('Actes réalisés');
            $table->text('recommandations_suivi')->comment('Recommandations de suivi');
            $table->json('correspondants')->nullable()->comment('Liste des correspondants');
            $table->enum('statut', ['brouillon', 'valide', 'envoye'])->default('brouillon')->comment('Statut du CR');
            $table->string('document_pdf_path')->nullable()->comment('Chemin du document PDF');
            $table->string('document_xml_cdar2_path')->nullable()->comment('Chemin du document CDA-R2 XML');
            $table->timestamp('valide_a')->nullable()->comment('Date de validation');
            $table->timestamps();
            
            // Indexes
            $table->index(['patient_had_id']);
            $table->index(['redacteur_id']);
            $table->index(['statut']);
            $table->index(['date_fin_had']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cr_fin_had');
    }
};
