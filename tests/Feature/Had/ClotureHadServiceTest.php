<?php

namespace Tests\Feature\Had;

use App\Models\CrFinHad;
use App\Models\PatientHad;
use App\Models\SegurDocument;
use App\Models\User;
use App\Models\VisiteHad;
use App\Services\Had\ClotureHadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClotureHadServiceTest extends TestCase
{
    use RefreshDatabase;

    private ClotureHadService $clotureService;
    private User $user;
    private PatientHad $patient;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->clotureService = app(ClotureHadService::class);
        
        // Créer un utilisateur
        $this->user = User::factory()->create([
            'fonction' => 'infirmier',
            'rpps' => '12345678901',
        ]);
        
        $this->actingAs($this->user);
        
        // Créer un patient HAD
        $this->patient = PatientHad::factory()->create([
            'statut_had' => 'en_cours',
            'date_debut_had' => now()->subDays(30),
        ]);
    }

    public function test_cloturer_passes_patient_to_cloturee()
    {
        // Créer quelques visites planifiées
        VisiteHad::factory()->count(3)->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'planifiee',
        ]);

        $data = [
            'motif_fin' => 'guerison',
            'synthese_clinique' => 'Patient guéri avec succès. Évolution favorable.',
            'actes_realises' => 'Pansements quotidiens, surveillance des constantes, éducation thérapeutique.',
            'recommandations_suivi' => 'Consultation de contrôle dans 1 mois. Continuer le traitement prescrit.',
        ];

        $cr = $this->clotureService->cloturer($this->patient, $data);

        // Vérifier le CR créé
        $this->assertInstanceOf(CrFinHad::class, $cr);
        $this->assertEquals('brouillon', $cr->statut);
        $this->assertEquals($this->patient->id, $cr->patient_had_id);
        $this->assertEquals($this->user->id, $cr->redacteur_id);
        $this->assertEquals('guerison', $cr->motif_fin);
        $this->assertEquals($data['synthese_clinique'], $cr->synthese_clinique);
        $this->assertEquals($data['actes_realises'], $cr->actes_realises);
        $this->assertEquals($data['recommandations_suivi'], $cr->recommandations_suivi);

        // Vérifier que le patient est clôturé
        $this->patient->refresh();
        $this->assertEquals('cloturee', $this->patient->statut_had);
        $this->assertNotNull($this->patient->date_fin_reelle);
        $this->assertEquals(now()->toDateString(), $this->patient->date_fin_reelle->toDateString());
    }

    public function test_cloturer_annule_visites_planifiees()
    {
        // Créer des visites avec différents statuts
        $visitesPlanifiees = VisiteHad::factory()->count(3)->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'planifiee',
        ]);

        $visitesRealisees = VisiteHad::factory()->count(2)->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'realisee',
        ]);

        $visitesEnCours = VisiteHad::factory()->count(1)->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'en_cours',
        ]);

        $data = [
            'motif_fin' => 'transfert',
            'synthese_clinique' => 'Patient transféré vers autre établissement.',
            'actes_realises' => 'Soins de transition, préparation au transfert.',
            'recommandations_suivi' => 'Poursuite des soins dans le nouvel établissement.',
        ];

        $this->clotureService->cloturer($this->patient, $data);

        // Vérifier que les visites planifiées sont annulées
        foreach ($visitesPlanifiees as $visite) {
            $visite->refresh();
            $this->assertEquals('annulee', $visite->statut);
            $this->assertStringContains('Annulée suite à la clôture HAD', $visite->observations);
        }

        // Vérifier que les autres visites ne sont pas modifiées
        foreach ($visitesRealisees as $visite) {
            $visite->refresh();
            $this->assertEquals('realisee', $visite->statut);
        }

        foreach ($visitesEnCours as $visite) {
            $visite->refresh();
            $this->assertEquals('en_cours', $visite->statut);
        }
    }

    public function test_valider_genere_pdf()
    {
        // Créer un CR en brouillon
        $cr = CrFinHad::factory()->create([
            'patient_had_id' => $this->patient->id,
            'redacteur_id' => $this->user->id,
            'statut' => 'brouillon',
        ]);

        $crValide = $this->clotureService->valider($cr);

        // Vérifier que le CR est validé
        $this->assertEquals('valide', $crValide->statut);
        $this->assertNotNull($crValide->valide_a);
        $this->assertNotNull($crValide->document_pdf_path);
        $this->assertTrue($crValide->hasDocumentPdf());

        // Vérifier que le fichier PDF existe
        $this->assertTrue(\Storage::exists($crValide->document_pdf_path));
        $this->assertStringContains('cr_fin_had_', $crValide->document_pdf_path);
        $this->assertStringEndsWith('.pdf', $crValide->document_pdf_path);
    }

    public function test_valider_cree_segur_document_si_ins_qualifie()
    {
        // Créer un patient qualifié INS
        $this->patient->update([
            'ins_qualifie' => true,
            'ins' => '123456789012345',
        ]);

        // Créer un CR en brouillon
        $cr = CrFinHad::factory()->create([
            'patient_had_id' => $this->patient->id,
            'redacteur_id' => $this->user->id,
            'statut' => 'brouillon',
        ]);

        $crValide = $this->clotureService->valider($cr);

        // Vérifier qu'un SegurDocument a été créé
        $segurDocument = SegurDocument::where('source_type', 'cr_fin_had')
            ->where('source_id', $cr->id)
            ->first();

        $this->assertNotNull($segurDocument);
        $this->assertEquals($this->patient->patient_id, $segurDocument->patient_id);
        $this->assertEquals($this->user->id, $segurDocument->auteur_id);
        $this->assertEquals('18842-5', $segurDocument->type_loinc); // LOINC code pour CR de séjour
        $this->assertEquals('Compte-rendu de fin d\'HAD', $segurDocument->titre);
        $this->assertEquals('brouillon', $segurDocument->statut);
    }

    public function test_valider_ne_cree_pas_segur_document_si_non_ins()
    {
        // S'assurer que le patient n'est pas qualifié INS
        $this->patient->update([
            'ins_qualifie' => false,
            'ins' => null,
        ]);

        // Créer un CR en brouillon
        $cr = CrFinHad::factory()->create([
            'patient_had_id' => $this->patient->id,
            'redacteur_id' => $this->user->id,
            'statut' => 'brouillon',
        ]);

        $this->clotureService->valider($cr);

        // Vérifier qu'aucun SegurDocument n'a été créé
        $segurDocument = SegurDocument::where('source_type', 'cr_fin_had')
            ->where('source_id', $cr->id)
            ->first();

        $this->assertNull($segurDocument);
    }

    public function test_peut_etre_cloture_patient_en_cours_sans_visites()
    {
        $verification = $this->clotureService->peutEtreCloture($this->patient);

        $this->assertTrue($verification['possible']);
        $this->assertEmpty($verification['motifs']);
    }

    public function test_peut_etre_cloture_patient_pas_en_cours()
    {
        $this->patient->update(['statut_had' => 'cloturee']);

        $verification = $this->clotureService->peutEtreCloture($this->patient);

        $this->assertFalse($verification['possible']);
        $this->assertContains('Le patient n\'est pas en cours d\'HAD', $verification['motifs']);
    }

    public function test_peut_etre_cloture_patient_avec_visites_planifiees()
    {
        // Créer des visites planifiées
        VisiteHad::factory()->count(2)->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'planifiee',
        ]);

        $verification = $this->clotureService->peutEtreCloture($this->patient);

        $this->assertFalse($verification['possible']);
        $this->assertContains('Il reste des visites en cours ou planifiées (2)', $verification['motifs']);
    }

    public function test_peut_etre_cloture_patient_avec_visites_en_cours()
    {
        // Créer une visite en cours
        VisiteHad::factory()->create([
            'patient_had_id' => $this->patient->id,
            'statut' => 'en_cours',
        ]);

        $verification = $this->clotureService->peutEtreCloture($this->patient);

        $this->assertFalse($verification['possible']);
        $this->assertContains('Il reste des visites en cours ou planifiées (1)', $verification['motifs']);
    }

    public function test_cloturer_echoue_si_patient_pas_en_cours()
    {
        $this->patient->update(['statut_had' => 'cloturee']);

        $data = [
            'motif_fin' => 'guerison',
            'synthese_clinique' => 'Test',
            'actes_realises' => 'Test',
            'recommandations_suivi' => 'Test',
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Le patient n\'est pas en cours d\'HAD');

        $this->clotureService->cloturer($this->patient, $data);
    }

    public function test_valider_echoue_si_cr_pas_brouillon()
    {
        $cr = CrFinHad::factory()->create([
            'patient_had_id' => $this->patient->id,
            'redacteur_id' => $this->user->id,
            'statut' => 'valide',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Seul un CR en brouillon peut être validé');

        $this->clotureService->valider($cr);
    }
}
