<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournees', function (Blueprint $table) {
            $table->id();

            // ── Relations ─────────────────────────────────────────────
            $table->foreignId('soignant_id')
                  ->constrained('users')
                  ->restrictOnDelete();

            $table->foreignId('service_id')
                  ->constrained('services')
                  ->restrictOnDelete();

            // ── Planification ─────────────────────────────────────────
            $table->date('date');
            $table->time('heure_debut_prevue');
            $table->time('heure_fin_prevue')->nullable();

            // ── Réalisation ───────────────────────────────────────────
            $table->timestamp('heure_debut_effective')->nullable();
            $table->timestamp('heure_fin_effective')->nullable();

            // ── Infos HAD (optionnel) ─────────────────────────────────
            $table->string('vehicule', 30)->nullable();                 // immatriculation ou libellé
            $table->decimal('kilometres', 8, 2)->nullable();           // km parcourus

            // ── Caractéristiques ──────────────────────────────────────
            $table->enum('type', ['complete', 'cas_critiques', 'chambre_specifique'])
                  ->default('complete');

            $table->enum('statut', ['planifiee', 'en_cours', 'terminee', 'annulee'])
                  ->default('planifiee');

            $table->text('notes')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // ── Index ─────────────────────────────────────────────────
            $table->index(['date', 'statut']);                          // filtres principaux du dashboard
            $table->index(['soignant_id', 'date']);                     // tournées par soignant
            $table->index(['service_id', 'date']);                      // tournées par service
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournees');
    }
};