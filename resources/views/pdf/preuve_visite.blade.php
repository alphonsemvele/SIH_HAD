<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Preuve de réalisation HAD</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #222; }
        h1 { font-size: 18px; margin: 0 0 10px 0; text-align: center; }
        h2 { font-size: 14px; margin: 0 0 8px 0; }
        h3 { font-size: 12px; margin: 0 0 6px 0; border-bottom: 1px solid #888; padding-bottom: 3px; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #333; }
        .badge { display: inline-block; background: #2c5282; color: white; padding: 4px 10px; border-radius: 3px; font-size: 10px; }
        .info-box { background: #f7f7f7; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .section { margin: 15px 0; page-break-inside: avoid; }
        table { width: 100%; border-collapse: collapse; margin: 5px 0; }
        td, th { padding: 5px 8px; border: 1px solid #ccc; vertical-align: top; }
        th { background: #eee; font-weight: bold; text-align: left; }
        .acte-item { margin: 6px 0; padding: 6px; background: #f9f9f9; border-left: 3px solid #2c5282; }
        .non-prevu { color: #c53030; font-weight: bold; }
        .signature-box { border: 1px solid #888; padding: 15px; text-align: center; margin: 10px 0; min-height: 80px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 9px; color: #666; text-align: center; }
        .hash { font-family: 'Courier New', monospace; font-size: 9px; word-break: break-all; }
    </style>
</head>
<body>

<div class="header">
    <h1>PREUVE DE RÉALISATION DE PRESTATION HAD</h1>
    <p><span class="badge">Document conforme Ségur du Numérique</span></p>
    <p><strong>N° Visite :</strong> {{ $visite->id ?? 'N/A' }}
       &nbsp;&nbsp;|&nbsp;&nbsp;
       <strong>Date :</strong> {{ optional($visite->visite_at)->format('d/m/Y à H:i') ?? 'N/A' }}</p>
</div>

<div class="info-box">
    <h2>Patient</h2>
    <table>
        <tr>
            <th width="30%">Nom</th>
            <td>{{ $patient->nom ?? '?' }} {{ $patient->prenom ?? '' }}</td>
        </tr>
        <tr>
            <th>N° dossier</th>
            <td>{{ $patient->numero_dossier ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Date de naissance</th>
            <td>{{ optional($patient->date_naissance)->format('d/m/Y') ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>INS qualifié</th>
            <td>
                @if($patient->ins_qualifie ?? false)
                    {{ $patient->ins_matricule ?? '(matricule non disponible)' }}
                @else
                    <em>Identité Nationale de Santé non qualifiée</em>
                @endif
            </td>
        </tr>
        <tr>
            <th>Adresse</th>
            <td>{{ $patient->adresse ?? '?' }}{{ ($patient->ville ?? '') ? ', ' . $patient->ville : '' }}</td>
        </tr>
    </table>
</div>

@if($qrScan)
<div class="section">
    <h3>Preuve de présence (scan QR Code)</h3>
    <table>
        <tr>
            <th width="30%">Horodatage scan</th>
            <td>{{ optional($qrScan->scanned_at)->format('d/m/Y H:i:s') ?? 'N/A' }}</td>
        </tr>
        <tr>
            <th>Intervenant</th>
            <td>{{ $intervenantNom ?? 'Intervenant #' . ($qrScan->intervenant_id ?? '?') }}</td>
        </tr>
        @if($qrScan->lat && $qrScan->lng)
        <tr>
            <th>Géolocalisation</th>
            <td>{{ $qrScan->lat }}, {{ $qrScan->lng }} (précision : {{ $qrScan->precision_m ?? '?' }} m)</td>
        </tr>
        @endif
        <tr>
            <th>Statut scan</th>
            <td>{{ $qrScan->statut_scan ?? 'accepte' }}</td>
        </tr>
    </table>
</div>
@endif

<div class="section">
    <h3>Actes réalisés</h3>
    @if($actes && count($actes) > 0)
        @foreach($actes as $acte)
        <div class="acte-item">
            <strong>{{ $acte->libelle ?? 'Acte sans libellé' }}</strong>
            @if(!empty($acte->code_ccam))
                <span style="color: #666;">— CCAM : {{ $acte->code_ccam }}</span>
            @endif
            @if($acte->non_prevu ?? false)
                <span class="non-prevu">[NON PRÉVU]</span>
            @endif
            @if(!empty($acte->observations))
                <div style="margin-top: 4px; font-style: italic;">{{ $acte->observations }}</div>
            @endif
            <div style="margin-top: 4px; font-size: 9px; color: #888;">
                Réalisé : {{ optional($acte->realise_a)->format('d/m/Y H:i') ?? 'N/A' }}
            </div>
        </div>
        @endforeach
    @else
        <p><em>Aucun acte enregistré</em></p>
    @endif
</div>

<div class="section">
    <h3>Constantes vitales</h3>
    @if(!empty($visite->temperature) || !empty($visite->tension) || !empty($visite->pouls) || !empty($visite->saturation))
    <table>
        @if(!empty($visite->temperature))
        <tr><th width="30%">Température</th><td>{{ $visite->temperature }} °C</td></tr>
        @endif
        @if(!empty($visite->tension))
        <tr><th>Tension artérielle</th><td>{{ $visite->tension }} mmHg</td></tr>
        @endif
        @if(!empty($visite->pouls))
        <tr><th>Fréquence cardiaque</th><td>{{ $visite->pouls }} bpm</td></tr>
        @endif
        @if(!empty($visite->saturation))
        <tr><th>Saturation O₂</th><td>{{ $visite->saturation }} %</td></tr>
        @endif
    </table>
    @else
        <p><em>Aucune constante vitale relevée</em></p>
    @endif
</div>

@if(!empty($visite->observations))
<div class="section">
    <h3>Observations</h3>
    <p>{{ $visite->observations }}</p>
</div>
@endif

@if($signature)
<div class="section">
    <h3>Signature</h3>
    <div class="signature-box">
        @if($signature->signataire_type === 'refus')
            <p><strong>SIGNATURE REFUSÉE</strong></p>
            <p>Motif : <em>{{ $signature->motif_refus ?? 'non précisé' }}</em></p>
        @else
            <p><em>Signature de type : {{ $signature->signataire_type ?? 'patient' }}</em></p>
            <p style="font-size: 9px; color: #666;">(Image signature stockée : {{ $signature->chemin_image_png ?? 'N/A' }})</p>
        @endif
        <p style="margin-top: 10px; font-size: 9px;">
            Signé le : {{ optional($signature->signe_a)->format('d/m/Y H:i') ?? 'N/A' }}
        </p>
    </div>
</div>
@endif

<div class="footer">
    <p>
        <strong>Document généré le {{ now()->format('d/m/Y à H:i:s') }}</strong>
    </p>
    <p>
        SIH/HAD Ségur — Preuve de réalisation auto-générée — Conservation 30 ans (CSP)
    </p>
    <p class="hash">
        Hash SHA-256 : {{ $hashAffiche ?? '(calculé après génération PDF)' }}
    </p>
</div>

</body>
</html>
