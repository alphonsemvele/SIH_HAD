<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ligne_delivrances', function (Blueprint $table) {
            $table->string('numero_lot', 64)->nullable()->comment('Numéro de lot du médicament');
            $table->date('date_peremption')->nullable()->comment('Date de péremption du lot');
            $table->string('code_cip13', 13)->nullable()->comment('Code CIP13 du médicament');
            
            // Indexes
            $table->index('date_peremption');
            $table->index('code_cip13');
        });
    }

    public function down(): void
    {
        Schema::table('ligne_delivrances', function (Blueprint $table) {
            $table->dropIndex('date_peremption');
            $table->dropIndex('code_cip13');
            $table->dropColumn([
                'numero_lot',
                'date_peremption',
                'code_cip13'
            ]);
        });
    }
};
