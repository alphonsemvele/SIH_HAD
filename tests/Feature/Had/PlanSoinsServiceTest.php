<?php

namespace Tests\Feature\Had;

use App\Models\ActeMedical;
use App\Models\PatientHad;
use App\Models\PlanSoins;
use App\Models\PlanSoinsPrestation;
use App\Models\User;
use App\Models\VisiteHad;
use App\Services\Had\PlanSoinsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlanSoinsServiceTest extends TestCase
{
    use RefreshDatabase;

    private PlanSoinsService $planSoinsService;
    private User $user;
    private PatientHad $patient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->planSoinsService = app(PlanSoinsService::class);
        
        // Créer un utilisateur
        $this->user = User::factory()->create([
            'fonction' => 'infirmier',
        ]);
        
        $this->actingAs($this->user);
        
        // Créer un patient HAD
        $this->patient = PatientHad::factory()->create();
    }

    public function test_creer_plan_soins_brouillon()
    {
        $data = [
            'date_debut' => now()->addDay()->toDateString(),
            'date_fin_prevue' => now()->addDays(30)->toDateString(),
            'reevaluation_prevue_le' => now()->addDays(15)->toDateString(),
            'objectifs' => 'Rééducation post-chirurgicale',
            'prestations' => [
                [
                    'libelle' => 'Pansement quotidien',
                    'frequence_type' => 'quotidienne',
                    'duree_min' => 30,
                    'protocole' => 'Nettoyage avec sérum physiologique',
                ],
                [
                    'libelle' => 'Kinésithérapie',
                    'frequence_type' => 'hebdomadaire',
                    'frequence_detail' => [
                        'jours' => ['lundi', 'mercredi', 'vendredi'],
                        'heure' => '10:00',
                    ],
                    'duree_min' => 45,
                ],
            ],
        ];

        $plan = $this->planSoinsService->creer($this->patient->id, $data);

        $this->assertInstanceOf(PlanSoins::class, $plan);
        $this->assertEquals('brouillon', $plan->statut);
        $this->assertEquals(1, $plan->version);
        $this->assertEquals($this->patient->id, $plan->patient_had_id);
        $this->assertEquals($this->user->id, $plan->cree_par_id);
        $this->assertEquals(2, $plan->prestations->count());

        // Vérifier les prestations
        $prestationQuotidienne = $plan->prestations->firstWhere('frequence_type', 'quotidienne');
        $this->assertNotNull($prestationQuotidienne);
        $this->assertEquals('Pansement quotidien', $prestationQuotidienne->libelle);
        $this->assertEquals(30, $prestationQuotidienne->duree_min);

        $prestationHebdomadaire = $plan->prestations->firstWhere('frequence_type', 'hebdomadaire');
        $this->assertNotNull($prestationHebdomadaire);
        $this->assertEquals('Kinésithérapie', $prestationHebdomadaire->libelle);
        $this->assertEquals(['lundi', 'mercredi', 'vendredi'], $prestationHebdomadaire->frequence_detail['jours']);
    }

    public function test_activer_plan_soins_genere_visites()
    {
        // Créer un plan en brouillon
        $data = [
            'date_debut' => now()->toDateString(),
            'date_fin_prevue' => now()->addDays(7)->toDateString(),
            'objectifs' => 'Test activation',
            'prestations' => [
                [
                    'libelle' => 'Visite quotidienne',
                    'frequence_type' => 'quotidienne',
                    'duree_min' => 30,
                ],
                [
                    'libelle' => 'Soins spéciaux',
                    'frequence_type' => 'personnalisee',
                    'frequence_detail' => [
                        'jours' => ['lundi', 'jeudi'],
                        'heure' => '14:00',
                    ],
                    'duree_min' => 45,
                ],
            ],
        ];

        $plan = $this->planSoinsService->creer($this->patient->id, $data);
        $this->assertEquals('brouillon', $plan->statut);

        // Compter les visites avant activation
        $visitesAvant = VisiteHad::where('patient_had_id', $this->patient->id)->count();
        $this->assertEquals(0, $visitesAvant);

        // Activer le plan
        $planActif = $this->planSoinsService->activer($plan);

        $this->assertEquals('actif', $planActif->statut);
        $this->assertEquals($plan->id, $planActif->id); // Même plan

        // Vérifier que les visites ont été générées
        $visitesApres = VisiteHad::where('patient_had_id', $this->patient->id)
            ->where('statut', 'planifiee')
            ->get();

        // Visites quotidiennes : 7 jours = 7 visites
        // Visites personnalisées : lundi + jeudi = 2 visites
        // Total attendu : 9 visites
        $this->assertEquals(9, $visitesApres->count());

        // Vérifier que les visites sont liées aux prestations
        $prestationQuotidienne = $planActif->prestations->firstWhere('frequence_type', 'quotidienne');
        $visitesQuotidiennes = VisiteHad::where('plan_soins_prestation_id', $prestationQuotidienne->id)->get();
        $this->assertEquals(7, $visitesQuotidiennes->count());

        $prestationPersonnalisee = $planActif->prestations->firstWhere('frequence_type', 'personnalisee');
        $visitesPersonnalisees = VisiteHad::where('plan_soins_prestation_id', $prestationPersonnalisee->id)->get();
        $this->assertEquals(2, $visitesPersonnalisees->count());
    }

    public function test_reevaluer_plan_soins_cree_nouvelle_version()
    {
        // Créer et activer un plan initial
        $dataInitial = [
            'date_debut' => now()->toDateString(),
            'date_fin_prevue' => now()->addDays(7)->toDateString(),
            'objectifs' => 'Plan initial',
            'prestations' => [
                [
                    'libelle' => 'Prestation initiale',
                    'frequence_type' => 'quotidienne',
                    'duree_min' => 30,
                ],
            ],
        ];

        $planInitial = $this->planSoinsService->creer($this->patient->id, $dataInitial);
        $planActif = $this->planSoinsService->activer($planInitial);

        $this->assertEquals('actif', $planActif->statut);
        $this->assertEquals(1, $planActif->version);

        // Réévaluer le plan
        $modifications = [
            'date_debut' => now()->addDay()->toDateString(),
            'date_fin_prevue' => now()->addDays(14)->toDateString(),
            'objectifs' => 'Plan modifié',
            'prestations' => [
                [
                    'id' => $planActif->prestations->first()->id,
                    'duree_min' => 45, // Modifier la durée
                ],
                [
                    'libelle' => 'Nouvelle prestation',
                    'frequence_type' => 'hebdomadaire',
                    'duree_min' => 60,
                ],
            ],
        ];

        $nouveauPlan = $this->planSoinsService->reevaluer($planActif, $modifications);

        // Vérifier le nouveau plan
        $this->assertInstanceOf(PlanSoins::class, $nouveauPlan);
        $this->assertEquals('brouillon', $nouveauPlan->statut);
        $this->assertEquals(2, $nouveauPlan->version);
        $this->assertEquals($planActif->id, $nouveauPlan->plan_precedent_id);
        $this->assertEquals('Plan modifié', $nouveauPlan->objectifs);
        $this->assertEquals(2, $nouveauPlan->prestations->count());

        // Vérifier que l'ancien plan est archivé
        $planActif->refresh();
        $this->assertEquals('archive', $planActif->statut);

        // Vérifier la prestation modifiée
        $prestationModifiee = $nouveauPlan->prestations->firstWhere('libelle', 'Prestation initiale');
        $this->assertEquals(45, $prestationModifiee->duree_min);

        // Vérifier la nouvelle prestation
        $nouvellePrestation = $nouveauPlan->prestations->firstWhere('libelle', 'Nouvelle prestation');
        $this->assertEquals('hebdomadaire', $nouvellePrestation->frequence_type);
        $this->assertEquals(60, $nouvellePrestation->duree_min);
    }

    public function test_get_plan_actif_retourne_plan_actif()
    {
        // Créer un plan et l'activer
        $data = [
            'date_debut' => now()->toDateString(),
            'date_fin_prevue' => now()->addDays(7)->toDateString(),
            'objectifs' => 'Test plan actif',
            'prestations' => [
                [
                    'libelle' => 'Test',
                    'frequence_type' => 'quotidienne',
                    'duree_min' => 30,
                ],
            ],
        ];

        $plan = $this->planSoinsService->creer($this->patient->id, $data);
        $this->planSoinsService->activer($plan);

        $planActif = $this->planSoinsService->getPlanActif($this->patient->id);

        $this->assertInstanceOf(PlanSoins::class, $planActif);
        $this->assertEquals('actif', $planActif->statut);
        $this->assertEquals($this->patient->id, $planActif->patient_had_id);
    }

    public function test_get_plan_actif_retourne_null_si_aucun_plan_actif()
    {
        // Créer un plan mais ne pas l'activer
        $data = [
            'date_debut' => now()->toDateString(),
            'date_fin_prevue' => now()->addDays(7)->toDateString(),
            'objectifs' => 'Test sans activation',
        ];

        $this->planSoinsService->creer($this->patient->id, $data);

        $planActif = $this->planSoinsService->getPlanActif($this->patient->id);

        $this->assertNull($planActif);
    }

    public function test_activer_plan_archive_anciens_plans_actifs()
    {
        // Créer un premier plan et l'activer
        $data1 = [
            'date_debut' => now()->toDateString(),
            'date_fin_prevue' => now()->addDays(7)->toDateString(),
            'objectifs' => 'Premier plan',
        ];

        $plan1 = $this->planSoinsService->creer($this->patient->id, $data1);
        $plan1Actif = $this->planSoinsService->activer($plan1);

        $this->assertEquals('actif', $plan1Actif->statut);

        // Créer un deuxième plan et l'activer
        $data2 = [
            'date_debut' => now()->addDay()->toDateString(),
            'date_fin_prevue' => now()->addDays(14)->toDateString(),
            'objectifs' => 'Deuxième plan',
        ];

        $plan2 = $this->planSoinsService->creer($this->patient->id, $data2);
        $plan2Actif = $this->planSoinsService->activer($plan2);

        // Vérifier que le premier plan est archivé
        $plan1Actif->refresh();
        $this->assertEquals('archive', $plan1Actif->statut);

        // Vérifier que le deuxième plan est actif
        $this->assertEquals('actif', $plan2Actif->statut);

        // Vérifier qu'il n'y a qu'un seul plan actif
        $plansActifs = PlanSoins::where('patient_had_id', $this->patient->id)
            ->where('statut', 'actif')
            ->count();
        $this->assertEquals(1, $plansActifs);
    }
}
