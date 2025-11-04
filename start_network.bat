@echo off
echo ================================================
echo  SKILLIO - Iniciando Backend + Frontend
echo ================================================
echo.
echo Detectando IP da rede local...
echo.

REM Detecta o IP local automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
REM Remove espaços do IP
set IP=%IP: =%

echo.
echo ================================================
echo  IP DETECTADO: %IP%
echo ================================================
echo.
echo ACESSO:
echo   - Backend:  http://%IP%:8000
echo   - Frontend: http://%IP%:8080
echo.
echo Use este endereco no navegador do PC e Mobile:
echo   http://%IP%:8080
echo.
echo ================================================
echo.
echo Iniciando servidores...
echo.

REM Inicia o Backend em uma nova janela
start "SKILLIO - Backend" cmd /k "cd /d c:\Users\RENAN\Downloads\Projeto_integrador\backend && call venv\Scripts\activate.bat && python manage.py runserver %IP%:8000"

REM Aguarda 3 segundos para o backend iniciar
timeout /t 3 /nobreak > nul

REM Inicia o Frontend em uma nova janela
start "SKILLIO - Frontend" cmd /k "cd /d c:\Users\RENAN\Downloads\Projeto_integrador\Frontend && npm run dev -- --host 0.0.0.0"

echo.
echo ================================================
echo  Servidores iniciados!
echo ================================================
echo.
echo Acesse: http://%IP%:8080
echo.
echo Para parar os servidores, feche as janelas
echo ou pressione CTRL+C em cada terminal.
echo.
pause
