<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CrFinHadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient_had_id' => $this->patient_had_id,
            'patient_had' => $this->whenLoaded('patientHad', function () {
                return [
                    'id' => $this->patientHad->id,
                    'nom' => $this->patientHad->nom,
                    'prenom' => $this->patientHad->prenom,
                    'date_naissance' => $this->patientHad->date_naissance->format('d/m/Y'),
                    'numero_ipp' => $this->patientHad->numero_ipp,
                    'statut_had' => $this->patientHad->statut_had,
                    'date_debut_had' => $this->patientHad->date_debut_had->format('d/m/Y'),
                    'date_fin_reelle' => $this->patientHad->date_fin_reelle?->format('d/m/Y'),
                    'ins_qualifie' => $this->patientHad->ins_qualifie,
                    'ins' => $this->patientHad->ins,
                ];
            }),
            'redacteur' => $this->whenLoaded('redacteur', function () {
                return [
                    'id' => $this->redacteur->id,
                    'nom' => $this->redacteur->nom,
                    'prenom' => $this->redacteur->prenom,
                    'fonction' => $this->redacteur->fonction,
                    'rpps' => $this->redacteur->rpps,
                ];
            }),
            'date_fin_had' => $this->date_fin_had->format('d/m/Y'),
            'motif_fin' => $this->motif_fin,
            'motif_fin_libelle' => $this->getMotifFinLibelle(),
            'synthese_clinique' => $this->synthese_clinique,
            'actes_realises' => $this->actes_realises,
            'recommandations_suivi' => $this->recommandations_suivi,
            'correspondants' => $this->correspondants,
            'statut' => $this->statut,
            'document_pdf_path' => $this->document_pdf_path,
            'document_xml_cdar2_path' => $this->document_xml_cdar2_path,
            'valide_a' => $this->valide_a?->format('d/m/Y H:i'),
            'has_document_pdf' => $this->hasDocumentPdf(),
            'pdf_url' => $this->when($this->hasDocumentPdf(), function () {
                return $this->getPdfUrl();
            }),
            'created_at' => $this->created_at->format('d/m/Y H:i'),
            'updated_at' => $this->updated_at->format('d/m/Y H:i'),
        ];
    }

    /**
     * Obtenir le libellé du motif de fin
     */
    private function getMotifFinLibelle(): string
    {
        return match($this->motif_fin) {
            'guerison' => 'Guérison',
            'transfert' => 'Transfert',
            'deces' => 'Décès',
            'refus_patient' => 'Refus du patient',
            'reorientation' => 'Réorientation',
            default => 'Inconnu',
        };
    }

    /**
     * Vérifier si le document PDF existe
     */
    private function hasDocumentPdf(): bool
    {
        return !empty($this->document_pdf_path) && \Storage::exists($this->document_pdf_path);
    }

    /**
     * Obtenir l'URL temporaire du PDF (5 minutes)
     */
    private function getPdfUrl(): ?string
    {
        if (!$this->hasDocumentPdf()) {
            return null;
        }

        return \Storage::temporaryUrl($this->document_pdf_path, now()->addMinutes(5));
    }
}
