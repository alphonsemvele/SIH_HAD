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
        Schema::table('visite_hads', function (Blueprint $table) {
            $table->timestamp('heure_prevue')->nullable()->comment('Heure planifiée pour la visite');
            $table->unsignedSmallInteger('duree_prevue')->default(60)->comment('Durée prévue en minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visite_hads', function (Blueprint $table) {
            $table->dropColumn(['heure_prevue', 'duree_prevue']);
        });
    }
};
