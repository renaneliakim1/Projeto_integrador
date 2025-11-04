@echo off
REM =========================================
REM Script para iniciar Backend e Frontend
REM Tutor Educacional com IA - Windows
REM =========================================

color 0B
cls

echo.
echo ╔════════════════════════════════════════════════╗
echo ║                                                ║
echo ║        🎓 TUTOR EDUCACIONAL COM IA 🤖         ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Definir diretórios
set "BASE_DIR=%~dp0"
set "BACKEND_DIR=%BASE_DIR%backend"
set "FRONTEND_DIR=%BASE_DIR%Frontend"
set "VENV_PATH=%BASE_DIR%.venv\Scripts\activate.bat"

echo [%TIME%] Verificando estrutura do projeto...
echo.

REM Verificar se os diretórios existem
if not exist "%BACKEND_DIR%" (
    echo ✗ Erro: Diretório backend não encontrado!
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo ✗ Erro: Diretório Frontend não encontrado!
    pause
    exit /b 1
)

if not exist "%VENV_PATH%" (
    echo ✗ Erro: Ambiente virtual Python não encontrado em .venv\
    echo ⚠ Execute: python -m venv .venv
    pause
    exit /b 1
)

echo ✓ Estrutura do projeto verificada
echo.

REM Verificar se as portas estão livres
echo [%TIME%] Verificando portas...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ⚠ Porta 8000 já está em uso. Liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
)

netstat -ano | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ⚠ Porta 8080 já está em uso. Liberando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
)

echo ✓ Portas 8000 e 8080 disponíveis
echo.

REM =========================================
REM BACKEND (Django)
REM =========================================
echo ═══════════════════════════════════════════════
echo [%TIME%] Iniciando Backend (Django)...
echo ═══════════════════════════════════════════════
echo.

cd /d "%BACKEND_DIR%"

REM Iniciar backend em uma nova janela
start "Backend - Django" cmd /k "call %VENV_PATH% && python manage.py runserver"

echo ✓ Backend iniciando em nova janela...
timeout /t 5 >nul
echo.

REM =========================================
REM FRONTEND (React + Vite)
REM =========================================
echo ═══════════════════════════════════════════════
echo [%TIME%] Iniciando Frontend (React + Vite)...
echo ═══════════════════════════════════════════════
echo.

cd /d "%FRONTEND_DIR%"

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo ⚠ node_modules não encontrado. Instalando dependências...
    call npm install
    echo.
)

REM Iniciar frontend em uma nova janela
start "Frontend - React + Vite" cmd /k "npm run dev"

echo ✓ Frontend iniciando em nova janela...
timeout /t 3 >nul
echo.

REM =========================================
REM INFORMAÇÕES FINAIS
REM =========================================
color 0A
cls

echo.
echo ╔════════════════════════════════════════════════╗
echo ║                                                ║
echo ║            ✅ PROJETO INICIADO COM SUCESSO!    ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.
echo 📌 URLs de Acesso:
echo    ► Frontend:        http://localhost:8080
echo    ► Backend API:     http://localhost:8000
echo    ► Admin Django:    http://localhost:8000/admin
echo    ► API Docs:        http://localhost:8000/swagger
echo.
echo 💡 Dicas:
echo    ► Duas janelas foram abertas (Backend e Frontend)
echo    ► Para parar: feche as janelas ou pressione Ctrl+C nelas
echo    ► Os logs aparecem nas janelas individuais
echo.
echo ⚠️  Para encerrar completamente:
echo    1. Feche as janelas do Backend e Frontend
echo    2. Ou execute: stop.bat
echo.

cd /d "%BASE_DIR%"

echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador com as URLs principais
start http://localhost:8080
start http://localhost:8000/swagger

echo.
echo ✓ Navegador aberto com sucesso!
echo.
echo Mantenha esta janela aberta para ver informações do projeto.
echo.

pause
