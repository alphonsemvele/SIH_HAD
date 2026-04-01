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

        Schema::create('mouvement_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicament_id')->constrained();
            $table->enum('type', ["entree","sortie","ajustement","perte","peremption"]);
            $table->integer('quantite');
            $table->unsignedInteger('stock_avant');
            $table->unsignedInteger('stock_apres');
            $table->string('motif', 255)->nullable();
            $table->string('reference', 50)->nullable();
            $table->string('lot', 50)->nullable();
            $table->date('date_expiration')->nullable();
            $table->decimal('prix_unitaire', 10, 2)->nullable();
            $table->foreignId('user_id')->constrained();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mouvement_stocks');
    }
};
