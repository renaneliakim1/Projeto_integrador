# 🚀 Guia de Instalação do EduJornada Mobile

## ⚠️ PRÉ-REQUISITOS OBRIGATÓRIOS

### 1. Node.js e npm
- **Node.js >= 18** (recomendado 18 LTS ou 20 LTS)
- Verificar versão: `node --version`
- Download: https://nodejs.org/

### 2. Para Android

#### Windows:
1. **Java JDK 17**
   - Download: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - Configurar JAVA_HOME:
     ```
     setx JAVA_HOME "C:\Program Files\Java\jdk-17"
     setx PATH "%PATH%;%JAVA_HOME%\bin"
     ```

2. **Android Studio**
   - Download: https://developer.android.com/studio
   - Durante instalação, marque:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
   
3. **Configurar Android SDK**
   - Abra Android Studio > More Actions > SDK Manager
   - Na aba "SDK Platforms", instale:
     - Android 13 (Tiramisu) - API Level 33
     - Android 12 (S) - API Level 31
   - Na aba "SDK Tools", instale:
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - Google Play services

4. **Configurar variáveis de ambiente:**
   ```cmd
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"
   ```

### 3. Para iOS (apenas macOS)

1. **Xcode 14+**
   - Instale via App Store

2. **CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

## 📦 INSTALAÇÃO DO PROJETO

### Passo 1: Navegar até a pasta Mobile
```cmd
cd C:\Users\RENAN\Downloads\Projeto_integrador\Mobile
```

### Passo 2: Instalar dependências
```cmd
npm install
```

Este comando instalará:
- React Native 0.73.2
- React Navigation
- AsyncStorage
- Axios
- NativeWind (Tailwind para RN)
- React Native Vector Icons
- E todas as outras dependências

**Tempo estimado:** 5-10 minutos

### Passo 3: Configurar ambiente
```cmd
copy .env.example .env
```

Edite o arquivo `.env` criado:
```env
# Para Android Emulator
API_URL=http://10.0.2.2:8000/api

# Para dispositivo físico, use o IP do seu PC
# API_URL=http://192.168.1.10:8000/api
```

Para descobrir seu IP:
```cmd
ipconfig
```
Procure por "IPv4 Address" na conexão Wi-Fi ativa.

### Passo 4: Instalar CocoaPods (apenas iOS/macOS)
```bash
cd ios
pod install
cd ..
```

## 🏃 EXECUTANDO O APP

### Android

#### Opção 1: Android Emulator (Recomendado)
1. Abra Android Studio
2. AVD Manager > Create Virtual Device
3. Escolha um dispositivo (ex: Pixel 5)
4. Escolha uma imagem do sistema (Android 13 ou 12)
5. Finish e Start o emulador

6. Em outro terminal, execute:
```cmd
npm run android
```

#### Opção 2: Dispositivo Físico
1. Ative o modo desenvolvedor no Android:
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da compilação"

2. Ative a Depuração USB:
   - Configurações > Sistema > Opções do desenvolvedor
   - Ative "Depuração USB"

3. Conecte o dispositivo via USB

4. Verifique se está conectado:
```cmd
adb devices
```

5. Execute:
```cmd
npm run android
```

### iOS (apenas macOS)

#### Simulador
```bash
npm run ios
```

#### Dispositivo Físico
1. Abra `ios/EduJornada.xcworkspace` no Xcode
2. Selecione seu dispositivo
3. Product > Run

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Erro: "SDK location not found"
**Solução:**
1. Crie arquivo `android/local.properties`
2. Adicione (ajuste o caminho se necessário):
```
sdk.dir=C:\\Users\\RENAN\\AppData\\Local\\Android\\Sdk
```

### Erro: "Could not connect to development server"
**Solução:**
1. Verifique se o backend está rodando (porta 8000)
2. Verifique o IP no arquivo `.env`
3. Para Android Emulator: use `10.0.2.2`
4. Para dispositivo físico: use o IP da sua máquina

### Erro: "Unable to load script"
**Solução:**
```cmd
npm start -- --reset-cache
```

Em outro terminal:
```cmd
npm run android
```

### Erro: "command not found: adb"
**Solução:**
Adicione ao PATH:
```cmd
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools"
```
Reinicie o terminal.

### Erro de Build no Android
**Solução:**
```cmd
cd android
gradlew clean
cd ..
npm run android
```

### Metro Bundler travado
**Solução:**
1. Feche todos os terminais
2. Delete a pasta `node_modules`
3. Delete `package-lock.json`
4. Execute:
```cmd
npm install
npm start -- --reset-cache
```

### Ícones não aparecem (Vector Icons)
**Android:**
```cmd
npx react-native-asset
```

**iOS:**
```bash
cd ios
pod install
cd ..
npm run ios
```

## 🔧 COMANDOS ÚTEIS

### Limpar cache
```cmd
npm start -- --reset-cache
```

### Limpar build Android
```cmd
cd android
gradlew clean
cd ..
```

### Reinstalar pods (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Ver logs do Android
```cmd
adb logcat
```

### Ver dispositivos conectados
```cmd
adb devices
```

### Reverter porta (se backend estiver em porta diferente)
```cmd
adb reverse tcp:8000 tcp:8000
```

## 📱 GERANDO APK/IPA PARA PRODUÇÃO

### Android APK (Debug)
```cmd
cd android
gradlew assembleDebug
```
APK gerado em: `android/app/build/outputs/apk/debug/app-debug.apk`

### Android APK (Release)
1. Gere uma keystore:
```cmd
keytool -genkey -v -keystore edujornada.keystore -alias edujornada -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure `android/gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=edujornada.keystore
MYAPP_UPLOAD_KEY_ALIAS=edujornada
MYAPP_UPLOAD_STORE_PASSWORD=sua_senha
MYAPP_UPLOAD_KEY_PASSWORD=sua_senha
```

3. Build:
```cmd
cd android
gradlew assembleRelease
```

### iOS (macOS)
1. Abra `ios/EduJornada.xcworkspace`
2. Product > Archive
3. Distribute App

## 🌐 VERIFICAÇÃO DA CONEXÃO

### Teste a API
No app, tente fazer login. Se aparecer erro de conexão:

1. Verifique se o backend está rodando:
```cmd
curl http://localhost:8000/api/
```

2. Para Android Emulator, teste:
```cmd
curl http://10.0.2.2:8000/api/
```

3. Para dispositivo físico, teste (substitua o IP):
```cmd
curl http://192.168.1.10:8000/api/
```

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Node.js 18+ instalado
- [ ] JDK 17 instalado e configurado (JAVA_HOME)
- [ ] Android Studio instalado
- [ ] Android SDK instalado (API 33 ou 31)
- [ ] Variáveis de ambiente configuradas (ANDROID_HOME, PATH)
- [ ] `npm install` executado com sucesso
- [ ] Arquivo `.env` criado e configurado
- [ ] Backend rodando na porta 8000
- [ ] Emulador ou dispositivo conectado
- [ ] `npm run android` ou `npm run ios` executado
- [ ] App abre sem erros
- [ ] Login funciona (conexão com backend OK)

## 📞 SUPORTE

Se encontrar problemas:
1. Leia as mensagens de erro completas
2. Consulte este guia novamente
3. Verifique as versões das ferramentas
4. Limpe caches e rebuilde
5. Reinicie o computador (sério, às vezes resolve!)

## 🎯 PRÓXIMOS PASSOS

Após instalação bem-sucedida:
1. Teste o login
2. Explore as telas placeholder
3. Comece a desenvolver as telas completas
4. Migre hooks e lógica do Frontend web
5. Teste em dispositivo físico
6. Prepare para produção

Boa sorte! 🚀
