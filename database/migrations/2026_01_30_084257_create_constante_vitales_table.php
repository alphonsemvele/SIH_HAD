<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('constante_vitales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('admission_id')->nullable()->constrained();
            $table->foreignId('user_id')->constrained();
            $table->dateTime('date_mesure');
            $table->decimal('poids', 5, 2)->nullable();
            $table->decimal('taille', 5, 2)->nullable();
            $table->decimal('temperature', 4, 2)->nullable();
            $table->unsignedInteger('tension_systolique')->nullable();
            $table->unsignedInteger('tension_diastolique')->nullable();
            $table->unsignedInteger('frequence_cardiaque')->nullable();
            $table->unsignedInteger('frequence_respiratoire')->nullable();
            $table->unsignedInteger('saturation_oxygene')->nullable();
            $table->decimal('glycemie', 5, 2)->nullable();
            $table->unsignedInteger('score_douleur')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('constante_vitales');
    }
};
