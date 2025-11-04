#!/bin/bash

# =========================================
# Script para parar Backend e Frontend
# Tutor Educacional com IA
# =========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}🛑 Parando servidores...${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo ""

# Função para matar processos em uma porta
kill_port() {
    local port=$1
    local name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}►${NC} Parando $name (porta $port)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
        
        if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}  ✓${NC} $name parado"
        else
            echo -e "${RED}  ✗${NC} Falha ao parar $name"
        fi
    else
        echo -e "${GREEN}►${NC} $name já está parado"
    fi
}

# Parar Backend (porta 8000)
kill_port 8000 "Backend (Django)"

# Parar Frontend (porta 8080)
kill_port 8080 "Frontend (Vite)"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Todos os servidores foram parados${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
