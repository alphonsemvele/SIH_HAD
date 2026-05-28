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
        Schema::create('actes_realises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visite_had_id')->constrained('visite_hads')->onDelete('cascade');
            $table->foreignId('acte_medical_id')->nullable()->constrained('acte_medicals');
            $table->string('libelle');
            $table->string('code_ccam', 16)->nullable();
            $table->text('observations')->nullable();
            $table->boolean('non_prevu')->default(false);
            $table->foreignId('intervenant_id')->constrained('users');
            $table->timestamp('realise_a');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actes_realises');
    }
};
