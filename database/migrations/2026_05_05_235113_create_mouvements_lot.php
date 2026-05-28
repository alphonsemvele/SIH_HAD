<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mouvements_lot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicament_id')->constrained('medicaments')->comment('ID médicament');
            $table->string('numero_lot', 64)->comment('Numéro de lot');
            $table->date('date_peremption')->comment('Date de péremption');
            $table->enum('type', ['entree', 'sortie', 'perte', 'inventaire'])->comment('Type de mouvement');
            $table->integer('quantite_signed')->comment('Quantité (signée, peut être négative)');
            $table->string('source_type')->nullable()->comment('Type de source (morph)');
            $table->unsignedBigInteger('source_id')->nullable()->comment('ID de source (morph)');
            $table->foreignId('user_id')->constrained('users')->comment('ID utilisateur');
            $table->text('commentaire')->nullable()->comment('Commentaire');
            $table->timestamps();
            
            // Indexes
            $table->index(['medicament_id', 'numero_lot']);
            $table->index(['source_type', 'source_id']);
            $table->index(['type', 'created_at']);
            $table->index('date_peremption');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mouvements_lot');
    }
};
