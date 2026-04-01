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

        Schema::create('type_examen_imageries', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom', 150);
            $table->enum('modalite', ["radiographie","echographie","scanner","irm","mammographie","autre"]);
            $table->text('description')->nullable();
            $table->text('preparation_patient')->nullable();
            $table->unsignedInteger('duree_minutes')->default(30);
            $table->decimal('prix', 10, 2)->default(0);
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
        Schema::dropIfExists('type_examen_imageries');
    }
};
