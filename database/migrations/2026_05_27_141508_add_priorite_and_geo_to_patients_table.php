<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'priorite')) {
                $table->string('priorite', 20)->default('normal')->after('antecedents_medicaux');
            }
            if (!Schema::hasColumn('patients', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('priorite');
            }
            if (!Schema::hasColumn('patients', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['priorite', 'latitude', 'longitude']);
        });
    }
};
