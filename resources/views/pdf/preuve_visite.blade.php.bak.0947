<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Preuve de réalisation de prestation HAD</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        .acte-item { margin-bottom: 8px; }
        .photos { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
        .photo { text-align: center; width: 200px; }
        .photo img { max-width: 180px; max-height: 135px; border: 1px solid #ddd; }
        .signature { text-align: center; margin: 20px 0; }
        .signature img { max-height: 100px; }
        .footer { margin-top: 40px; font-size: 10px; color: #666; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Preuve de réalisation de prestation HAD</h1>
        <p><strong>N° de visite :</strong> {{ $visite->id }}</p>
        <p><strong>Date :</strong> {{ $visite->visite_at?->format('d/m/Y H:i') }}</p>
    </div>

    <div class="patient-info">
        <h2>Informations Patient</h2>
        <table>
            <tr><td><strong>Nom :</strong></td><td>{{ $patient->nom }} {{ $patient->prenom }}</td></tr>
            <tr><td><strong>N° dossier :</strong></td><td>{{ $patient->numero_dossier }}</td></tr>
            <tr><td><strong>INS :</strong></td><td>{{ $patient->ins ?? 'n/a' }}</td></tr>
            <tr><td><strong>Adresse :</strong></td><td>{{ $patient->adresse }}, {{ $patient->ville }}</td></tr>
        </table>
    </div>

    @if($qrScan)
    <div class="section">
        <h3 class="section-title">Information de Scan QR Code</h3>
        <table>
            <tr><td><strong>Horodatage :</strong></td><td>{{ $qrScan->scanned_at->format('d/m/Y H:i:s') }}</td></tr>
            <tr><td><strong>Intervenant :</strong></td><td>{{ $qrScan->intervenant->nom }} {{ $qrScan->intervenant->prenom }}</td></tr>
            @if($qrScan->lat && $qrScan->lng)
            <tr><td><strong>Géolocalisation :</strong></td><td>{{ $qrScan->lat }}, {{ $qrScan->lng }}</td></tr>
            @endif
        </table>
    </div>
    @endif

    <div class="section">
        <h3 class="section-title">Actes Réalisés</h3>
        @if($actes->count() > 0)
            @foreach($actes as $acte)
            <div class="acte-item">
                <strong>{{ $acte->libelle }}</strong>
                @if($acte->code_ccam)
                    <span> (CCAM: {{ $acte->code_ccam }})</span>
                @endif
                @if($acte->non_prevu)
                    <span style="color: red;"> - Non prévu</span>
                @endif
                @if($acte->observations)
                    <br><em>{{ $acte->observations }}</em>
                @endif
            </div>
            @endforeach
        @else
            <p>Aucun acte enregistré</p>
        @endif
    </div>

    @if($constantes->count() > 0)
    <div class="section">
        <h3 class="section-title">Constantes Vitales</h3>
        <table>
            @foreach($constantes as $constante)
            <tr>
                <td><strong>{{ $constante->date_releve->format('d/m') }}</strong></td>
                <td>{{ $constante->temperature ?? 'N/A' }}</td>
                <td>{{ $constante->tension ?? 'N/A' }}</td>
                <td>{{ $constante->frequence_cardiaque ?? 'N/A' }} bpm</td>
                <td>{{ $constante->saturation_oxygene ?? 'N/A' }} %</td>
                <td>{{ $constante->glycemie ?? 'N/A' }} g/L</td>
            </tr>
            @endforeach
        </table>
    </div>
    @endif

    @if($photos->count() > 0)
    <div class="section">
        <h3 class="section-title">Photos de la visite</h3>
        <div class="photos">
            @foreach($photos as $photo)
            <div class="photo">
                <img src="{{ Storage::url($photo->chemin) }}" alt="Photo visite">
                <br><small>{{ $photo->legende ?? '' }}</small>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    @if($signature)
    <div class="section">
        <h3 class="section-title">Signature</h3>
        <div class="signature">
            @if($signature->signataire_type === 'refus')
                <p><strong>Signature refusée</strong></p>
                <p><strong>Motif :</strong> {{ $signature->motif_refus }}</p>
            @else
                <img src="{{ Storage::url($signature->chemin_image_png) }}" alt="Signature">
                <br>
                <p><strong>Signataire :</strong> {{ $signature->signataire_type === 'patient' ? 'Patient' : 'Aidant' }}</p>
                @if($signature->aidant)
                    <p><strong>Aidant :</strong> {{ $signature->aidant->nom }} {{ $signature->aidant->prenom }}</p>
                @endif
            @endif
            <p><strong>Date :</strong> {{ $signature->signe_a->format('d/m/Y H:i') }}</p>
        </div>
    </div>
    @endif

    <div class="footer">
        <p><strong>Document généré le {{ now()->format('d/m/Y H:i') }}</strong></p>
        <p><strong>Hash de vérification :</strong> {{ substr($hash, 0, 16) }}...</p>
    </div>
</body>
</html>
