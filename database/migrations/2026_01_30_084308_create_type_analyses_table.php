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

        Schema::create('type_analyses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom', 150);
            $table->enum('categorie', ["biochimie","hematologie","microbiologie","parasitologie","immunologie","hormonologie","serologie","autre"]);
            $table->text('description')->nullable();
            $table->unsignedInteger('delai_resultat_heures')->default(24);
            $table->decimal('prix', 10, 2)->default(0);
            $table->json('valeurs_normales')->nullable();
            $table->enum('echantillon_requis', ["sang","urine","selles","crachat","lcr","autre"]);
            $table->text('preparation_patient')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('type_analyses');
    }
};
