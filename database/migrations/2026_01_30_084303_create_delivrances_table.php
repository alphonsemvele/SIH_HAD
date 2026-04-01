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

        Schema::create('delivrances', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('prescription_id')->constrained();
            $table->foreignId('pharmacien_id')->constrained('users');
            $table->dateTime('date_delivrance');
            $table->decimal('montant_total', 10, 2)->default(0);
            $table->decimal('montant_paye', 10, 2)->default(0);
            $table->enum('mode_paiement', ["especes","carte","mobile_money","assurance","credit"])->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["en_cours","terminee","annulee"])->default('en_cours');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivrances');
    }
};
