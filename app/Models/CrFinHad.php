<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrFinHad extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_had_id',
        'redacteur_id',
        'date_fin_had',
        'motif_fin',
        'synthese_clinique',
        'actes_realises',
        'recommandations_suivi',
        'correspondants',
        'statut',
        'document_pdf_path',
        'document_xml_cdar2_path',
        'valide_a',
    ];

    protected $casts = [
        'date_fin_had' => 'date',
        'correspondants' => 'array',
        'valide_a' => 'datetime',
    ];

    /**
     * Relation avec le patient HAD
     */
    public function patientHad(): BelongsTo
    {
        return $this->belongsTo(PatientHad::class);
    }

    /**
     * Relation avec le rédacteur
     */
    public function redacteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'redacteur_id');
    }

    /**
     * Scope pour les CR en brouillon
     */
    public function scopeBrouillons($query)
    {
        return $query->where('statut', 'brouillon');
    }

    /**
     * Scope pour les CR validés
     */
    public function scopeValides($query)
    {
        return $query->where('statut', 'valide');
    }

    /**
     * Scope pour les CR envoyés
     */
    public function scopeEnvoyes($query)
    {
        return $query->where('statut', 'envoye');
    }

    /**
     * Vérifier si le CR est en brouillon
     */
    public function estBrouillon(): bool
    {
        return $this->statut === 'brouillon';
    }

    /**
     * Vérifier si le CR est validé
     */
    public function estValide(): bool
    {
        return $this->statut === 'valide';
    }

    /**
     * Vérifier si le CR est envoyé
     */
    public function estEnvoye(): bool
    {
        return $this->statut === 'envoye';
    }

    /**
     * Obtenir le libellé du motif de fin
     */
    public function getMotifFinLibelle(): string
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
    public function hasDocumentPdf(): bool
    {
        return !empty($this->document_pdf_path) && \Storage::exists($this->document_pdf_path);
    }

    /**
     * Obtenir l'URL temporaire du PDF (5 minutes)
     */
    public function getPdfUrl(): ?string
    {
        if (!$this->hasDocumentPdf()) {
            return null;
        }

        return \Storage::temporaryUrl($this->document_pdf_path, now()->addMinutes(5));
    }
}
