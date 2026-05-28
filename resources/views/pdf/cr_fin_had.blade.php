<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Compte-rendu de fin d'HAD</title>
    <style>
        @page {
            margin: 20px;
            size: A4;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo-placeholder {
            width: 120px;
            height: 60px;
            border: 1px dashed #ccc;
            display: inline-block;
            margin-bottom: 10px;
            text-align: center;
            line-height: 60px;
            color: #999;
            font-size: 10px;
        }
        
        .title {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
            text-decoration: underline;
        }
        
        .ins-block {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 10px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .ins-title {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        
        .patient-info {
            background-color: #e3f2fd;
            border: 1px solid #90caf9;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .patient-info h3 {
            margin: 0 0 10px 0;
            color: #1565c0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .info-item {
            margin-bottom: 5px;
        }
        
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        
        .had-info {
            background-color: #fff3e0;
            border: 1px solid #ffb74d;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .had-info h3 {
            margin: 0 0 10px 0;
            color: #e65100;
        }
        
        .section {
            margin: 25px 0;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        
        .section-content {
            text-align: justify;
            white-space: pre-wrap;
        }
        
        .correspondants-list {
            margin: 10px 0;
        }
        
        .correspondant-item {
            margin-bottom: 8px;
            padding: 8px;
            background-color: #f5f5f5;
            border-radius: 3px;
        }
        
        .signature {
            margin-top: 50px;
            text-align: right;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            width: 250px;
            margin-left: auto;
            margin-top: 20px;
            padding-top: 5px;
        }
        
        .footer {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
        
        .motif-fin {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .motif-guerison { background-color: #c8e6c9; color: #2e7d32; }
        .motif-transfert { background-color: #bbdefb; color: #1565c0; }
        .motif-deces { background-color: #ffcdd2; color: #c62828; }
        .motif-refus { background-color: #fff9c4; color: #f57f17; }
        .motif-reorientation { background-color: #e1bee7; color: #7b1fa2; }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <div class="logo-placeholder">LOGO</div>
        <h2>COMPTES-RENDU DE FIN D'HOSPITALISATION À DOMICILE</h2>
        <div style="font-size: 10px; color: #666;">
            Établissement de Santé - Service HAD
        </div>
    </div>

    <!-- Cartouche INS si présent -->
    @if($patient->ins_qualifie && $patient->ins)
    <div class="ins-block">
        <div class="ins-title">🏥 Informations INS</div>
        <div><strong>INS-C :</strong> {{ $patient->ins }}</div>
        <div><strong>Date de qualification :</strong> {{ $patient->ins_qualifie_le?->format('d/m/Y') ?? 'N/A' }}</div>
    </div>
    @endif

    <!-- Informations patient -->
    <div class="patient-info">
        <h3>👤 INFORMATIONS PATIENT</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Nom :</span>
                {{ $patient->nom }}
            </div>
            <div class="info-item">
                <span class="info-label">Prénom :</span>
                {{ $patient->prenom }}
            </div>
            <div class="info-item">
                <span class="info-label">Date de naissance :</span>
                {{ $patient->date_naissance->format('d/m/Y') }}
            </div>
            <div class="info-item">
                <span class="info-label">Âge :</span>
                {{ $patient->date_naissance->age }} ans
            </div>
            <div class="info-item">
                <span class="info-label">N° IPP :</span>
                {{ $patient->numero_ipp }}
            </div>
            <div class="info-item">
                <span class="info-label">N° Sécurité Sociale :</span>
                {{ $patient->numero_secu }}
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Adresse :</span>
                {{ $patient->adresse }}, {{ $patient->code_postal }} {{ $patient->ville }}
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Téléphone :</span>
                {{ $patient->telephone }}
            </div>
        </div>
    </div>

    <!-- Informations HAD -->
    <div class="had-info">
        <h3>🏠 INFORMATIONS HAD</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Date début HAD :</span>
                {{ $patient->date_debut_had->format('d/m/Y') }}
            </div>
            <div class="info-item">
                <span class="info-label">Date fin HAD :</span>
                {{ $cr->date_fin_had->format('d/m/Y') }}
            </div>
            <div class="info-item">
                <span class="info-label">Durée HAD :</span>
                {{ $patient->date_debut_had->diffInDays($cr->date_fin_had) }} jours
            </div>
            <div class="info-item">
                <span class="info-label">Motif de fin :</span>
                <span class="motif-fin motif-{{ $cr->motif_fin }}">
                    {{ $cr->getMotifFinLibelle() }}
                </span>
            </div>
        </div>
    </div>

    <!-- Synthèse clinique -->
    <div class="section">
        <div class="section-title">📋 SYNTHÈSE CLINIQUE</div>
        <div class="section-content">{{ $cr->synthese_clinique }}</div>
    </div>

    <!-- Actes réalisés -->
    <div class="section">
        <div class="section-title">🔧 ACTES RÉALISÉS</div>
        <div class="section-content">{{ $cr->actes_realises }}</div>
    </div>

    <!-- Recommandations de suivi -->
    <div class="section">
        <div class="section-title">💡 RECOMMANDATIONS DE SUIVI</div>
        <div class="section-content">{{ $cr->recommandations_suivi }}</div>
    </div>

    <!-- Correspondants -->
    @if($cr->correspondants && count($cr->correspondants) > 0)
    <div class="section">
        <div class="section-title">👥 CORRESPONDANTS</div>
        <div class="correspondants-list">
            @foreach($cr->correspondants as $correspondant)
            <div class="correspondant-item">
                @if(isset($correspondant['nom']))
                    <strong>{{ $correspondant['nom'] }}</strong>
                    @if(isset($correspondant['profession'])) - {{ $correspondant['profession'] }} @endif
                    @if(isset($correspondant['telephone'])) - 📞 {{ $correspondant['telephone'] }} @endif
                    @if(isset($correspondant['email'])) - ✉️ {{ $correspondant['email'] }} @endif
                @else
                    {{ $correspondant }}
                @endif
            </div>
            @endforeach
        </div>
    </div>
    @endif

    <!-- Signature -->
    <div class="signature">
        <div>Fait à {{ now()->format('d/m/Y') }}</div>
        <div class="signature-line">
            <div>{{ $redacteur->nom }} {{ $redacteur->prenom }}</div>
            <div style="font-size: 10px;">
                @if($redacteur->rpps) RPPS : {{ $redacteur->rpps }} @endif
                {{ $redacteur->fonction ? ucfirst($redacteur->fonction) : '' }}
            </div>
        </div>
    </div>

    <!-- Pied de page -->
    <div class="footer">
        Document généré le {{ now()->format('d/m/Y à H:i') }} - 
        CR Fin HAD n°{{ $cr->id }} - 
        Patient HAD n°{{ $cr->patient_had_id }}
    </div>
</body>
</html>
