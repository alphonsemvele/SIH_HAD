<?php

namespace Database\Factories;

use App\Models\Assurance;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'numero_dossier' => fake()->unique()->regexify('PAT[0-9]{8}'),
            'nom' => fake()->lastName(),
            'prenom' => fake()->firstName(),
            'date_naissance' => fake()->date('Y-m-d', '-18 years'),
            'sexe' => fake()->randomElement(["M","F"]),
            'lieu_naissance' => fake()->city(),
            'nationalite' => fake()->country(),
            'cni' => fake()->unique()->regexify('[A-Z0-9]{12}'),
            'telephone' => fake()->unique()->phoneNumber(),
            'telephone_urgence' => fake()->phoneNumber(),
            'email' => fake()->unique()->safeEmail(),
            'adresse' => fake()->streetAddress(),
            'ville' => fake()->city(),
            'quartier' => fake()->word(),
            'profession' => fake()->jobTitle(),
            'situation_matrimoniale' => fake()->randomElement(["Célibataire","Marié(e)","Divorcé(e)","Veuf/Veuve"]),
            'groupe_sanguin' => fake()->randomElement(["A+","A-","B+","B-","AB+","AB-","O+","O-"]),
            'allergies' => '{}',
            'antecedents_medicaux' => '{}',
            'antecedents_chirurgicaux' => '{}',
            'antecedents_familiaux' => '{}',
            'assurance_id' => Assurance::factory(),
            'numero_assurance' => fake()->regexify('[A-Z0-9]{12}'),
            'personne_contact_nom' => fake()->name(),
            'personne_contact_telephone' => fake()->phoneNumber(),
            'personne_contact_lien' => fake()->randomElement(["pere","mere","frere","soeur","conjoint","ami"]),
            'photo' => null,
            'notes' => fake()->sentence(),
            'statut' => fake()->randomElement(["Hospitalisé","Consultation","Urgence","Sortie"]),
        ];
    }
}
