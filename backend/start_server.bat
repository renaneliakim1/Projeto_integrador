@echo off
echo ====================================
echo  SKILLIO - Backend Server
echo ====================================
echo.
echo Escolha o modo de execucao:
echo [1] Local apenas (127.0.0.1:8000)
echo [2] Rede local para mobile (192.168.0.89:8000)
echo.
set /p choice="Digite 1 ou 2: "

cd /d c:\Users\RENAN\Downloads\Projeto_integrador\backend
call venv\Scripts\activate.bat

if "%choice%"=="1" (
    echo.
    echo Iniciando servidor em modo LOCAL...
    echo Acesse: http://127.0.0.1:8000
    python manage.py runserver
) else if "%choice%"=="2" (
    echo.
    echo Iniciando servidor em modo REDE...
    echo Acesse do PC: http://192.168.0.89:8000
    echo Acesse do mobile: http://192.168.0.89:8000
    python manage.py runserver 192.168.0.89:8000
) else (
    echo.
    echo Opcao invalida! Iniciando em modo LOCAL...
    python manage.py runserver
)
