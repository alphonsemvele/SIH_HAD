<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('type_examens', function (Blueprint $table) {
            $table->foreignId('modalite_imagerie_id')->nullable()->after('duree_minutes');
            $table->foreign('modalite_imagerie_id')->references('id')->on('modalite_imageries')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('type_examens', function (Blueprint $table) {
            $table->dropForeign(['modalite_imagerie_id']);
            $table->dropColumn('modalite_imagerie_id');
        });
    }
};
