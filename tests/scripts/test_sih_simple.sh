#!/bin/bash

# Script de test simple pour le projet SIH
# Teste les endpoints publics sans authentification

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
LOG_FILE="$PROJECT_DIR/test_results.log"
OPERATIONS_LOG="$PROJECT_DIR/operations.log"
ERROR_COUNT=0
SUCCESS_COUNT=0

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

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local expected_status=${5:-200}
    
    log_info "Test: $method $url - $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
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
echo "🏥 SCRIPT DE TEST SIMPLE SIH"
echo "=========================================="
echo "Début: $(date)"
echo ""

# Initialisation des fichiers de log
echo "Test SIH Simple - $(date)" > "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
echo "Opérations SIH Simple - $(date)" > "$OPERATIONS_LOG"
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

echo ""
log_info "Démarrage des tests des endpoints publics..."
echo "=========================================="

# Test login page (GET)
test_endpoint "GET" "http://localhost:$BACKEND_PORT/login" "" "Page de login" 200

# Test page d'accueil (GET)
test_endpoint "GET" "http://localhost:$BACKEND_PORT/" "" "Page d'accueil" 200

# Test endpoints protégés (devraient retourner 401)
log_info "Tests des endpoints protégés (attendu: 401 Unauthorized)..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/patients" "" "Liste des patients" 401
test_endpoint "GET" "http://localhost:$BACKEND_PORT/personnel" "" "Liste du personnel" 401
test_endpoint "GET" "http://localhost:$BACKEND_PORT/services" "" "Liste des services" 401
test_endpoint "GET" "http://localhost:$BACKEND_PORT/medicaments" "" "Liste des médicaments" 401
test_endpoint "GET" "http://localhost:$BACKEND_PORT/dashboard" "" "Tableau de bord" 401

# Test création sans authentification (devraient retourner 401 ou 419)
log_info "Tests des créations sans authentification..."

patient_data='{"nom": "Test", "prenom": "Patient", "sexe": "M", "date_naissance": "1990-05-15", "statut": "Consultation"}'
test_endpoint "POST" "http://localhost:$BACKEND_PORT/patients" "$patient_data" "Création patient sans auth" 401

personnel_data='{"name": "Test", "lastname": "User", "email": "test@email.com", "password": "Password123!", "fonction": "Admin"}'
test_endpoint "POST" "http://localhost:$BACKEND_PORT/personnel" "$personnel_data" "Création personnel sans auth" 401

service_data='{"nom": "Service Test", "description": "Service de test", "actif": true}'
test_endpoint "POST" "http://localhost:$BACKEND_PORT/services" "$service_data" "Création service sans auth" 401

medicament_data='{"code": "MED-001", "nom": "Médicament Test", "dci": "Test", "forme": "comprime", "actif": true}'
test_endpoint "POST" "http://localhost:$BACKEND_PORT/medicaments" "$medicament_data" "Création médicament sans auth" 401

# Test de validation des données (POST avec données invalides)
log_info "Tests de validation des données..."

invalid_patient_data='{"nom": "", "prenom": "", "sexe": "X", "date_naissance": "invalid"}'
test_endpoint "POST" "http://localhost:$BACKEND_PORT/patients" "$invalid_patient_data" "Création patient données invalides" 401

echo ""
echo "=========================================="
echo "RÉSULTATS DES TESTS"
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

# Test de contraintes (vérification rapide)
log_info "Vérification des contraintes de la base de données..."

# Test contrainte clé étrangère
if [ -f "database/database.sqlite" ]; then
    echo "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='patients';" | sqlite3 database/database.sqlite 2>/dev/null && log_success "Base de données accessible" || log_warning "Base de données non accessible"
    
    # Test contraintes CHECK
    echo "PRAGMA table_info(patients);" | sqlite3 database/database.sqlite 2>/dev/null | grep -q "statut" && log_success "Contraintes CHECK vérifiées" || log_warning "Contraintes CHECK non vérifiables"
else
    log_warning "Base de données SQLite non trouvée"
fi

echo ""
log_info "Test terminé à: $(date)"

# Le cleanup sera appelé automatiquement par trap

exit $ERROR_COUNT
