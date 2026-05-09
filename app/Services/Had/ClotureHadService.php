<?php

namespace App\Services\Had;

use App\Models\CrFinHad;
use App\Models\PatientHad;
use App\Models\SegurDocument;
use App\Models\User;
use App\Models\VisiteHad;
use App\Services\Audit\AuditTrailService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ClotureHadService
{
    private AuditTrailService $auditService;

    public function __construct(AuditTrailService $auditService)
    {
        $this->auditService = $auditService;
    }

    /**
     * Clôturer un patient HAD et créer le compte-rendu
     */
    public function cloturer(PatientHad $patientHad, array $data): CrFinHad
    {
        return DB::transaction(function () use ($patientHad, $data) {
            // Vérifier que le patient est bien en HAD
            if ($patientHad->statut_had !== 'en_cours') {
                throw new \Exception('Le patient n\'est pas en cours d\'HAD');
            }

            // Créer le compte-rendu
            $cr = CrFinHad::create([
                'patient_had_id' => $patientHad->id,
                'redacteur_id' => auth()->id(),
                'date_fin_had' => now()->toDateString(),
                'motif_fin' => $data['motif_fin'],
                'synthese_clinique' => $data['synthese_clinique'],
                'actes_realises' => $data['actes_realises'],
                'recommandations_suivi' => $data['recommandations_suivi'],
                'correspondants' => $data['correspondants'] ?? null,
                'statut' => 'brouillon',
            ]);

            // Marquer le patient comme clôturé
            $patientHad->update([
                'statut_had' => 'cloturee',
                'date_fin_reelle' => now(),
            ]);

            // Annuler les visites planifiées restantes
            $visitesPlanifiees = VisiteHad::where('patient_had_id', $patientHad->id)
                ->where('statut', 'planifiee')
                ->get();

            foreach ($visitesPlanifiees as $visite) {
                $visite->update([
                    'statut' => 'annulee',
                    'observations' => 'Annulée suite à la clôture HAD',
                ]);
            }

            $this->auditService->log('had_cloturee', [
                'patient_had_id' => $patientHad->id,
                'cr_fin_had_id' => $cr->id,
                'motif_fin' => $data['motif_fin'],
                'visites_annulees' => $visitesPlanifiees->count(),
            ], 'had');

            Log::info('Patient HAD clôturé', [
                'patient_had_id' => $patientHad->id,
                'cr_fin_had_id' => $cr->id,
                'motif_fin' => $data['motif_fin'],
                'redacteur_id' => auth()->id(),
                'visites_annulees' => $visitesPlanifiees->count(),
            ]);

            return $cr->load(['patientHad', 'redacteur']);
        });
    }

    /**
     * Valider le compte-rendu et générer le PDF
     */
    public function valider(CrFinHad $cr): CrFinHad
    {
        return DB::transaction(function () use ($cr) {
            if ($cr->statut !== 'brouillon') {
                throw new \Exception('Seul un CR en brouillon peut être validé');
            }

            // Générer le PDF
            $pdfPath = $this->exporterPdf($cr);

            // Mettre à jour le CR
            $cr->update([
                'statut' => 'valide',
                'document_pdf_path' => $pdfPath,
                'valide_a' => now(),
            ]);

            // Si le patient est qualifié INS, créer un SegurDocument
            $patient = $cr->patientHad;
            if ($patient->ins_qualifie) {
                $this->creerSegurDocument($cr, $patient);
            }

            $this->auditService->log('cr_fin_had_valide', [
                'cr_fin_had_id' => $cr->id,
                'patient_had_id' => $cr->patient_had_id,
                'pdf_path' => $pdfPath,
                'ins_qualifie' => $patient->ins_qualifie,
            ], 'had');

            Log::info('Compte-rendu HAD validé', [
                'cr_fin_had_id' => $cr->id,
                'patient_had_id' => $cr->patient_had_id,
                'pdf_path' => $pdfPath,
                'ins_qualifie' => $patient->ins_qualifie,
            ]);

            return $cr->fresh(['patientHad', 'redacteur']);
        });
    }

    /**
     * Exporter le CR en PDF
     */
    public function exporterPdf(CrFinHad $cr): string
    {
        // Charger les relations nécessaires
        $cr->load(['patientHad', 'redacteur']);

        // Générer le PDF
        $pdf = Pdf::loadView('pdf.cr_fin_had', [
            'cr' => $cr,
            'patient' => $cr->patientHad,
            'redacteur' => $cr->redacteur,
        ]);

        // Nom du fichier
        $filename = 'cr_fin_had_' . $cr->id . '_' . $cr->patient_had_id . '_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        $path = 'cr_fin_had/' . $filename;

        // Sauvegarder dans le storage
        Storage::put($path, $pdf->output());

        return $path;
    }

    /**
     * Créer un SegurDocument pour le CR si le patient est qualifié INS
     */
    private function creerSegurDocument(CrFinHad $cr, PatientHad $patient): SegurDocument
    {
        return SegurDocument::create([
            'patient_id' => $patient->patient_id,
            'auteur_id' => $cr->redacteur_id,
            'type_loinc' => '18842-5', // LOINC code pour CR de séjour
            'titre' => 'Compte-rendu de fin d\'HAD',
            'contenu' => $cr->synthese_clinique,
            'statut' => 'brouillon',
            'source_type' => 'cr_fin_had',
            'source_id' => $cr->id,
            'date_document' => $cr->date_fin_had,
        ]);
    }

    /**
     * Obtenir les CR d'un patient
     */
    public function getCrPatient(int $patientHadId): \Illuminate\Database\Eloquent\Collection
    {
        return CrFinHad::where('patient_had_id', $patientHadId)
            ->with(['patientHad', 'redacteur'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Vérifier si un patient peut être clôturé
     */
    public function peutEtreCloture(PatientHad $patientHad): array
    {
        $result = [
            'possible' => false,
            'motifs' => [],
        ];

        if ($patientHad->statut_had !== 'en_cours') {
            $result['motifs'][] = 'Le patient n\'est pas en cours d\'HAD';
            return $result;
        }

        // Vérifier les visites en cours
        $visitesEnCours = VisiteHad::where('patient_had_id', $patientHad->id)
            ->whereIn('statut', ['en_cours', 'planifiee'])
            ->count();

        if ($visitesEnCours > 0) {
            $result['motifs'][] = 'Il reste des visites en cours ou planifiées (' . $visitesEnCours . ')';
        }

        $result['possible'] = empty($result['motifs']);

        return $result;
    }
}
