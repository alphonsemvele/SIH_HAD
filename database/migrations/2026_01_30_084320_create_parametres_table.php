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

        Schema::create('parametres', function (Blueprint $table) {
            $table->id();
            $table->string('cle', 100)->unique();
            $table->text('valeur')->nullable();
            $table->enum('type', ["string","integer","boolean","json","date"])->default('string');
            $table->string('groupe', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('modifiable')->default(true);
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres');
    }
};
