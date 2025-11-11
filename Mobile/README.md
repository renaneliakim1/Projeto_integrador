# 📱 EduJornada Mobile

Aplicativo mobile React Native + Expo para Android e iOS da plataforma EduJornada.

## 🚀 Tecnologias

- **React Native** 0.73.2
- **Expo** ~50.0.0
- **TypeScript** 5.0
- **React Navigation** 6.x (Stack + Bottom Tabs)
- **NativeWind** (TailwindCSS para React Native)
- **AsyncStorage** (armazenamento local)
- **Axios** (requisições HTTP)
- **React Native Reanimated** (animações)
- **Expo Vector Icons** (ícones)
- **Expo Image Picker** (seleção de fotos)

## 📁 Estrutura do Projeto

```
Mobile/
├── src/
│   ├── components/       # Componentes reutilizáveis (Button, Card, Input, etc)
│   ├── screens/          # Telas do app (Login, Dashboard, Game, etc)
│   ├── navigation/       # Configuração de navegação
│   ├── contexts/         # Contextos React (AuthContext, ThemeContext)
│   ├── hooks/            # Hooks customizados (useGamification, etc)
│   ├── services/         # Serviços de API
│   ├── utils/            # Funções utilitárias
│   ├── data/             # Dados estáticos (trilhaPrincipal, subjects)
│   ├── types/            # Tipos TypeScript
│   └── assets/           # Imagens, fontes, etc
├── App.tsx               # Componente raiz
├── app.json              # Configuração Expo
└── package.json
```

## 🔧 Instalação Rápida (Expo Go)

### ⚡ Método Mais Fácil - Recomendado!

**Vantagens:**
- ✅ Sem Android Studio
- ✅ Sem cabo USB
- ✅ Testa via QR Code
- ✅ Hot reload instantâneo

**Veja o guia completo:** [EXPO_SETUP.md](./EXPO_SETUP.md)

### Resumo Rápido:

1. **Instale Expo Go** no celular (Play Store/App Store)
2. **Instale dependências:**
   ```bash
   cd Mobile
   npm install
   ```
3. **Configure o .env** com o IP do seu PC
4. **Inicie o app:**
   ```bash
   npx expo start
   ```
5. **Escaneie o QR Code** no Expo Go

## 🔧 Instalação Tradicional (React Native CLI)

### Pré-requisitos

- Node.js >= 18
- npm ou yarn
- **Android:**
  - Android Studio
  - JDK 17
  - Android SDK
- **iOS (apenas macOS):**
  - Xcode 14+
  - CocoaPods

### Passos

1. **Instale as dependências:**
```bash
cd Mobile
npm install
```

2. **Configure o ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

3. **iOS (apenas macOS):**
```bash
cd ios
pod install
cd ..
```

4. **Execute o app:**

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🌐 Configuração da API

### Android Emulator
- Use `http://10.0.2.2:8000/api` no `.env`
- O Android Emulator usa 10.0.2.2 para acessar localhost do PC

### Dispositivo Físico
- Descubra o IP local do seu PC: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Use `http://SEU_IP:8000/api` (ex: `http://192.168.1.10:8000/api`)
- Certifique-se que o dispositivo está na mesma rede Wi-Fi

### iOS Simulator
- Use `http://localhost:8000/api` no `.env`

## 🎨 Tema e Estilos

O app usa **NativeWind** (TailwindCSS para React Native) mantendo a mesma identidade visual do web:

- **Cores principais:**
  - Primary: `#3b82f6` (azul)
  - Secondary: `#f59e0b` (laranja)
  - Background: `#0a0a0a` (dark)
  - Card: `#1a1a1a`
  - Success: `#22c55e`
  - Destructive: `#ef4444`

## 📦 Scripts Disponíveis

- `npm start` - Inicia o Metro bundler
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run lint` - Executa o linter
- `npm test` - Executa os testes

## 🔄 Diferenças do Web

### Navegação
- Web usa `react-router-dom`
- Mobile usa `@react-navigation/native` (Stack + Bottom Tabs)

### Armazenamento
- Web usa `localStorage`
- Mobile usa `@react-native-async-storage/async-storage`

### Estilos
- Web usa `className` com TailwindCSS direto
- Mobile usa `className` com NativeWind (adaptação do Tailwind)

### Componentes UI
- Adaptados de `<div>`, `<button>`, `<input>` para `<View>`, `<TouchableOpacity>`, `<TextInput>`

## 🐛 Troubleshooting

### Metro Bundler não inicia
```bash
npm start -- --reset-cache
```

### Android build error
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS build error
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Erro de conexão com API
- Verifique se o backend está rodando
- Confirme o IP/URL correto no `.env`
- Verifique firewall/antivírus

## 📱 Build para Produção

### Android (APK)
```bash
cd android
./gradlew assembleRelease
# APK gerado em: android/app/build/outputs/apk/release/
```

### iOS (IPA - apenas macOS)
1. Abra `ios/EduJornada.xcworkspace` no Xcode
2. Product → Archive
3. Distribute App

## 📄 Licença

Mesmo backend e banco de dados do projeto web EduJornada.
