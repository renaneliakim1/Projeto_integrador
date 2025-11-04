#!/bin/bash

# =========================================
# Script para iniciar Backend e Frontend
# Tutor Educacional com IA
# =========================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório base do projeto
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/Frontend"
VENV_PATH="$BASE_DIR/.venv/bin/activate"

# Função para imprimir mensagens
print_msg() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════╗"
echo "║                                                ║"
echo "║        🎓 TUTOR EDUCACIONAL COM IA 🤖         ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se os diretórios existem
print_msg "Verificando estrutura do projeto..."

if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Diretório backend não encontrado!"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Diretório Frontend não encontrado!"
    exit 1
fi

if [ ! -f "$VENV_PATH" ]; then
    print_error "Ambiente virtual Python não encontrado em .venv/"
    print_warning "Execute: python -m venv .venv"
    exit 1
fi

print_success "Estrutura do projeto verificada"
echo ""

# Array para armazenar PIDs dos processos
declare -a PIDS

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    print_msg "Parando servidores..."
    
    for pid in "${PIDS[@]}"; do
        if ps -p $pid > /dev/null 2>&1; then
            kill -TERM $pid 2>/dev/null || kill -9 $pid 2>/dev/null
        fi
    done
    
    # Matar processos nas portas específicas (backup)
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    
    print_success "Servidores parados"
    echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
    exit 0
}

# Capturar sinais para cleanup
trap cleanup SIGINT SIGTERM EXIT

# Verificar se as portas estão livres
print_msg "Verificando portas..."

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Porta 8000 já está em uso. Liberando..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Porta 8080 já está em uso. Liberando..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

print_success "Portas 8000 e 8080 disponíveis"
echo ""

# =========================================
# BACKEND (Django)
# =========================================
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
print_msg "Iniciando Backend (Django)..."
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

cd "$BACKEND_DIR"

# Ativar ambiente virtual e iniciar servidor
(
    source "$VENV_PATH"
    python manage.py runserver 2>&1 | while IFS= read -r line; do
        echo -e "${GREEN}[Backend]${NC} $line"
    done
) &

BACKEND_PID=$!
PIDS+=($BACKEND_PID)

# Aguardar backend iniciar
print_msg "Aguardando backend inicializar..."
sleep 5

# Verificar se backend está rodando
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    print_error "Falha ao iniciar o backend!"
    exit 1
fi

print_success "Backend rodando (PID: $BACKEND_PID)"
echo ""

# =========================================
# FRONTEND (React + Vite)
# =========================================
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
print_msg "Iniciando Frontend (React + Vite)..."
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

cd "$FRONTEND_DIR"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    print_warning "node_modules não encontrado. Instalando dependências..."
    npm install
fi

# Iniciar servidor frontend
(
    npm run dev 2>&1 | while IFS= read -r line; do
        echo -e "${BLUE}[Frontend]${NC} $line"
    done
) &

FRONTEND_PID=$!
PIDS+=($FRONTEND_PID)

# Aguardar frontend iniciar
print_msg "Aguardando frontend inicializar..."
sleep 5

# Verificar se frontend está rodando
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    print_error "Falha ao iniciar o frontend!"
    cleanup
    exit 1
fi

print_success "Frontend rodando (PID: $FRONTEND_PID)"
echo ""

# =========================================
# INFORMAÇÕES FINAIS
# =========================================
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                ║${NC}"
echo -e "${GREEN}║            ✅ PROJETO INICIADO COM SUCESSO!    ║${NC}"
echo -e "${GREEN}║                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📌 URLs de Acesso:${NC}"
echo -e "   ${GREEN}►${NC} Frontend:        ${BLUE}http://localhost:8080${NC}"
echo -e "   ${GREEN}►${NC} Backend API:     ${BLUE}http://localhost:8000${NC}"
echo -e "   ${GREEN}►${NC} Admin Django:    ${BLUE}http://localhost:8000/admin${NC}"
echo -e "   ${GREEN}►${NC} API Docs:        ${BLUE}http://localhost:8000/swagger${NC}"
echo ""
echo -e "${YELLOW}⚙️  Processos:${NC}"
echo -e "   ${GREEN}►${NC} Backend PID:     ${BACKEND_PID}"
echo -e "   ${GREEN}►${NC} Frontend PID:    ${FRONTEND_PID}"
echo ""
echo -e "${YELLOW}⚠️  Controles:${NC}"
echo -e "   ${GREEN}►${NC} Para parar: pressione ${RED}Ctrl+C${NC}"
echo -e "   ${GREEN}►${NC} Logs em tempo real abaixo"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📋 Logs:${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo ""

# Manter o script rodando e mostrando logs
wait
