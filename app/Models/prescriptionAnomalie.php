<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prescription_anomalies', function (Blueprint $table) {
            $table->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('anomalie_id')->constrained()->cascadeOnDelete();
            $table->primary(['prescription_id', 'anomalie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_anomalies');
    }
};