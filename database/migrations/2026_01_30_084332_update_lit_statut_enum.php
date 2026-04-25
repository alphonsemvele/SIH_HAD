<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lits', function (Blueprint $table) {
            $table->enum('statut', ["disponible", "occupe", "nettoyage", "hors-service"])->default('disponible')->change();
        });
    }

    public function down(): void
    {
        Schema::table('lits', function (Blueprint $table) {
            $table->enum('statut', ["libre","occupe","maintenance","reserve"])->default('libre')->change();
        });
    }
};
