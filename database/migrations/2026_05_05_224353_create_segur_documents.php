<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('segur_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->comment('ID patient');
            $table->string('type_loinc', 16)->comment('Type LOINC');
            $table->string('libelle')->comment('Libellé du document');
            $table->foreignId('auteur_id')->constrained('users')->comment('ID utilisateur auteur');
            $table->string('auteur_rpps', 11)->nullable()->comment('RPPS auteur');
            $table->date('date_document')->comment('Date du document');
            $table->enum('statut', ['brouillon', 'valide', 'depose', 'echec_depot'])->default('brouillon')->comment('Statut');
            $table->string('xml_cdar2_chemin')->nullable()->comment('Chemin XML CDAR2');
            $table->string('pdf_chemin')->nullable()->comment('Chemin PDF');
            $table->string('xml_hash_sha256', 64)->nullable()->comment('Hash XML');
            $table->json('metadonnees_xds')->nullable()->comment('Métadonnées XDS');
            $table->string('source_type')->nullable()->comment('Type morph source');
            $table->unsignedBigInteger('source_id')->nullable()->comment('ID morph source');
            $table->timestamps();
            
            // Indexes
            $table->index(['patient_id', 'type_loinc']);
            $table->index(['statut', 'created_at']);
            $table->index(['source_type', 'source_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('segur_documents');
    }
};
