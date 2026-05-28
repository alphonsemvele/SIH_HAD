<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('rpps', 11)->nullable()->unique()->comment('Numéro RPPS');
            $table->string('adeli', 9)->nullable()->unique()->comment('Numéro ADELI');
            $table->string('auth_psc_sub', 64)->nullable()->unique()->comment('Jeton d\'authentification PSC');
            $table->string('profession_code', 16)->nullable()->comment('Code profession');
            $table->json('cartes_pro_data')->nullable()->comment('Données cartes professionnelles');
            $table->timestamp('derniere_connexion_psc_at')->nullable()->comment('Dernière connexion PSC');
            
            // Indexes
            $table->index('rpps');
            $table->index('adeli');
            $table->index('auth_psc_sub');
            $table->index(['profession_code', 'derniere_connexion_psc_at']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('rpps');
            $table->dropIndex('adeli');
            $table->dropIndex('auth_psc_sub');
            $table->dropIndex(['profession_code', 'derniere_connexion_psc_at']);
            $table->dropColumn([
                'rpps',
                'adeli',
                'auth_psc_sub',
                'profession_code',
                'cartes_pro_data',
                'derniere_connexion_psc_at'
            ]);
        });
    }
};
