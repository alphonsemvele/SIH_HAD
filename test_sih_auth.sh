#!/bin/bash

# Script de test SIH avec authentification
# Utilise les identifiants fournis pour tester tous les endpoints sécurisés

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_PORT=8000
FRONTEND_PORT=5173
PROJECT_DIR="/home/aymeric/new-project-laravel-3"
LOG_FILE="$PROJECT_DIR/test_auth_results.log"
OPERATIONS_LOG="$PROJECT_DIR/auth_operations.log"
ERROR_COUNT=0
SUCCESS_COUNT=0

# Identifiants fournis par l'utilisateur
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password"

# Cookies pour maintenir la session
COOKIE_FILE="$PROJECT_DIR/cookies.txt"

# Fonctions utilitaires
log_operation() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$OPERATIONS_LOG"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
    log_operation "INFO: $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    log_operation "SUCCESS: $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    ERROR_COUNT=$((ERROR_COUNT + 1))
    log_operation "ERROR: $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
    log_operation "WARNING: $1"
}

# Fonction pour arrêter les processus
cleanup() {
    log_info "Arrêt des processus..."
    
    # Arrêter le backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        log_info "Backend arrêté (PID: $BACKEND_PID)"
    fi
    
    # Arrêter le frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log_info "Frontend arrêté (PID: $FRONTEND_PID)"
    fi
    
    # Nettoyer les processus PHP restants
    pkill -f "php artisan serve" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Nettoyer les cookies
    rm -f "$COOKIE_FILE"
    
    log_info "Nettoyage terminé"
}

# Gestionnaire de sortie
trap cleanup EXIT INT TERM

# Fonction pour attendre qu'un service soit prêt
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    log_info "Attente de $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            log_success "$service_name est prêt!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "$service_name n'est pas prêt après $((max_attempts * 2)) secondes"
    return 1
}

# Fonction pour s'authentifier
authenticate() {
    log_info "Authentification avec $TEST_EMAIL..."
    
    # Nettoyer les cookies existants
    rm -f "$COOKIE_FILE"
    
    # Récupérer le token CSRF
    csrf_response=$(curl -s -c "$COOKIE_FILE" "http://localhost:$BACKEND_PORT/login")
    csrf_token=$(echo "$csrf_response" | grep -o 'name="_token"[^>]*value="[^"]*' | sed 's/.*value="\([^"]*\)".*/\1/')
    
    if [ -z "$csrf_token" ]; then
        log_error "Impossible de récupérer le token CSRF"
        return 1
    fi
    
    # S'authentifier avec le token CSRF
    auth_response=$(curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
        -X POST "http://localhost:$BACKEND_PORT/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -H "X-Requested-With: XMLHttpRequest" \
        -d "email=$TEST_EMAIL&password=$TEST_PASSWORD&_token=$csrf_token")
    
    # Vérifier si l'authentification a réussi
    if echo "$auth_response" | grep -q "dashboard\|redirect"; then
        log_success "Authentification réussie!"
        return 0
    else
        log_error "Échec de l'authentification"
        echo "Réponse: $auth_response" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Fonction pour tester un endpoint authentifié
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    
    log_info "Test: $method $url - $description"
    
    # Récupérer un nouveau token CSRF pour les requêtes POST/PUT/DELETE
    if [ "$method" != "GET" ]; then
        csrf_page=$(curl -s -b "$COOKIE_FILE" "http://localhost:$BACKEND_PORT/login")
        csrf_token=$(echo "$csrf_page" | grep -o 'name="_token"[^>]*value="[^"]*' | sed 's/.*value="\([^"]*\)".*/\1/')
        
        if [ -z "$csrf_token" ]; then
            log_warning "Impossible de récupérer le token CSRF pour $method"
        fi
    fi
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X GET "$url" \
            -H "Accept: application/json" \
            -H "X-Requested-With: XMLHttpRequest" 2>/dev/null)
    else
        if [ ! -z "$csrf_token" ]; then
            response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X "$method" "$url" \
                -H "Accept: application/json" \
                -H "Content-Type: application/json" \
                -H "X-Requested-With: XMLHttpRequest" \
                -H "X-CSRF-TOKEN: $csrf_token" \
                -d "$data" 2>/dev/null)
        else
            response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X "$method" "$url" \
                -H "Accept: application/json" \
                -H "Content-Type: application/json" \
                -H "X-Requested-With: XMLHttpRequest" \
                -d "$data" 2>/dev/null)
        fi
    fi
    
    # Séparer le corps et le code HTTP
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        log_success "$description - Status: $http_code"
        return 0
    else
        log_error "$description - Status: $http_code (attendu: $expected_status)"
        echo "Réponse: $body" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Démarrage du script
echo "=========================================="
echo "🔐 SCRIPT DE TEST SIH AUTHENTIFIÉ"
echo "=========================================="
echo "Début: $(date)"
echo "Utilisateur: $TEST_EMAIL"
echo ""

# Initialisation des fichiers de log
echo "Test SIH Auth - $(date)" > "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
echo "Opérations SIH Auth - $(date)" > "$OPERATIONS_LOG"
echo "==========================================" >> "$OPERATIONS_LOG"

cd "$PROJECT_DIR"

# Vérifier les dépendances
log_info "Vérification des dépendances..."

if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

if ! command -v curl &> /dev/null; then
    log_error "curl n'est pas installé"
    exit 1
fi

# Installation des dépendances si nécessaire
if [ ! -d "vendor" ]; then
    log_info "Installation des dépendances PHP..."
    composer install --no-dev --optimize-autoloader
fi

if [ ! -d "node_modules" ]; then
    log_info "Installation des dépendances Node.js..."
    npm install
fi

# Démarrage du backend
log_info "Démarrage du backend Laravel..."
php artisan serve --host=0.0.0.0 --port=$BACKEND_PORT > /dev/null 2>&1 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
if ! wait_for_service "http://localhost:$BACKEND_PORT" "Backend Laravel"; then
    log_error "Impossible de démarrer le backend"
    exit 1
fi

# Démarrage du frontend
log_info "Démarrage du frontend React..."
npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT > /dev/null 2>&1 &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
if ! wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend React"; then
    log_warning "Frontend non disponible (tests backend uniquement)"
fi

# S'authentifier
if ! authenticate; then
    log_error "Impossible de s'authentifier, arrêt des tests"
    exit 1
fi

echo ""
log_info "Démarrage des tests des endpoints authentifiés..."
echo "=========================================="

# Tests Patients
log_info "Tests des endpoints Patients..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/patients" "" "Liste des patients" 200

patient_data='{
    "nom": "Test",
    "prenom": "Patient",
    "sexe": "M",
    "date_naissance": "1990-05-15",
    "telephone": "697123456",
    "email": "test.patient@email.com",
    "statut": "Consultation"
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/patients" "$patient_data" "Création patient" 302

# Tests Personnel
log_info "Tests des endpoints Personnel..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/personnel" "" "Liste du personnel" 200

personnel_data='{
    "name": "Test",
    "lastname": "Personnel",
    "email": "test.personnel@hopital.cm",
    "password": "Password123!",
    "telephone": "698123456",
    "fonction": "medecin",
    "specialite": "Test",
    "statut": "actif"
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/personnel" "$personnel_data" "Création personnel" 302

# Tests Services
log_info "Tests des endpoints Services..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/services" "" "Liste des services" 200

service_data='{
    "nom": "Service Test",
    "description": "Service de test",
    "etage": "1",
    "batiment": "A",
    "telephone": "233123456",
    "capacite_lits": 20,
    "actif": true
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/services" "$service_data" "Création service" 302

# Tests Médicaments
log_info "Tests des endpoints Médicaments..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/medicaments" "" "Liste des médicaments" 200

medicament_data='{
    "code": "MED-TEST-001",
    "nom": "Médicament Test",
    "dci": "Substance Test",
    "forme": "comprime",
    "dosage": "500mg",
    "stock_actuel": 100,
    "stock_minimum": 20,
    "prix_vente": 5000,
    "actif": true
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/medicaments" "$medicament_data" "Création médicament" 302

# Tests Catégories Médicaments
log_info "Tests des endpoints Catégories Médicaments..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/categories" "" "Liste des catégories" 200

categorie_data='{
    "code": "CAT-TEST-001",
    "nom": "Catégorie Test",
    "description": "Catégorie de test",
    "actif": true
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/categories" "$categorie_data" "Création catégorie" 302

# Tests Fournisseurs
log_info "Tests des endpoints Fournisseurs..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/fournisseurs" "" "Liste des fournisseurs" 200

fournisseur_data='{
    "code": "FOUR-TEST-001",
    "nom": "Fournisseur Test",
    "type": "grossiste",
    "telephone": "233987654",
    "email": "contact@fournisseur.cm",
    "actif": true
}'

test_endpoint "POST" "http://localhost:$BACKEND_PORT/fournisseurs" "$fournisseur_data" "Création fournisseur" 302

# Tests Laboratoire
log_info "Tests des endpoints Laboratoire..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/laboratoire" "" "Liste des analyses laboratoire" 200

# Tests Imagerie
log_info "Tests des endpoints Imagerie..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/imagerie" "" "Liste des examens imagerie" 200

# Tests Types Examens
log_info "Tests des endpoints Types Examens..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/type-examens" "" "Liste des types d'examens" 200

# Tests Modalités Imagerie
log_info "Tests des endpoints Modalités Imagerie..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/modalite-imagerie" "" "Liste des modalités imagerie" 200

# Tests Lits
log_info "Tests des endpoints Lits..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/lits" "" "Liste des lits" 200

# Tests Occupations
log_info "Tests des endpoints Occupations..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/lits/occupations" "" "Liste des occupations" 200

# Tests Tournées
log_info "Tests des endpoints Tournées..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/tournees" "" "Liste des tournées" 200

# Tests Anomalies
log_info "Tests des endpoints Anomalies..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/anomalies" "" "Liste des anomalies" 200

# Tests Admin Users
log_info "Tests des endpoints Admin Users..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/admin/users" "" "Liste des utilisateurs admin" 200

# Tests Admin Roles
log_info "Tests des endpoints Admin Roles..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/admin/roles" "" "Liste des rôles admin" 200

# Tests Dashboard
log_info "Tests des endpoints Dashboard..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/dashboard" "" "Tableau de bord" 200

echo ""
echo "=========================================="
echo "RÉSULTATS DES TESTS AUTHENTIFIÉS"
echo "=========================================="

# Affichage des résultats
if [ $ERROR_COUNT -eq 0 ]; then
    log_success "🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!"
    log_success "✅ Endpoints testés: $SUCCESS_COUNT"
    log_success "❌ Erreurs: $ERROR_COUNT"
else
    log_error "❌ $ERROR_COUNT TEST(S) ÉCHOUÉ(S)"
    log_warning "✅ Endpoints réussis: $SUCCESS_COUNT"
    log_error "❌ Endpoints échoués: $ERROR_COUNT"
fi

echo ""
log_info "Rapport détaillé disponible dans: $LOG_FILE"
log_info "Journal des opérations disponible dans: $OPERATIONS_LOG"

# Test de contraintes
log_info "Vérification des contraintes de la base de données..."

if [ -f "database/database.sqlite" ]; then
    echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='patients';" | sqlite3 database/database.sqlite 2>/dev/null && log_success "Base de données accessible" || log_warning "Base de données non accessible"
else
    log_warning "Base de données SQLite non trouvée"
fi

echo ""
log_info "Test terminé à: $(date)"

# Le cleanup sera appelé automatiquement par trap

exit $ERROR_COUNT
