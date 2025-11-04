@echo off
echo ================================================
echo  SKILLIO - Informacoes de Rede
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
echo  IP ATUAL: %IP%
echo ================================================
echo.
echo Use este endereco para acessar:
echo.
echo   Frontend: http://%IP%:8080
echo   Backend:  http://%IP%:8000
echo.
echo No celular, digite no navegador:
echo   http://%IP%:8080
echo.
echo ================================================
echo.
pause
