<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes_visite', function (Blueprint $table) {
            if (!Schema::hasColumn('demandes_visite', 'patient_id')) {
                $table->foreignId('patient_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('patients')
                    ->nullOnDelete();
                $table->index('patient_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('demandes_visite', function (Blueprint $table) {
            if (Schema::hasColumn('demandes_visite', 'patient_id')) {
                $table->dropConstrainedForeignId('patient_id');
            }
        });
    }
};
