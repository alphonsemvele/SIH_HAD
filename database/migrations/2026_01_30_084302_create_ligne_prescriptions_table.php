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

        Schema::create('ligne_prescriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained();
            $table->foreignId('medicament_id')->constrained();
            $table->string('posologie', 255);
            $table->unsignedInteger('quantite_prescrite');
            $table->unsignedInteger('quantite_delivree')->default(0);
            $table->unsignedInteger('duree_jours')->nullable();
            $table->string('voie_administration', 50)->nullable();
            $table->text('instructions')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligne_prescriptions');
    }
};
