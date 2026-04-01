<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visite_hads', function (Blueprint $table) {
            $table->id();

            // ── Relations ─────────────────────────────────────────────
            $table->foreignId('tournee_id')
                  ->constrained('tournees')
                  ->cascadeOnDelete();

            $table->foreignId('patient_id')
                  ->constrained('patients')
                  ->restrictOnDelete();

            // ── Informations de la visite ─────────────────────────────
            $table->unsignedSmallInteger('ordre')->default(0);          // ordre de passage dans la tournée

            $table->enum('priorite', ['normal', 'surveillance', 'critique'])
                  ->default('normal');

            $table->string('chambre', 20)->nullable();                  // copie dénormalisée pour éviter un JOIN
            $table->string('lit', 20)->nullable();
            $table->string('diagnostic')->nullable();
            $table->unsignedSmallInteger('jours_hospitalisation')->default(0);

            // ── Résultat de la visite ─────────────────────────────────
            $table->timestamp('visite_at')->nullable();                 // null = pas encore visité

            $table->text('observations')->nullable();                   // observations du soignant lors de cette visite
            $table->text('notes_soignant')->nullable();                 // notes internes (non partagées avec le dossier)

            // ── Constantes vitales relevées lors de la visite ─────────
            $table->string('temperature', 10)->nullable();              // ex : "36.8°C"
            $table->string('tension', 20)->nullable();                  // ex : "130/80"
            $table->string('pouls', 20)->nullable();                    // ex : "72 bpm"
            $table->string('saturation', 10)->nullable();               // ex : "98%"

            $table->timestamps();

            // ── Index ─────────────────────────────────────────────────
            $table->index(['tournee_id', 'ordre']);                     // liste ordonnée d'une tournée
            $table->index(['tournee_id', 'visite_at']);                 // comptage des visités / non-visités
            $table->index(['patient_id', 'visite_at']);                 // historique des visites par patient
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visite_hads');
    }
};