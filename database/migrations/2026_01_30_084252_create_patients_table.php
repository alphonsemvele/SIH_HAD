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

        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('numero_dossier', 20)->unique();
            $table->string('nom', 100);
            $table->string('prenom', 100);
            $table->date('date_naissance');
            $table->enum('sexe', ["M","F"]);
            $table->string('lieu_naissance', 100)->nullable();
            $table->string('nationalite', 50)->default('Camerounaise');
            $table->string('cni', 30)->nullable()->unique();
            $table->string('telephone', 20)->nullable();
            $table->string('telephone_urgence', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('adresse')->nullable();
            $table->string('ville', 50)->nullable();
            $table->string('quartier', 100)->nullable();
            $table->string('profession', 100)->nullable();
            $table->enum('situation_matrimoniale', ["celibataire","marie","divorce","veuf"])->nullable();
            $table->enum('groupe_sanguin', ["A+","A-","B+","B-","AB+","AB-","O+","O-"])->nullable();
            $table->json('allergies')->nullable();
            $table->json('antecedents_medicaux')->nullable();
            $table->json('antecedents_chirurgicaux')->nullable();
            $table->json('antecedents_familiaux')->nullable();
            $table->foreignId('assurance_id')->nullable()->constrained();
            $table->string('numero_assurance', 50)->nullable();
            $table->string('personne_contact_nom', 100)->nullable();
            $table->string('personne_contact_telephone', 20)->nullable();
            $table->string('personne_contact_lien', 50)->nullable();
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->enum('statut', ["actif","inactif","decede"])->default('actif');
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
        Schema::dropIfExists('patients');
    }
};
