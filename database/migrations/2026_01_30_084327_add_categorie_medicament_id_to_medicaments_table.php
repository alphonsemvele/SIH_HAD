<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicaments', function (Blueprint $table) {
            $table->foreignId('categorie_medicament_id')->nullable()->after('fournisseur_id');
            $table->foreign('categorie_medicament_id')->references('id')->on('categorie_medicaments')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('medicaments', function (Blueprint $table) {
            $table->dropForeign(['categorie_medicament_id']);
            $table->dropColumn('categorie_medicament_id');
        });
    }
};
