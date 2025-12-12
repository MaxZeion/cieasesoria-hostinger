#!/bin/bash
# ============================================
# CIE Asesoría - Local Development Setup
# ============================================

set -e

echo "🚀 CIE Asesoría - Configuración de Entorno Local"
echo "================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Check mkcert
echo -e "\n${YELLOW}1. Verificando mkcert...${NC}"
if command -v mkcert &> /dev/null; then
    echo -e "${GREEN}✅ mkcert instalado${NC}"
else
    echo -e "${RED}❌ mkcert no está instalado. Instálalo con: brew install mkcert${NC}"
    exit 1
fi

# 2. Install mkcert CA (if not already)
echo -e "\n${YELLOW}2. Instalando CA de mkcert en el sistema...${NC}"
mkcert -install
echo -e "${GREEN}✅ CA instalada${NC}"

# 3. Generate certificates (if not exist)
echo -e "\n${YELLOW}3. Verificando certificados SSL...${NC}"
if [ -f ".docker/traefik/certs/local-cert.pem" ]; then
    echo -e "${GREEN}✅ Certificados ya existen${NC}"
else
    echo "Generando certificados..."
    mkdir -p .docker/traefik/certs
    mkcert -cert-file .docker/traefik/certs/local-cert.pem \
           -key-file .docker/traefik/certs/local-key.pem \
           "cieasesoria.test" "*.cieasesoria.test"
    echo -e "${GREEN}✅ Certificados generados${NC}"
fi

# 4. Hosts file check
echo -e "\n${YELLOW}4. Verificando archivo /etc/hosts...${NC}"
HOSTS_ENTRIES="127.0.0.1 cieasesoria.test www.cieasesoria.test zeion.cieasesoria.test canaldenuncias.cieasesoria.test"

if grep -q "cieasesoria.test" /etc/hosts; then
    echo -e "${GREEN}✅ Entradas de hosts ya configuradas${NC}"
else
    echo -e "${YELLOW}⚠️  Necesitas añadir las siguientes líneas a /etc/hosts:${NC}"
    echo ""
    echo "    $HOSTS_ENTRIES"
    echo ""
    echo -e "${YELLOW}Ejecuta este comando (requiere contraseña de administrador):${NC}"
    echo ""
    echo "    echo '$HOSTS_ENTRIES' | sudo tee -a /etc/hosts"
    echo ""
    read -p "¿Quieres que lo haga automáticamente? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "$HOSTS_ENTRIES" | sudo tee -a /etc/hosts
        echo -e "${GREEN}✅ Entradas añadidas a /etc/hosts${NC}"
    fi
fi

# 5. Summary
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}✅ Configuración completada${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Para iniciar el entorno de desarrollo:"
echo ""
echo "    docker compose up -d"
echo ""
echo "URLs disponibles:"
echo "    🌐 Web:        https://www.cieasesoria.test"
echo "    ⚙️  Directus:   https://zeion.cieasesoria.test"
echo "    📢 GlobaLeaks: https://canaldenuncias.cieasesoria.test"
echo "    📊 Traefik:    http://localhost:8080"
echo ""
