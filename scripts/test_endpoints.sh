#!/usr/bin/env bash
# test_endpoints.sh — Audit complet des endpoints API SIH/HAD
# Teste chaque endpoint utilisé par le mobile et rapporte les résultats.
# Usage: ./scripts/test_endpoints.sh [BASE_URL]

set +e  # NE PAS sortir au premier echec — on continue tous les tests

BASE_URL="${1:-http://localhost:8000}"
LOGIN_EMAIL="infirmier@sih.local"
LOGIN_PASSWORD="demo123"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;37m'
NC='\033[0m'

# Compteurs
PASS=0
FAIL=0
SKIP=0
RESULTS=()

# Fichier temporaire pour les réponses
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# ------------------------------------------------------------------
# Fonction utilitaire test_endpoint
# Args: NAME METHOD URL [DATA] [EXPECTED_STATUS] [CONTENT_TYPE_CHECK]
# ------------------------------------------------------------------
test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local data="${4:-}"
    local expected="${5:-200}"
    local content_check="${6:-}"
    local extra_headers="${7:-}"

    local outfile="$TMP_DIR/resp_$RANDOM.txt"
    local headers_file="$TMP_DIR/headers_$RANDOM.txt"

    # Build curl command
    local curl_args=(-s -o "$outfile" -D "$headers_file" -w "%{http_code}|%{content_type}|%{size_download}|%{time_total}")
    curl_args+=(-X "$method")
    curl_args+=(-H "Accept: application/json")

    if [ -n "$TOKEN" ]; then
        curl_args+=(-H "Authorization: Bearer $TOKEN")
    fi

    if [ -n "$extra_headers" ]; then
        # On split par ; (semicolon)
        IFS=';' read -ra HEADERS <<< "$extra_headers"
        for h in "${HEADERS[@]}"; do
            curl_args+=(-H "$h")
        done
    fi

    if [ -n "$data" ] && [ "$method" != "GET" ]; then
        curl_args+=(-H "Content-Type: application/json")
        curl_args+=(-d "$data")
    fi

    curl_args+=("$BASE_URL$url")

    local result
    result=$(curl "${curl_args[@]}" 2>&1)
    local status content_type size time
    IFS='|' read -r status content_type size time <<< "$result"

    # Évaluation
    local pass=false
    local reason=""
    if [[ "$expected" == *"|"* ]]; then
        # Multiple statuts attendus (ex: "200|201|204")
        if [[ "|$expected|" == *"|$status|"* ]]; then
            pass=true
        fi
    elif [ "$status" = "$expected" ]; then
        pass=true
    fi

    # Vérif content-type si demandé
    if $pass && [ -n "$content_check" ]; then
        if [[ "$content_type" != *"$content_check"* ]]; then
            pass=false
            reason="Content-Type=$content_type (attendu: $content_check)"
        fi
    fi

    # Affichage
    local status_color=$RED
    [ "$pass" = true ] && status_color=$GREEN

    printf "  ${status_color}%-4s${NC} %-6s %-50s ${GRAY}HTTP %s • %sB • %.2fs${NC}\n" \
        "$([ "$pass" = true ] && echo "✓" || echo "✗")" \
        "$method" \
        "$url" \
        "$status" \
        "$size" \
        "$time"

    if [ "$pass" = true ]; then
        PASS=$((PASS + 1))
        RESULTS+=("PASS|$name|$method $url|HTTP $status")
    else
        FAIL=$((FAIL + 1))
        # Extraire le message d'erreur
        local err_msg=""
        if [ -s "$outfile" ]; then
            err_msg=$(head -c 300 "$outfile" | tr -d '\n' | head -c 200)
        fi
        if [ -z "$reason" ]; then
            reason="HTTP $status (attendu $expected)"
        fi
        printf "       ${RED}↳ %s${NC}\n" "$reason"
        if [ -n "$err_msg" ]; then
            printf "       ${GRAY}↳ Body: %s${NC}\n" "${err_msg:0:150}"
        fi
        RESULTS+=("FAIL|$name|$method $url|$reason | $err_msg")
    fi
}

# ------------------------------------------------------------------
# Fonction skip (endpoint non implémenté/connu)
# ------------------------------------------------------------------
skip_endpoint() {
    local name="$1"
    local reason="$2"
    SKIP=$((SKIP + 1))
    printf "  ${YELLOW}⊘${NC} %s ${GRAY}(skip: %s)${NC}\n" "$name" "$reason"
    RESULTS+=("SKIP|$name||$reason")
}

# ==================================================================
# DÉBUT DES TESTS
# ==================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   AUDIT ENDPOINTS SIH/HAD — Mobile ↔ Backend                 ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║   Base URL: %-49s║\n" "$BASE_URL"
printf "║   Date    : %-49s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ------------------------------------------------------------------
# 0. Health check
# ------------------------------------------------------------------
echo -e "${BLUE}── 0. Health check${NC}"
test_endpoint "health_up" "GET" "/up" "" "200"
echo ""

# ------------------------------------------------------------------
# 1. Auth — login (récupère le token pour la suite)
# ------------------------------------------------------------------
echo -e "${BLUE}── 1. Authentification${NC}"

LOGIN_BODY="{\"email\":\"$LOGIN_EMAIL\",\"password\":\"$LOGIN_PASSWORD\"}"
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$LOGIN_BODY")

TOKEN=$(echo "$LOGIN_RESP" | grep -oP '"token"\s*:\s*"\K[^"]+' | head -1)

if [ -n "$TOKEN" ]; then
    printf "  ${GREEN}✓${NC} POST   /api/login                                    ${GRAY}→ Token obtenu${NC}\n"
    PASS=$((PASS + 1))
    RESULTS+=("PASS|auth_login|POST /api/login|Token: ${TOKEN:0:20}...")
else
    printf "  ${RED}✗${NC} POST   /api/login                                    ${RED}↳ Échec login: %s${NC}\n" "${LOGIN_RESP:0:150}"
    FAIL=$((FAIL + 1))
    RESULTS+=("FAIL|auth_login|POST /api/login|Pas de token. Réponse: ${LOGIN_RESP:0:150}")
    echo ""
    echo -e "${RED}⚠️  Sans token, impossible de continuer.${NC}"
    echo ""
    echo -e "${YELLOW}Vérifie:${NC}"
    echo "  1. Le serveur tourne ($BASE_URL/up)"
    echo "  2. L'utilisateur $LOGIN_EMAIL existe (mot de passe: $LOGIN_PASSWORD)"
    echo ""
    exit 1
fi

# Test endpoints auth nécessitant token
test_endpoint "auth_me" "GET" "/api/me" "" "200"

echo ""

# ------------------------------------------------------------------
# 2. Tournées (workflow infirmier)
# ------------------------------------------------------------------
echo -e "${BLUE}── 2. Tournées HAD${NC}"

test_endpoint "tournees_list" "GET" "/api/tournees" "" "200"

# Récupère un tournee_id
TOURNEE_ID=$(curl -s -X GET "$BASE_URL/api/tournees" \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | \
    grep -oP '"id":\s*\K[0-9]+' | head -1)

if [ -n "$TOURNEE_ID" ]; then
    test_endpoint "tournee_show" "GET" "/api/tournees/$TOURNEE_ID" "" "200"
    test_endpoint "tournee_visites" "GET" "/api/tournees/$TOURNEE_ID/visites" "" "200"
else
    skip_endpoint "tournee_show" "Pas de tournée en DB"
    skip_endpoint "tournee_visites" "Pas de tournée en DB"
fi

echo ""

# ------------------------------------------------------------------
# 3. Patients
# ------------------------------------------------------------------
echo -e "${BLUE}── 3. Patients${NC}"

test_endpoint "patients_list" "GET" "/api/patients" "" "200"
test_endpoint "patients_map" "GET" "/api/patients/map" "" "200"
test_endpoint "patients_geo" "GET" "/api/patients/geolocalises" "" "200"

PATIENT_ID=$(curl -s -X GET "$BASE_URL/api/patients" \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | \
    grep -oP '"id":\s*\K[0-9]+' | head -1)

if [ -n "$PATIENT_ID" ]; then
    test_endpoint "patient_show" "GET" "/api/patients/$PATIENT_ID" "" "200"
    test_endpoint "patient_dossier" "GET" "/api/patients/$PATIENT_ID/dossier-medical" "" "200"
fi

echo ""

# ------------------------------------------------------------------
# 4. QR Codes & Réalisation visite (Phase 3 critique)
# ------------------------------------------------------------------
echo -e "${BLUE}── 4. QR Codes & Réalisation visite (CRITIQUE)${NC}"

# Récupérer un QR actif (force le créneau pour qu'il soit valide)
QR_UUID=$(php -r "
require '/home/aymeric/new-project-laravel-3/vendor/autoload.php';
\$app = require '/home/aymeric/new-project-laravel-3/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
\$qr = App\Models\QrCode::where('statut','actif')->first();
if (\$qr) {
    \$qr->update(['creneau_debut' => now()->subMinutes(15), 'creneau_fin' => now()->addMinutes(60)]);
    echo \$qr->uuid;
}
" 2>/dev/null)

if [ -n "$QR_UUID" ]; then
    test_endpoint "qr_preview" "GET" "/api/had/qr-codes/$QR_UUID/preview" "" "200" "image/png"
    test_endpoint "qr_scan" "POST" "/api/had/qr-codes/$QR_UUID/scan" \
        '{"lat":3.84,"lng":11.50,"precision_m":10,"device_info":{"model":"TestSuite"}}' "200"
else
    skip_endpoint "qr_preview" "Pas de QR actif en DB"
    skip_endpoint "qr_scan" "Pas de QR actif en DB"
fi

# Récupérer une visite
VISITE_ID=$(php -r "
require '/home/aymeric/new-project-laravel-3/vendor/autoload.php';
\$app = require '/home/aymeric/new-project-laravel-3/bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
\$v = App\Models\VisiteHad::first();
if (\$v) echo \$v->id;
" 2>/dev/null)

if [ -n "$VISITE_ID" ]; then
    # Test endpoint preuve sur une visite qui DEVRAIT en avoir une (visite_id 2 a un PDF)
    PREUVE_VID=$(php -r "
    require '/home/aymeric/new-project-laravel-3/vendor/autoload.php';
    \$app = require '/home/aymeric/new-project-laravel-3/bootstrap/app.php';
    \$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    \$p = App\Models\PreuveVisite::first();
    if (\$p) echo \$p->visite_had_id;
    " 2>/dev/null)

    if [ -n "$PREUVE_VID" ]; then
        test_endpoint "preuve_pdf" "GET" "/api/had/visites/$PREUVE_VID/preuve" "" "200" "application/pdf"
    else
        skip_endpoint "preuve_pdf" "Aucune preuve générée"
    fi
fi

echo ""

# ------------------------------------------------------------------
# 5. Messagerie
# ------------------------------------------------------------------
echo -e "${BLUE}── 5. Messagerie${NC}"

test_endpoint "conversations_list" "GET" "/api/conversations" "" "200"
test_endpoint "messaging_stats" "GET" "/api/messaging/stats" "" "200"
test_endpoint "users_available_chat" "GET" "/api/users/available-for-chat" "" "200"

echo ""

# ------------------------------------------------------------------
# 6. Planning, Rapports, Alertes (modules secondaires)
# ------------------------------------------------------------------
echo -e "${BLUE}── 6. Modules secondaires${NC}"

test_endpoint "planning_list" "GET" "/api/planning" "" "200"
test_endpoint "alertes_list" "GET" "/api/alertes" "" "200"
test_endpoint "rapports_list" "GET" "/api/rapports" "" "200"
test_endpoint "rapports_types" "GET" "/api/rapports/types" "" "200"
test_endpoint "rapports_stats" "GET" "/api/rapports/stats" "" "200"
test_endpoint "services_list" "GET" "/api/services" "" "200"
test_endpoint "soignants_list" "GET" "/api/soignants" "" "200"
test_endpoint "zones_visites" "GET" "/api/zones-visites" "" "200"
test_endpoint "zones_stats" "GET" "/api/zones/statistiques" "" "200"

echo ""

# ------------------------------------------------------------------
# 7. Dashboard
# ------------------------------------------------------------------
echo -e "${BLUE}── 7. Dashboard${NC}"

test_endpoint "dashboard_stats" "GET" "/api/dashboard/stats" "" "200"
test_endpoint "dashboard_tournees" "GET" "/api/dashboard/tournees-actives" "" "200"

echo ""

# ------------------------------------------------------------------
# 8. Logout (en dernier — invalide le token)
# ------------------------------------------------------------------
echo -e "${BLUE}── 8. Logout${NC}"
test_endpoint "auth_logout" "POST" "/api/logout" "" "200"

# ==================================================================
# RAPPORT FINAL
# ==================================================================

TOTAL=$((PASS + FAIL + SKIP))
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                       RAPPORT FINAL                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
printf "  Total testé : ${BLUE}%d${NC}\n" "$TOTAL"
printf "  ${GREEN}✓ PASS     : %d${NC}\n" "$PASS"
printf "  ${RED}✗ FAIL     : %d${NC}\n" "$FAIL"
printf "  ${YELLOW}⊘ SKIP     : %d${NC}\n" "$SKIP"
echo ""

# Détail des FAIL
if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}── Endpoints en échec ──${NC}"
    for r in "${RESULTS[@]}"; do
        IFS='|' read -r st name endpoint detail <<< "$r"
        if [ "$st" = "FAIL" ]; then
            printf "  ${RED}✗${NC} %s\n    ${GRAY}%s${NC}\n    ${RED}→ %s${NC}\n\n" \
                "$endpoint" "$name" "$detail"
        fi
    done
fi

# Détail des SKIP
if [ "$SKIP" -gt 0 ]; then
    echo -e "${YELLOW}── Endpoints skippés ──${NC}"
    for r in "${RESULTS[@]}"; do
        IFS='|' read -r st name endpoint detail <<< "$r"
        if [ "$st" = "SKIP" ]; then
            printf "  ${YELLOW}⊘${NC} %s ${GRAY}(%s)${NC}\n" "$name" "$detail"
        fi
    done
    echo ""
fi

# Verdict
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}🏆 Tous les endpoints critiques fonctionnent !${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $FAIL endpoint(s) en échec.${NC}"
    exit 1
fi
