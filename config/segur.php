<?php

return [
    // Configuration PSC (Carte Professionnelle de Santé)
    'psc' => [
        'environment' => env('PSC_ENVIRONMENT', 'bac'), // bac, recette, production
        'issuer' => env('PSC_ISSUER'),
        'client_id' => env('PSC_CLIENT_ID'),
        'client_secret' => env('PSC_CLIENT_SECRET'),
        'redirect_uri' => env('PSC_REDIRECT_URI'),
        'scopes' => 'openid profile esante_liste_organismes esante_liste_professionnels esante_donnees_identite esante_donnees_identite_sans_photo',
        'authorization_endpoint' => 'https://auth.esante.gouv.fr/auth',
        'token_endpoint' => 'https://auth.esante.gouv.fr/token',
        'userinfo_endpoint' => 'https://auth.esante.gouv.fr/userinfo',
        'logout_endpoint' => 'https://auth.esante.gouv.fr/logout',
    ],

    // Configuration INSi (Indice National de Santé)
    'insi' => [
        'wsdl_url' => env('INSI_WSDL_URL'),
        'cert_path' => env('INSI_CERT_PATH'),
        'cert_passphrase' => env('INSI_CERT_PASSPHRASE'),
        'timeout' => 30, // secondes
        'retry_attempts' => 3,
    ],

    // Configuration MSSanté
    'mssante' => [
        'operateur' => env('MSSANTE_OPERATEUR'),
        'domain' => env('MSSANTE_DOMAIN', 'mon-etablissement.mssante.fr'),
        'smtp_port' => 587,
        'smtp_encryption' => 'tls',
        'imap_port' => 993,
        'imap_encryption' => 'ssl',
    ],

    // Configuration DMP (Dossier Médical Partagé)
    'dmp' => [
        'mode' => env('DMP_MODE', 'mhd'), // mhd, mdp
        'base_url' => env('DMP_BASE_URL'),
        'cert_path' => env('DMP_CERT_PATH'),
        'finess' => env('DMP_FINESS'),
        'timeout' => 60, // secondes
        'retry_attempts' => 3,
    ],

    // Configuration générale
    'storage_path' => storage_path('app/segur'),
    'audit_enabled' => env('SEGUR_AUDIT_ENABLED', true),
];
