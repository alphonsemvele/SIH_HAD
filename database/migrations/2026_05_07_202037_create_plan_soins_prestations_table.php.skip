<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plan_soins_prestations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_soins_id')->constrained('plans_soins')->onDelete('cascade')->comment('ID plan de soins');
            $table->foreignId('acte_medical_id')->nullable()->constrained('actes_medicaux')->comment('ID acte médical');
            $table->string('libelle')->comment('Libellé de la prestation');
            $table->enum('frequence_type', ['ponctuelle', 'quotidienne', 'hebdomadaire', 'personnalisee'])->comment('Type de fréquence');
            $table->json('frequence_detail')->nullable()->comment('Détails fréquence (jours, heures)');
            $table->integer('duree_min')->default(30)->comment('Durée en minutes');
            $table->json('intervenants_profils')->nullable()->comment('Profils des intervenants requis');
            $table->json('materiel_requis')->nullable()->comment('Matériel requis pour la prestation');
            $table->text('protocole')->nullable()->comment('Protocole à suivre');
            $table->date('date_debut')->comment('Date de début de la prestation');
            $table->date('date_fin')->comment('Date de fin de la prestation');
            $table->timestamps();
            
            // Indexes
            $table->index(['plan_soins_id', 'date_debut']);
            $table->index(['frequence_type']);
            $table->index(['acte_medical_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_soins_prestations');
    }
};
