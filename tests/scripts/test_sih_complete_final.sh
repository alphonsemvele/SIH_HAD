#!/bin/bash

# Script de test SIH complet avec création d'utilisateur et authentification
# Crée l'utilisateur, s'authentifie, puis teste tous les endpoints

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BACKEND_PORT=8000
PROJECT_DIR="/home/aymeric/new-project-laravel-3"
LOG_FILE="$PROJECT_DIR/test_final_results.log"
OPERATIONS_LOG="$PROJECT_DIR/final_operations.log"
ERROR_COUNT=0
SUCCESS_COUNT=0

# Identifiants
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password"

# Cookies pour maintenir la session
COOKIE_FILE="$PROJECT_DIR/final_cookies.txt"

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
    
    # Nettoyer les processus PHP restants
    pkill -f "php artisan serve" 2>/dev/null || true
    
    # Nettoyer les cookies
    rm -f "$COOKIE_FILE"
    
    log_info "Nettoyage terminé"
}

# Gestionnaire de sortie
trap cleanup EXIT INT TERM

# Fonction pour attendre que le service soit prêt
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

# Fonction pour créer l'utilisateur de test
create_test_user() {
    log_info "Création de l'utilisateur de test..."
    
    # Utiliser php artisan tinker pour créer l'utilisateur
    php artisan tinker <<EOF
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Supprimer l'utilisateur s'il existe déjà
User::where('email', '$TEST_EMAIL')->delete();

// Créer le nouvel utilisateur avec les bons champs
\$user = User::create([
    'name' => 'Test',
    'email' => '$TEST_EMAIL',
    'password' => Hash::make('$TEST_PASSWORD'),
    'telephone' => '697123456',
    'fonction' => 'medecin',
    'statut' => 'actif',
    'matricule' => 'MED-001'
]);

echo "Utilisateur créé avec ID: " . \$user->id . PHP_EOL;
echo "Email: " . \$user->email . PHP_EOL;
echo "Statut: " . \$user->statut . PHP_EOL;
echo "Fonction: " . \$user->fonction . PHP_EOL;
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Utilisateur de test créé avec succès"
        return 0
    else
        log_error "Erreur lors de la création de l'utilisateur"
        return 1
    fi
}

# Fonction pour s'authentifier avec curl
authenticate() {
    log_info "Authentification avec $TEST_EMAIL..."
    
    # Nettoyer les cookies existants
    rm -f "$COOKIE_FILE"
    
    # 1. Récupérer la page de login
    login_page=$(curl -s -c "$COOKIE_FILE" "http://localhost:$BACKEND_PORT/login")
    
    # 2. Extraire le token CSRF (méthode plus robuste)
    csrf_token=$(echo "$login_page" | grep -o '<input[^>]*name="_token"[^>]*value="[^"]*' | sed 's/.*value="\([^"]*\)".*/\1/' | head -1)
    
    if [ -z "$csrf_token" ]; then
        log_warning "Token CSRF non trouvé, tentative avec session web"
    fi
    
    # 3. Envoyer la requête d'authentification
    if [ ! -z "$csrf_token" ]; then
        auth_response=$(curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
            -X POST "http://localhost:$BACKEND_PORT/login" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "email=$TEST_EMAIL&password=$TEST_PASSWORD&_token=$csrf_token" \
            -L -w "%{http_code}")
    else
        auth_response=$(curl -s -b "$COOKIE_FILE" -c "$COOKIE_FILE" \
            -X POST "http://localhost:$BACKEND_PORT/login" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "email=$TEST_EMAIL&password=$TEST_PASSWORD" \
            -L -w "%{http_code}")
    fi
    
    # 4. Vérifier le statut HTTP
    http_code=$(echo "$auth_response" | tail -c 3)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "302" ]; then
        log_success "Authentification réussie! (Status: $http_code)"
        
        # 5. Vérifier qu'on est bien authentifié
        test_response=$(curl -s -b "$COOKIE_FILE" "http://localhost:$BACKEND_PORT/patients" -w "%{http_code}" | tail -c 3)
        
        if [ "$test_response" = "200" ]; then
            log_success "Session authentifiée confirmée!"
            return 0
        else
            log_warning "Authentification OK mais accès non confirmé (Status: $test_response)"
            return 1
        fi
    else
        log_error "Échec de l'authentification (Status: $http_code)"
        return 1
    fi
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
        response=$(curl -s -b "$COOKIE_FILE" -w "\n%{http_code}" -X GET "$url" \
            -H "Accept: application/json" \
            -H "X-Requested-With: XMLHttpRequest" 2>/dev/null)
    else
        response=$(curl -s -b "$COOKIE_FILE" -w "\n%{http_code}" -X "$method" "$url" \
            -H "Accept: application/json" \
            -H "Content-Type: application/json" \
            -H "X-Requested-With: XMLHttpRequest" \
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
echo "🔐 SCRIPT DE TEST SIH COMPLET FINAL"
echo "=========================================="
echo "Début: $(date)"
echo "Utilisateur: $TEST_EMAIL"
echo ""

# Initialisation des fichiers de log
echo "Test SIH Final - $(date)" > "$LOG_FILE"
echo "==========================================" >> "$LOG_FILE"
echo "Opérations SIH Final - $(date)" > "$OPERATIONS_LOG"
echo "==========================================" >> "$OPERATIONS_LOG"

cd "$PROJECT_DIR"

# Vérifier les dépendances
log_info "Vérification des dépendances..."

if ! command -v php &> /dev/null; then
    log_error "PHP n'est pas installé"
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

# Démarrage du backend
log_info "Démarrage du backend Laravel..."
php artisan serve --host=0.0.0.0 --port=$BACKEND_PORT > /dev/null 2>&1 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
if ! wait_for_service "http://localhost:$BACKEND_PORT" "Backend Laravel"; then
    log_error "Impossible de démarrer le backend"
    exit 1
fi

# Créer l'utilisateur de test
if ! create_test_user; then
    log_error "Impossible de créer l'utilisateur de test"
    exit 1
fi

# S'authentifier
if ! authenticate; then
    log_error "Impossible de s'authentifier"
    exit 1
fi

echo ""
log_info "Démarrage des tests des endpoints authentifiés..."
echo "=========================================="

# Tests Patients
log_info "Tests des endpoints Patients..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/patients" "" "Liste des patients" 200

# Tests Personnel
log_info "Tests des endpoints Personnel..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/personnel" "" "Liste du personnel" 200

# Tests Services
log_info "Tests des endpoints Services..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/services" "" "Liste des services" 200

# Tests Médicaments
log_info "Tests des endpoints Médicaments..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/medicaments" "" "Liste des médicaments" 200

# Tests Catégories Médicaments
log_info "Tests des endpoints Catégories Médicaments..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/categories" "" "Liste des catégories" 200

# Tests Fournisseurs
log_info "Tests des endpoints Fournisseurs..."

test_endpoint "GET" "http://localhost:$BACKEND_PORT/fournisseurs" "" "Liste des fournisseurs" 200

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
echo "RÉSULTATS FINAUX DES TESTS"
echo "=========================================="

# Affichage des résultats
if [ $ERROR_COUNT -eq 0 ]; then
    log_success "🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!"
    log_success "✅ Endpoints testés: $SUCCESS_COUNT"
    log_success "❌ Erreurs: $ERROR_COUNT"
    echo ""
    echo -e "${GREEN}🏥 Le projet SIH est 100% fonctionnel !${NC}"
else
    log_error "❌ $ERROR_COUNT TEST(S) ÉCHOUÉ(S)"
    log_warning "✅ Endpoints réussis: $SUCCESS_COUNT"
    log_error "❌ Endpoints échoués: $ERROR_COUNT"
fi

echo ""
log_info "Rapport détaillé disponible dans: $LOG_FILE"
log_info "Journal des opérations disponible dans: $OPERATIONS_LOG"

echo ""
log_info "Test terminé à: $(date)"

# Le cleanup sera appelé automatiquement par trap

exit $ERROR_COUNT
