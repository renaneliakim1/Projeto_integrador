@echo off
echo ====================================
echo  SKILLIO - Frontend (Modo Rede)
echo ====================================
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

echo IP detectado: %IP%
echo.
echo Acesse do PC: http://%IP%:8080
echo Acesse do mobile: http://%IP%:8080
echo.
echo ====================================
echo.

cd /d c:\Users\RENAN\Downloads\Projeto_integrador\Frontend
call npm run dev -- --host 0.0.0.0
