<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lits', function (Blueprint $table) {
            $table->string('statut')->change();
        });
        
        // SQLite ne supporte pas ADD CONSTRAINT de cette manière
        if (DB::getDriverName() === 'sqlite') {
            // Pour SQLite, on utilise une approche différente
            DB::statement("CREATE TRIGGER check_statut_lit BEFORE INSERT ON lits 
                          WHEN NEW.statut NOT IN ('disponible', 'occupe', 'nettoyage', 'hors-service')
                          BEGIN
                              SELECT RAISE(ABORT, 'Invalid statut value');
                          END");
        } else {
            DB::statement("ALTER TABLE lits ADD CONSTRAINT check_statut_lit CHECK (statut IN ('disponible', 'occupe', 'nettoyage', 'hors-service'))");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("DROP TRIGGER IF EXISTS check_statut_lit");
        } else {
            DB::statement("ALTER TABLE lits DROP CONSTRAINT IF EXISTS check_statut_lit");
        }
        
        Schema::table('lits', function (Blueprint $table) {
            $table->string('statut')->change();
        });
        
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE lits ADD CONSTRAINT check_statut_lit CHECK (statut IN ('libre', 'occupe', 'maintenance', 'reserve'))");
        }
    }
};
