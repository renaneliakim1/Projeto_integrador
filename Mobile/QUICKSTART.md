# 🚀 Quick Start - EduJornada Mobile com Expo

## ⚡ Instalação em 5 Passos

### 1. Instalar dependências
```bash
cd Mobile
npm install
```

### 2. Configurar .env
```bash
# Descubra seu IP
ipconfig

# Copie o .env.example
copy .env.example .env

# Edite .env e coloque seu IP:
# API_URL=http://SEU_IP_AQUI:8000/api
# API_KEY_GEMINI=sua_chave_gemini
```

### 3. Iniciar Backend
```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### 4. Iniciar Expo (em outro terminal)
```bash
cd Mobile
npx expo start
```

### 5. Escanear QR Code
- Instale "Expo Go" no celular (Play Store/App Store)
- Abra Expo Go
- Escaneie o QR Code
- Pronto! 🎉

## 📱 No Celular

### Android
1. Abra Expo Go
2. Toque em "Scan QR Code"
3. Aponte para o QR Code

### iOS
1. Abra a Câmera nativa
2. Aponte para o QR Code
3. Toque na notificação
4. Abrirá no Expo Go

## 🐛 Problemas?

### App não conecta no backend
- Celular e PC na mesma rede Wi-Fi?
- IP correto no .env?
- Backend rodando em 0.0.0.0:8000?

### QR Code não aparece
Pressione `r` no terminal para recarregar

### App muito lento
Pressione `j` no terminal para abrir debugger

## 📚 Documentação Completa

- **Setup detalhado:** [EXPO_SETUP.md](./EXPO_SETUP.md)
- **Resumo da conversão:** [CONVERSION_SUMMARY.md](./CONVERSION_SUMMARY.md)
- **Arquitetura:** [ARCHITECTURE.md](./ARCHITECTURE.md)

## ✨ Comandos Úteis

```bash
# Iniciar Expo
npx expo start

# Limpar cache
npx expo start --clear

# Abrir no Android (se tiver emulador)
npx expo start --android

# Abrir no iOS (Mac apenas)
npx expo start --ios

# Ver logs
npx expo start --tunnel
```

## 🎯 Pronto para Desenvolver!

Qualquer mudança no código aparecerá automaticamente no celular! 🔥

**Hot Reload Ativado:** Edite, salve, veja instantaneamente! ⚡
