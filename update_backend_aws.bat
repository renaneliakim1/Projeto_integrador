@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════
echo    🔄 SKILLIO - Atualizar Backend na AWS EC2
echo ════════════════════════════════════════════════════
echo.
echo 📡 Conectando ao servidor EC2...
echo    IP: 3.142.80.221
echo.

REM Verifica se a chave SSH existe
if not exist "skillio-key.pem" (
    echo ❌ Arquivo skillio-key.pem não encontrado!
    echo    Coloque o arquivo skillio-key.pem na raiz do projeto
    pause
    exit /b 1
)

echo ✅ Executando atualização no servidor...
echo    - Limpando mudanças locais
echo    - Baixando código do GitHub
echo    - Aplicando deploy
echo.

ssh -i skillio-key.pem ubuntu@3.142.80.221 "cd ~/Projeto_integrador && git fetch --all && git reset --hard origin/Renan---AWS-Free-Tier && git clean -fd && ./deploy_scripts/update_backend.sh"

if errorlevel 1 (
    echo.
    echo ❌ Erro ao atualizar! Conecte manualmente:
    echo    ssh -i skillio-key.pem ubuntu@3.142.80.221
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════
echo    ✅ BACKEND ATUALIZADO COM SUCESSO!
echo ════════════════════════════════════════════════════
echo.
echo 🌐 API disponível em:
echo    http://3.142.80.221:8000
echo    http://ec2-3-142-80-221.us-east-2.compute.amazonaws.com:8000
echo.
echo 💡 Para ver logs:
echo    ssh -i skillio-key.pem ubuntu@3.142.80.221
echo    sudo journalctl -u skillio -f
echo.
pause
