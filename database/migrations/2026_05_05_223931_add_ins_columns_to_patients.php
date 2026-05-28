<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('ins_matricule', 16)->nullable()->unique()->comment('Matricule INS');
            $table->string('ins_oid', 64)->nullable()->comment('OID INS');
            $table->boolean('ins_qualifie')->default(false)->comment('Patient qualifié INS');
            $table->timestamp('ins_qualifie_at')->nullable()->comment('Date de qualification INS');
            $table->foreignId('ins_qualifie_par_id')->nullable()->comment('ID utilisateur ayant qualifié INS');
            $table->json('ins_traits_officiels')->nullable()->comment('Traits officiels INS');
            $table->date('date_naissance_officielle')->nullable()->comment('Date de naissance officielle INS');
            $table->string('lieu_naissance_code_insee', 5)->nullable()->comment('Code INSEE lieu de naissance');
            
            // Indexes
            $table->index('ins_matricule');
            $table->index('ins_qualifie_at');
            $table->index(['ins_qualifie', 'ins_qualifie_at']);
        });

        // Foreign key constraint
        Schema::table('patients', function (Blueprint $table) {
            $table->foreign('ins_qualifie_par_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['ins_qualifie_par_id']);
            $table->dropIndex(['ins_matricule']);
            $table->dropIndex(['ins_qualifie_at']);
            $table->dropIndex(['ins_qualifie', 'ins_qualifie_at']);
            $table->dropColumn([
                'ins_matricule',
                'ins_oid',
                'ins_qualifie',
                'ins_qualifie_at',
                'ins_qualifie_par_id',
                'ins_traits_officiels',
                'date_naissance_officielle',
                'lieu_naissance_code_insee'
            ]);
        });
    }
};
