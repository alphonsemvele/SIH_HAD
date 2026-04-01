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

        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('patient_id')->constrained();
            $table->foreignId('admission_id')->nullable()->constrained();
            $table->foreignId('assurance_id')->nullable()->constrained();
            $table->date('date_facture');
            $table->date('date_echeance')->nullable();
            $table->decimal('montant_brut', 12, 2)->default(0);
            $table->decimal('remise', 12, 2)->default(0);
            $table->decimal('montant_assurance', 12, 2)->default(0);
            $table->decimal('montant_patient', 12, 2)->default(0);
            $table->decimal('montant_total', 12, 2)->default(0);
            $table->decimal('montant_paye', 12, 2)->default(0);
            $table->decimal('tva', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->enum('statut', ["brouillon","emise","partiellement_payee","payee","annulee"])->default('brouillon');
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
        Schema::dropIfExists('factures');
    }
};
