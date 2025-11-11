@echo off
echo ========================================
echo   EduJornada Mobile - Setup Expo
echo ========================================
echo.

echo [1/5] Instalando dependencias do NPM...
call npm install

echo.
echo [2/5] Instalando Expo CLI globalmente...
call npm install -g expo-cli

echo.
echo [3/5] Criando arquivo .env...
if not exist .env (
    copy .env.example .env
    echo .env criado! EDITE o arquivo e configure seu IP.
) else (
    echo .env ja existe, pulando...
)

echo.
echo [4/5] Limpando cache...
call npx expo start --clear

echo.
echo ========================================
echo   Setup Concluido!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. Edite o arquivo .env e configure:
echo    - API_URL=http://SEU_IP:8000/api
echo    - API_KEY_GEMINI=sua_chave
echo.
echo 2. Instale o app "Expo Go" no celular:
echo    - Android: Play Store
echo    - iOS: App Store
echo.
echo 3. Inicie o servidor backend:
echo    cd ../backend
echo    python manage.py runserver 0.0.0.0:8000
echo.
echo 4. Inicie o Expo:
echo    npx expo start
echo.
echo 5. Escaneie o QR Code com Expo Go
echo.
echo ========================================
pause
