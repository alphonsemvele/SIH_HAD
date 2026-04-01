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

        Schema::create('commande_fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('fournisseur_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->date('date_commande');
            $table->date('date_livraison_prevue')->nullable();
            $table->date('date_livraison_effective')->nullable();
            $table->decimal('montant_total', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->enum('statut', ["brouillon","envoyee","confirmee","livree_partiellement","livree","annulee"])->default('brouillon');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commande_fournisseurs');
    }
};
