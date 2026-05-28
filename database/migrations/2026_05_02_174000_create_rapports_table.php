<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapports', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('contenu');
            $table->enum('type', ['visite', 'tournee', 'incident', 'medical', 'administratif', 'autre']);
            $table->enum('status', ['brouillon', 'en_cours', 'complet', 'annule'])->default('brouillon');
            $table->date('date_rapport');
            $table->foreignId('patient_id')->nullable()->constrained('patients')->onDelete('set null');
            $table->foreignId('tournee_id')->nullable()->constrained('tournees')->onDelete('set null');
            $table->string('fichier_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index(['date_rapport']);
            $table->index(['patient_id']);
            $table->index(['tournee_id']);
            $table->index(['created_by']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports');
    }
};
