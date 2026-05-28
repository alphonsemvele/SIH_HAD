<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psc_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->comment('ID utilisateur');
            $table->string('id_token_jti')->unique()->comment('JTI du token JWT');
            $table->string('access_token_hash', 64)->comment('Hash du token d\'accès');
            $table->timestamp('emis_a')->comment('Date d\'émission');
            $table->timestamp('expire_a')->comment('Date d\'expiration');
            $table->string('ip_emission', 45)->comment('IP d\'émission');
            $table->json('claims')->nullable()->comment('Claims JWT');
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'expire_a']);
            $table->index('expire_a');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psc_sessions');
    }
};
