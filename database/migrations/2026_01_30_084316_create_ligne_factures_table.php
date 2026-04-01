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

        Schema::create('ligne_factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained();
            $table->string('designation', 255);
            $table->enum('type', ["consultation","acte_medical","medicament","analyse","imagerie","sejour","autre"]);
            $table->unsignedInteger('reference_id')->nullable();
            $table->unsignedInteger('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->decimal('remise', 10, 2)->default(0);
            $table->decimal('tva', 10, 2)->default(0);
            $table->decimal('prix_total', 10, 2);
            $table->boolean('couvert_assurance')->default(false);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ligne_factures');
    }
};
