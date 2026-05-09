<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visite_hads', function (Blueprint $table) {
            // Ajouter les colonnes manquantes pour le plan de soins
            $table->foreignId('patient_had_id')->nullable()->after('patient_id')->comment('ID patient HAD pour plan de soins');
            $table->foreignId('plan_soins_prestation_id')->nullable()->after('patient_had_id')->comment('ID prestation du plan de soins');
            $table->dateTime('date_visite')->nullable()->after('visite_at')->comment('Date et heure de la visite');
            $table->string('statut')->default('planifiee')->after('date_visite')->comment('Statut de la visite');
            $table->foreignId('intervenant_id')->nullable()->after('statut')->comment('ID intervenant');
            $table->string('motif')->nullable()->after('intervenant_id')->comment('Motif de la visite');
            
            // Mettre à jour les colonnes existantes
            $table->dateTime('heure_prevue')->nullable()->change()->comment('Heure prévue pour la visite');
            $table->integer('duree_prevue_min')->default(30)->change()->comment('Durée prévue en minutes');
            
            // Indexes
            $table->index(['patient_had_id', 'date_visite']);
            $table->index(['plan_soins_prestation_id']);
            $table->index(['statut']);
            $table->index(['intervenant_id']);
            
            // Foreign keys
            $table->foreign('patient_had_id')->references('id')->on('patient_hads')->onDelete('set null');
            $table->foreign('plan_soins_prestation_id')->references('id')->on('plan_soins_prestations')->onDelete('set null');
            $table->foreign('intervenant_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('visite_hads', function (Blueprint $table) {
            // Supprimer les foreign keys
            $table->dropForeign(['patient_had_id']);
            $table->dropForeign(['plan_soins_prestation_id']);
            $table->dropForeign(['intervenant_id']);
            
            // Supprimer les colonnes ajoutées
            $table->dropColumn(['patient_had_id', 'plan_soins_prestation_id', 'date_visite', 'statut', 'intervenant_id', 'motif']);
            
            // Restaurer les colonnes originales
            $table->dateTime('heure_prevue')->nullable()->change();
            $table->integer('duree_prevue')->default(30)->change();
        });
    }
};
