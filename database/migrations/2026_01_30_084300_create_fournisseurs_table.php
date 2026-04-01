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

        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom', 150);
            $table->enum('type', ["laboratoire","grossiste","importateur"]);
            $table->text('adresse')->nullable();
            $table->string('ville', 50)->nullable();
            $table->string('pays', 50)->default('Cameroun');
            $table->string('telephone', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('site_web', 200)->nullable();
            $table->string('contact_nom', 100)->nullable();
            $table->string('contact_telephone', 20)->nullable();
            $table->unsignedInteger('delai_livraison_jours')->default(7);
            $table->text('conditions_paiement')->nullable();
            $table->boolean('actif')->default(true);
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
        Schema::dropIfExists('fournisseurs');
    }
};
