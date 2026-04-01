<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Journal d'audit de tous les changements de statut de lit.
     */
    public function up(): void
    {
        Schema::create('historique_lits', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lit_id')
                ->constrained('lits')
                ->cascadeOnDelete();

            $table->foreignId('service_id')
                ->constrained('services')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Occupation liée à cette action (optionnelle)
            $table->foreignId('occupation_id')
                ->nullable()
                ->constrained('occupation_rooms')
                ->nullOnDelete();

            $table->enum('ancien_statut', ['disponible', 'occupe', 'nettoyage', 'hors-service'])->nullable();
            $table->enum('nouveau_statut', ['disponible', 'occupe', 'nettoyage', 'hors-service']);

            $table->enum('action', [
                'admission',
                'sortie',
                'transfert_source',
                'transfert_destination',
                'nettoyage_debut',
                'nettoyage_fin',
                'mise_hors_service',
                'remise_en_service',
                'creation',
            ]);

            $table->foreignId('service_source_id')
                ->nullable()
                ->constrained('services')
                ->nullOnDelete();

            $table->foreignId('service_destination_id')
                ->nullable()
                ->constrained('services')
                ->nullOnDelete();

            $table->text('commentaire')->nullable();
            $table->timestamp('effectue_le')->useCurrent();

            $table->index(['lit_id', 'effectue_le']);
            $table->index(['service_id', 'effectue_le']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_lits');
    }
};