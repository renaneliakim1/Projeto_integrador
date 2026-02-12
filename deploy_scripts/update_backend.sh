#!/bin/bash
################################################################################
# Script de Atualização Rápida
# Use este script para atualizar o backend após mudanças no código
################################################################################

set -e

echo "🔄 Atualizando aplicação..."
echo "================================================"

# Carregar variáveis de ambiente
if [ -f ~/.env ]; then
    export $(cat ~/.env | grep -v '^#' | xargs)
fi

# Ir para diretório do projeto
cd ~/Projeto_integrador

# Atualizar código
echo "📥 Baixando última versão do GitHub..."
git pull origin Renan---AWS-Free-Tier

# Ativar ambiente virtual (criar se não existir)
if [ ! -d ~/venv ]; then
    echo "🔧 Criando ambiente virtual..."
    python3 -m venv ~/venv
fi
source ~/venv/bin/activate

# Ir para backend
cd backend

# Atualizar dependências (se mudaram)
echo "📦 Atualizando dependências..."
pip install --upgrade pip
pip install --upgrade --force-reinstall setuptools

# Verificar se pkg_resources está disponível
if ! python -c "import pkg_resources" 2>/dev/null; then
    echo "⚠️  pkg_resources não encontrado. Recriando ambiente virtual..."
    cd ~
    rm -rf ~/venv
    python3 -m venv ~/venv
    source ~/venv/bin/activate
    cd ~/Projeto_integrador/backend
    pip install --upgrade pip
    pip install setuptools
fi

pip install -r requirements_prod.txt

# Verificar se dependências foram instaladas
if ! python -c "import dj_database_url" 2>/dev/null; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

# Rodar migrações
echo "🔄 Aplicando migrações..."
python manage.py migrate

# Criar tabela de cache (se não existir)
echo "💾 Configurando cache..."
python manage.py createcachetable 2>/dev/null || true

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --clear

# Reiniciar serviço
echo "🔄 Reiniciando serviço..."
sudo systemctl restart skillio

# Aguardar 2 segundos
sleep 2

# Verificar status
if sudo systemctl is-active --quiet skillio; then
    echo ""
    echo "✅ Atualização concluída com sucesso!"
    echo ""
    echo "📊 Status do serviço:"
    sudo systemctl status skillio --no-pager -l | head -15
    echo ""
    echo "💡 Para ver logs: sudo journalctl -u skillio -f"
else
    echo ""
    echo "❌ Erro ao reiniciar serviço!"
    echo "   Ver logs: sudo journalctl -u skillio -n 50"
    exit 1
fi
