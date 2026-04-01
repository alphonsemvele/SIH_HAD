<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Table centrale des occupations de lits.
     * - Occupation active  : date_sortie IS NULL, statut = 'active'
     * - Occupation passée  : date_sortie NOT NULL, statut IN ('terminee','transfere','annulee')
     *
     * Permet de savoir : qui occupe ce lit MAINTENANT et qui l'a occupé AVANT.
     */
    public function up(): void
    {
        Schema::create('occupation_rooms', function (Blueprint $table) {
            $table->id();

            // Quel lit est concerné
            $table->foreignId('lit_id')
                ->constrained('lits')
                ->restrictOnDelete();

            // Service (dénormalisé pour requêtes rapides)
            $table->foreignId('service_id')
                ->constrained('services')
                ->restrictOnDelete();

            // Patient occupant
            $table->foreignId('patient_id')
                ->constrained('patients')
                ->restrictOnDelete();

            // Personnel médical
            $table->foreignId('medecin_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('infirmier_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('cree_par')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Informations cliniques
            $table->string('diagnostic_principal')->nullable();
            $table->text('notes_admission')->nullable();
            $table->text('notes_sortie')->nullable();

            // Dates de séjour
            $table->dateTime('date_entree');
            $table->dateTime('date_sortie_prevue')->nullable();
            $table->dateTime('date_sortie')->nullable();

            // Statut de l'occupation
            $table->enum('statut', [
                'active',       // Patient actuellement dans ce lit
                'terminee',     // Patient sorti normalement
                'transfere',    // Patient transféré vers un autre lit/service
                'annulee',      // Réservation annulée avant entrée
            ])->default('active');

            // Motif de fin d'occupation
            $table->enum('motif_sortie', [
                'guerison',
                'transfert_interne',
                'transfert_externe',
                'sortie_contre_avis',
                'deces',
                'fuga',
                'autre',
            ])->nullable();

            // Si transfert vers un autre lit
            $table->foreignId('lit_destination_id')
                ->nullable()
                ->constrained('lits')
                ->nullOnDelete();

            $table->foreignId('service_destination_id')
                ->nullable()
                ->constrained('services')
                ->nullOnDelete();

            // Coût et durée
            $table->decimal('cout_sejour', 12, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Index pour requêtes fréquentes
            $table->index(['lit_id', 'statut']);
            $table->index(['patient_id', 'statut']);
            $table->index(['service_id', 'statut']);
            $table->index(['statut', 'date_sortie']);
            $table->index('date_entree');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('occupation_rooms');
    }
};