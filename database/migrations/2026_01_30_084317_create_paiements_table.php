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

        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('facture_id')->constrained();
            $table->dateTime('date_paiement');
            $table->decimal('montant', 12, 2);
            $table->enum('mode_paiement', ["especes","carte_bancaire","mobile_money","cheque","virement","assurance"]);
            $table->string('reference', 100)->nullable();
            $table->string('banque', 100)->nullable();
            $table->string('telephone_mobile_money', 20)->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["en_attente","confirme","annule"])->default('confirme');
            $table->foreignId('recu_par_id');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
