@echo off
REM =========================================
REM Script para parar Backend e Frontend
REM Tutor Educacional com IA - Windows
REM =========================================

color 0E
cls

echo.
echo ═══════════════════════════════════════════════
echo 🛑 Parando servidores...
echo ═══════════════════════════════════════════════
echo.

REM Parar processos na porta 8000 (Backend)
echo ► Parando Backend (porta 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo   ✓ Backend parado
echo.

REM Parar processos na porta 8080 (Frontend)
echo ► Parando Frontend (porta 8080)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo   ✓ Frontend parado
echo.

REM Parar processos Python (Django)
echo ► Parando processos Python (Django)...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Backend*" >nul 2>&1
echo   ✓ Processos Python parados
echo.

REM Parar processos Node (Vite)
echo ► Parando processos Node (Vite)...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Frontend*" >nul 2>&1
echo   ✓ Processos Node parados
echo.

color 0A
echo ═══════════════════════════════════════════════
echo ✓ Todos os servidores foram parados
echo ═══════════════════════════════════════════════
echo.

timeout /t 3
