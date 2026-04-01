<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::create('lits', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20);
            $table->foreignId('service_id')->constrained();
            $table->string('chambre', 20)->nullable();
            $table->enum('type', ["standard","soins_intensifs","reanimation","pediatrique","maternite"])->default('standard');
            $table->enum('statut', ["libre","occupe","maintenance","reserve"])->default('libre');
            $table->json('equipements')->nullable();
            $table->decimal('tarif_journalier', 10, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lits');
    }
};
