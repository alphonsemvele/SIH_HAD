<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans_soins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_had_id')->constrained('patient_hads')->comment('ID patient HAD');
            $table->foreignId('cree_par_id')->constrained('users')->comment('ID utilisateur créateur');
            $table->date('date_debut')->comment('Date de début du plan');
            $table->date('date_fin_prevue')->comment('Date de fin prévue');
            $table->date('reevaluation_prevue_le')->nullable()->comment('Date de réévaluation prévue');
            $table->enum('statut', ['brouillon', 'actif', 'archive'])->default('brouillon')->comment('Statut du plan');
            $table->integer('version')->default(1)->comment('Version du plan');
            $table->foreignId('plan_precedent_id')->nullable()->constrained('plans_soins')->comment('Plan précédent pour versioning');
            $table->text('objectifs')->nullable()->comment('Objectifs du plan de soins');
            $table->timestamps();
            
            // Indexes
            $table->index(['patient_had_id', 'statut']);
            $table->index(['statut', 'date_debut']);
            $table->index(['cree_par_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans_soins');
    }
};
