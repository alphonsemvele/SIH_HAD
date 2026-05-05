<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plannings', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->enum('type', ['tournee', 'reunion', 'formation', 'urgence', 'consultation', 'autre']);
            $table->date('date');
            $table->string('heure_debut', 10); // HH:MM format
            $table->string('heure_fin', 10); // HH:MM format
            $table->string('secteur')->nullable();
            $table->string('lieu')->nullable();
            $table->timestamps();
            
            $table->index(['date', 'type']);
            $table->index('date');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plannings');
    }
};
