<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop l'ancien CHECK puis recrée avec 'patient' inclus
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_fonction_check');
        DB::statement("
            ALTER TABLE users ADD CONSTRAINT users_fonction_check 
            CHECK (fonction::text = ANY (ARRAY[
                'medecin','infirmier','sage_femme','pharmacien','technicien',
                'laborantin','administratif','receptionniste','comptable',
                'patient','admin'
            ]::text[]))
        ");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_fonction_check');
        DB::statement("
            ALTER TABLE users ADD CONSTRAINT users_fonction_check 
            CHECK (fonction::text = ANY (ARRAY[
                'medecin','infirmier','sage_femme','pharmacien','technicien',
                'laborantin','administratif','receptionniste','comptable'
            ]::text[]))
        ");
    }
};