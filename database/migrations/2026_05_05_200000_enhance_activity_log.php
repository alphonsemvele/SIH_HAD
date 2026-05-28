<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->string('hash_chain', 64)->nullable()->after('properties');
            $table->string('module', 64)->nullable()->index()->after('hash_chain');
            $table->string('ip_address', 45)->nullable()->after('module');
            $table->string('http_method', 10)->nullable()->after('ip_address');
            $table->string('endpoint')->nullable()->after('http_method');
            $table->integer('http_status')->nullable()->after('endpoint');
        });
    }

    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropColumn(['hash_chain', 'module', 'ip_address', 'http_method', 'endpoint', 'http_status']);
        });
    }
};
