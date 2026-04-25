# PLAN DE TEST DES ENDPOINTS SIH

## 🏥 TESTS PATIENTS

### Création Patient (POST /patients)
```php
// php artisan tinker
use App\Models\Patient;
use App\Http\Requests\PatientStoreRequest;

$patientData = [
    'nom' => 'Dupont',
    'prenom' => 'Jean',
    'sexe' => 'M',
    'date_naissance' => '1990-05-15',
    'lieu_naissance' => 'Douala',
    'nationalite' => 'Camerounaise',
    'telephone' => '697123456',
    'email' => 'jean.dupont@email.com',
    'adresse' => 'Rue des Arts, Douala',
    'ville' => 'Douala',
    'profession' => 'Ingénieur',
    'situation_matrimoniale' => 'Célibataire',
    'groupe_sanguin' => 'O+',
    'allergies' => 'Pénicilline,Arachides',
    'personne_contact_nom' => 'Marie Dupont',
    'personne_contact_telephone' => '697987654',
    'personne_contact_lien' => 'Sœur',
    'statut' => 'Consultation'
];

$patient = Patient::create($patientData);
```

### Test Axios
```javascript
const patientData = {
    nom: 'Dupont',
    prenom: 'Jean',
    sexe: 'M',
    date_naissance: '1990-05-15',
    telephone: '697123456',
    email: 'jean.dupont@email.com',
    statut: 'Consultation'
};

axios.post('/patients', patientData)
    .then(response => console.log('Patient créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 👤 TESTS PERSONNEL

### Création Personnel (POST /personnel)
```php
// php artisan tinker
use App\Models\User;
use App\Models\Service;

$personnelData = [
    'name' => 'Martin',
    'lastname' => 'Sophie',
    'email' => 'sophie.martin@hopital.cm',
    'password' => 'Password123!',
    'telephone' => '698123456',
    'fonction' => 'Médecin',
    'specialite' => 'Cardiologie',
    'service_id' => 1, // Assurez-vous que le service existe
    'date_embauche' => '2023-01-15',
    'statut' => 'actif'
];

$user = User::create($personnelData);
```

### Test Axios
```javascript
const personnelData = {
    name: 'Martin',
    lastname: 'Sophie',
    email: 'sophie.martin@hopital.cm',
    password: 'Password123!',
    telephone: '698123456',
    fonction: 'Médecin',
    specialite: 'Cardiologie',
    service_id: 1,
    date_embauche: '2023-01-15',
    statut: 'actif'
};

axios.post('/personnel', personnelData)
    .then(response => console.log('Personnel créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 💊 TESTS MÉDICAMENTS

### Création Médicament (POST /medicaments)
```php
// php artisan tinker
use App\Models\Medicament;
use App\Models\CategorieMedicament;
use App\Models\Fournisseur;

$medicamentData = [
    'code' => 'MED-001',
    'nom' => 'Paracétamol 500mg',
    'dci' => 'Paracétamol',
    'forme' => 'comprime',
    'dosage' => '500mg',
    'categorie_medicament_id' => 1, // Doit exister
    'stock_actuel' => 100,
    'stock_minimum' => 20,
    'stock_maximum' => 200,
    'prix_achat' => 50,
    'prix_vente' => 100,
    'fournisseur_id' => 1, // Doit exister
    'date_expiration' => '2025-12-31',
    'ordonnance_obligatoire' => false,
    'actif' => true
];

$medicament = Medicament::create($medicamentData);
```

### Test Axios
```javascript
const medicamentData = {
    code: 'MED-001',
    nom: 'Paracétamol 500mg',
    dci: 'Paracétamol',
    forme: 'comprime',
    dosage: '500mg',
    categorie_medicament_id: 1,
    stock_actuel: 100,
    stock_minimum: 20,
    stock_maximum: 200,
    prix_achat: 50,
    prix_vente: 100,
    fournisseur_id: 1,
    date_expiration: '2025-12-31',
    ordonnance_obligatoire: false,
    actif: true
};

axios.post('/medicaments', medicamentData)
    .then(response => console.log('Médicament créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 🏢 TESTS SERVICES

### Création Service (POST /services)
```php
// php artisan tinker
use App\Models\Service;
use App\Models\User;

$serviceData = [
    'nom' => 'Cardiologie',
    'description' => 'Service de cardiologie',
    'chef_service_id' => 1, // Doit exister et être médecin
    'etage' => '2',
    'batiment' => 'A',
    'telephone' => '233123456',
    'email' => 'cardiologie@hopital.cm',
    'capacite_lits' => 30,
    'actif' => true
];

$service = Service::create($serviceData);
```

### Test Axios
```javascript
const serviceData = {
    nom: 'Cardiologie',
    description: 'Service de cardiologie',
    chef_service_id: 1,
    etage: '2',
    batiment: 'A',
    telephone: '233123456',
    email: 'cardiologie@hopital.cm',
    capacite_lits: 30,
    actif: true
};

axios.post('/services', serviceData)
    .then(response => console.log('Service créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 🧪 TESTS LABORATOIRE

### Création Analyse (POST /laboratoire)
```php
// php artisan tinker
use App\Models\AnalyseLaboratoire;
use App\Models\Patient;
use App\Models\TypeExamen;
use App\Models\User;

$analyseData = [
    'patient_id' => 1, // Doit exister
    'type_examen_id' => 1, // Doit exister
    'medecin_prescripteur_id' => 1, // Doit exister
    'consultation_id' => null,
    'urgent' => false,
    'commentaire_medecin' => 'Bilan de routine'
];

$analyse = AnalyseLaboratoire::create($analyseData);
```

### Test Axios
```javascript
const analyseData = {
    patient_id: 1,
    type_examen_id: 1,
    medecin_prescripteur_id: 1,
    urgent: false,
    commentaire_medecin: 'Bilan de routine'
};

axios.post('/laboratoire', analyseData)
    .then(response => console.log('Analyse créée:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 📷 TESTS IMAGERIE

### Création Examen (POST /imagerie)
```php
// php artisan tinker
use App\Models\ExamenImagerie;
use App\Models\Patient;
use App\Models\TypeExamen;
use App\Models\User;

$examenData = [
    'patient_id' => 1, // Doit exister
    'medecin_prescripteur_id' => 1, // Doit exister
    'type_examen_id' => 1, // Doit exister
    'region_anatomique' => 'Thorax',
    'priorite' => 'normal',
    'renseignements_cliniques' => 'Douleur thoracique',
    'contre_indications' => ['grossesse']
];

$examen = ExamenImagerie::create($examenData);
```

### Test Axios
```javascript
const examenData = {
    patient_id: 1,
    medecin_prescripteur_id: 1,
    type_examen_id: 1,
    region_anatomique: 'Thorax',
    priorite: 'normal',
    renseignements_cliniques: 'Douleur thoracique',
    contre_indications: ['grossesse']
};

axios.post('/imagerie', examenData)
    .then(response => console.log('Examen créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 🛏️ TESTS LITS

### Création Lit (POST /lits)
```php
// php artisan tinker
use App\Models\Lit;
use App\Models\Service;

$litData = [
    'service_id' => 1, // Doit exister
    'numero' => '101',
    'chambre' => '101',
    'type' => 'standard',
    'statut' => 'disponible',
    'tarif_journalier' => 15000
];

$lit = Lit::create($litData);
```

### Test Axios
```javascript
const litData = {
    service_id: 1,
    numero: '101',
    chambre: '101',
    type: 'standard',
    statut: 'disponible',
    tarif_journalier: 15000
};

axios.post('/lits', litData)
    .then(response => console.log('Lit créé:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 🏥 TESTS OCCUPATIONS

### Création Occupation (POST /lits/occupations)
```php
// php artisan tinker
use App\Models\OccupationRoom;
use App\Models\Lit;
use App\Models\Patient;
use App\Models\User;

$occupationData = [
    'lit_id' => 1, // Doit exister et être disponible
    'patient_id' => 1, // Doit exister
    'service_id' => 1, // Doit exister
    'medecin_id' => 1, // Doit exister
    'infirmier_id' => 1, // Doit exister
    'date_entree' => now(),
    'diagnostic_principal' => 'Hypertension',
    'motif_admission' => 'Suivi traitement',
    'type_admission' => 'programmée'
];

$occupation = OccupationRoom::create($occupationData);
```

### Test Axios
```javascript
const occupationData = {
    lit_id: 1,
    patient_id: 1,
    service_id: 1,
    medecin_id: 1,
    infirmier_id: 1,
    date_entree: '2024-01-15T10:00:00',
    diagnostic_principal: 'Hypertension',
    motif_admission: 'Suivi traitement',
    type_admission: 'programmée'
};

axios.post('/lits/occupations', occupationData)
    .then(response => console.log('Occupation créée:', response.data))
    .catch(error => console.error('Erreur:', error.response.data));
```

## 🔍 VÉRIFICATION DES CONTRAINTES

### Vérifier les contraintes CHECK SQLite
```sql
-- Vérifier les contraintes de la table patients
PRAGMA foreign_key_list(patients);
PRAGMA table_info(patients);

-- Vérifier les contraintes CHECK
SELECT sql FROM sqlite_master WHERE type='table' AND name='patients';
```

### Test des enums
```php
// Tester les valeurs valides
$validStatuts = ['Hospitalisé', 'Consultation', 'Urgence', 'Sortie'];
$validSexes = ['M', 'F'];
$validGroupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

foreach ($validStatuts as $statut) {
    echo "Statut valide: $statut\n";
}
```

## 🚨 TESTS D'ERREURS

### Test contrainte clé étrangère
```php
// Tenter de créer un patient avec un service_id inexistant
try {
    $patient = Patient::create([
        'nom' => 'Test',
        'prenom' => 'Error',
        'sexe' => 'M',
        'date_naissance' => '1990-01-01',
        'service_id' => 99999 // Service inexistant
    ]);
} catch (\Exception $e) {
    echo "Erreur attendue: " . $e->getMessage();
}
```

### Test contrainte CHECK
```php
// Tenter d'insérer un statut invalide
try {
    $patient = Patient::create([
        'nom' => 'Test',
        'prenom' => 'Invalid',
        'sexe' => 'M',
        'date_naissance' => '1990-01-01',
        'statut' => 'STATUT_INEXISTANT' // Statut invalide
    ]);
} catch (\Exception $e) {
    echo "Erreur attendue: " . $e->getMessage();
}
```

## ✅ SCRIPT DE TEST AUTOMATISÉ

```bash
#!/bin/bash
echo "🧪 Démarrage des tests des endpoints SIH..."

# Test 1: Création patient
echo "📍 Test création patient..."
curl -X POST http://localhost:8000/patients \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Auto",
    "sexe": "M",
    "date_naissance": "1990-01-01",
    "statut": "Consultation"
  }'

# Test 2: Liste patients
echo "📍 Test liste patients..."
curl -X GET http://localhost:8000/patients \
  -H "Accept: application/json"

echo "✅ Tests terminés!"
```
