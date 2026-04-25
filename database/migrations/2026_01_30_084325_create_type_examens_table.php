<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('type_examens', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('module', ['laboratoire', 'imagerie']);
            $table->enum('categorie', ['hematologie', 'biochimie', 'bacteriologie', 'parasitologie', 'immunologie', 'radiographie', 'echographie', 'scanner', 'irm', 'mammographie'])->nullable();
            $table->decimal('prix', 10, 2)->default(0);
            $table->integer('duree_minutes')->default(30);
            $table->boolean('actif')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('type_examens');
    }
};
