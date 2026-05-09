<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rendre qr_scan_id nullable (cas où la visite a été réalisée sans scan)
        DB::statement('ALTER TABLE preuves_visite ALTER COLUMN qr_scan_id DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE preuves_visite ALTER COLUMN qr_scan_id SET NOT NULL');
    }
};
