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

        Schema::create('medicaments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom', 200);
            $table->string('dci', 200)->nullable();
            $table->enum('forme', ["comprime","gelule","sirop","injectable","pommade","collyre","suppositoire","solution","poudre","autre"]);
            $table->string('dosage', 50)->nullable();
            $table->enum('categorie', ["antalgique","antibiotique","anti_inflammatoire","antidiabetique","antihypertenseur","antipaludeen","antiseptique","vitamine","autre"]);
            $table->enum('voie_administration', ["orale","injectable","cutanee","rectale","oculaire","nasale","auriculaire","autre"])->default('orale');
            $table->string('conditionnement', 100)->nullable();
            $table->unsignedInteger('stock_actuel')->default(0);
            $table->unsignedInteger('stock_minimum')->default(10);
            $table->unsignedInteger('stock_maximum')->default(1000);
            $table->decimal('prix_achat', 10, 2)->default(0);
            $table->decimal('prix_vente', 10, 2)->default(0);
            $table->decimal('tva', 5, 2)->default(0);
            $table->foreignId('fournisseur_id')->nullable()->constrained();
            $table->date('date_expiration')->nullable();
            $table->string('emplacement', 50)->nullable();
            $table->boolean('ordonnance_obligatoire')->default(false);
            $table->boolean('actif')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicaments');
    }
};
