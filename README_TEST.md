# 🧪 Script de Test Complet SIH

## 📋 Description

Le script `test_sih_complete.sh` est un outil complet qui :

1. **Démarre automatiquement** le backend Laravel et le frontend React
2. **Teste tous les endpoints** de l'application SIH
3. **Génère un rapport détaillé** des succès et erreurs
4. **Arrête proprement** tous les services à la fin

## 🚀 Utilisation

### Exécution simple
```bash
./test_sih_complete.sh
```

### Prérequis
- PHP 8.1+
- Node.js 16+
- Composer
- npm/yarn
- curl
- SQLite3

## 📊 Endpoints Testés

### ✅ Authentification
- `GET /login` - Page de connexion

### ✅ Patients (5 endpoints)
- `GET /patients` - Liste patients
- `POST /patients` - Création patient
- `GET /patients/{id}` - Détail patient
- `PUT /patients/{id}` - Mise à jour patient
- `DELETE /patients/{id}` - Suppression patient

### ✅ Personnel (5 endpoints)
- `GET /personnel` - Liste personnel
- `POST /personnel` - Création personnel
- `GET /personnel/{id}` - Détail personnel
- `PUT /personnel/{id}` - Mise à jour personnel
- `DELETE /personnel/{id}` - Suppression personnel

### ✅ Services (6 endpoints)
- `GET /services` - Liste services
- `POST /services` - Création service
- `GET /services/{id}` - Détail service
- `PUT /services/{id}` - Mise à jour service
- `DELETE /services/{id}` - Suppression service
- `PATCH /services/{id}/toggle-status` - Toggle statut

### ✅ Médicaments (4 endpoints)
- `GET /medicaments` - Liste médicaments
- `POST /medicaments` - Création médicament
- `PUT /medicaments/{id}` - Mise à jour médicament
- `DELETE /medicaments/{id}` - Suppression médicament

### ✅ Et plus encore...
- Catégories médicaments
- Fournisseurs
- Laboratoire
- Imagerie
- Types d'examens
- Modalités imagerie
- Lits
- Occupations
- Tournées
- Anomalies
- Admin Users/Roles
- Dashboard

**Total : 73+ endpoints testés**

## 📈 Rapport de Test

Le script génère :
- **Affichage console** en temps réel avec codes couleur
- **Fichier log** `test_results.log` avec détails complets
- **Statistiques finales** (succès/erreurs)
- **Messages d'erreur détaillés** pour chaque échec

## 🔧 Fonctionnalités

### Gestion automatique des processus
- Démarrage backend Laravel sur port 8000
- Démarrage frontend React sur port 5173
- Attente que les services soient prêts
- Arrêt propre de tous les processus

### Validation des réponses
- Vérification des codes HTTP attendus
- Validation du contenu des réponses
- Test des contraintes de base de données
- Gestion des erreurs avec messages détaillés

### Sécurité
- Arrêt automatique en cas d'erreur
- Nettoyage des processus résiduels
- Gestion des signaux (CTRL+C)

## 📋 Exemple de sortie

```
==========================================
🏥 SCRIPT DE TEST COMPLET SIH
==========================================
Début: 2024-01-15 10:30:00

[INFO] Vérification des dépendances...
[SUCCESS] PHP est installé
[SUCCESS] npm est installé
[SUCCESS] curl est installé

[INFO] Démarrage du backend Laravel...
[SUCCESS] Backend Laravel est prêt!

[INFO] Démarrage du frontend React...
[SUCCESS] Frontend React est prêt!

[INFO] Tests des endpoints Patients...
[SUCCESS] Liste des patients - Status: 200
[SUCCESS] Création patient - Status: 302

[INFO] Tests des endpoints Personnel...
[SUCCESS] Liste du personnel - Status: 200
[SUCCESS] Création personnel - Status: 302

==========================================
RÉSULTATS DES TESTS
==========================================
🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!
✅ Endpoints testés: 73
❌ Erreurs: 0

[INFO] Rapport détaillé disponible dans: test_results.log
[INFO] Test terminé à: 2024-01-15 10:35:00
```

## 🐛 Gestion des Erreurs

En cas d'échec, le script affiche :
- **Code HTTP** reçu vs attendu
- **Corps de la réponse** d'erreur
- **Description** de l'endpoint testé
- **Message** explicatif de l'erreur

## 📝 Logs

Le fichier `test_results.log` contient :
- Timestamp de chaque test
- Détails des requêtes/réponses
- Messages d'erreur complets
- Statistiques finales

## 🔄 Personnalisation

Pour modifier les tests :
1. Éditer le script `test_sih_complete.sh`
2. Ajouter/modifier les appels `test_endpoint()`
3. Adapter les données de test si nécessaire

## 🚨 Notes importantes

- Le script doit être exécuté depuis le répertoire du projet
- Les ports 8000 et 5173 doivent être disponibles
- La base de données SQLite doit être accessible
- Le script peut prendre 5-10 minutes pour s'exécuter complètement

---

**Prêt à tester votre projet SIH ? Lancez simplement :**
```bash
./test_sih_complete.sh
```
