<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->string('patient_nom');
            $table->text('diagnostic');
            $table->text('alerte');
            $table->string('quartier');
            $table->string('telephone', 20);
            $table->integer('age');
            $table->enum('niveau', ['Faible', 'Moyen', 'Urgent', 'Critique']);
            $table->date('date');
            $table->string('heure', 10); // HH:MM format
            $table->timestamps();
            
            $table->index(['niveau', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
