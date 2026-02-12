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

# Ativar ambiente virtual
source ~/venv/bin/activate

# Ir para backend
cd backend

# Atualizar dependências (se mudaram)
echo "📦 Atualizando dependências..."
pip install -r requirements_prod.txt --quiet

# Rodar migrações
echo "🔄 Aplicando migrações..."
python manage.py migrate --settings=core.settings_production

# Criar tabela de cache (se não existir)
echo "💾 Configurando cache..."
python manage.py createcachetable --settings=core.settings_production 2>/dev/null || true

# Coletar arquivos estáticos
echo "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput --settings=core.settings_production --clear

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
