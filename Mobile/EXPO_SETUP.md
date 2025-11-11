# 📱 Guia de Instalação Expo - EduJornada Mobile

## ✅ Pré-requisitos

- Node.js 18+ instalado
- Celular Android ou iOS
- Conexão Wi-Fi (celular e PC na mesma rede)

## 🚀 Passo a Passo

### 1️⃣ Instalar Expo Go no Celular

**Android:**
- Abra a Play Store
- Busque por "Expo Go"
- Instale o app oficial da Expo

**iOS:**
- Abra a App Store
- Busque por "Expo Go"
- Instale o app oficial da Expo

### 2️⃣ Instalar Dependências

Abra o terminal na pasta `Mobile`:

```bash
cd C:\Users\RENAN\Downloads\Projeto_integrador\Mobile
npm install
```

ou

```bash
yarn install
```

### 3️⃣ Configurar o .env

Crie o arquivo `.env` (copie de `.env.example`):

```bash
copy .env.example .env
```

**Descubra o IP do seu PC:**

```bash
ipconfig
```

Procure por **"Endereço IPv4"** (ex: 192.168.1.10)

**Edite o `.env`:**

```bash
API_URL=http://192.168.1.10:8000/api
API_KEY_GEMINI=sua_chave_aqui
```

⚠️ **IMPORTANTE:** Substitua `192.168.1.10` pelo IP do SEU PC!

### 4️⃣ Iniciar o Backend

O backend precisa estar rodando e acessível na rede:

```bash
cd C:\Users\RENAN\Downloads\Projeto_integrador\backend
python manage.py runserver 0.0.0.0:8000
```

### 5️⃣ Iniciar o App Expo

```bash
cd C:\Users\RENAN\Downloads\Projeto_integrador\Mobile
npx expo start
```

ou

```bash
npm start
```

### 6️⃣ Escanear QR Code

Aparecerá um QR Code no terminal e no navegador.

**Android:**
- Abra o app **Expo Go**
- Toque em **"Scan QR Code"**
- Aponte para o QR Code na tela
- Aguarde o app carregar

**iOS:**
- Abra o app **Câmera** nativo
- Aponte para o QR Code
- Toque na notificação que aparece
- Abrirá no Expo Go

## 🎉 Pronto!

O app EduJornada abrirá no seu celular! 📱

### 🔥 Hot Reload

Qualquer mudança no código será atualizada automaticamente no celular! Você verá:

- ✅ Código atualiza em tempo real
- ✅ Não precisa recompilar
- ✅ Shake o celular para abrir menu de dev

## 🐛 Problemas Comuns

### "Unable to connect to backend"

1. Verifique se o backend está rodando
2. Confirme o IP no `.env`
3. Celular e PC devem estar na **mesma rede Wi-Fi**
4. Teste no navegador do celular: `http://192.168.1.10:8000/api/`

### "Something went wrong"

1. Feche o Expo Go
2. No terminal, pressione `Ctrl+C`
3. Rode novamente: `npx expo start --clear`
4. Escaneie o QR Code novamente

### QR Code não aparece

1. Pressione `r` no terminal (reload)
2. Ou acesse: `http://localhost:19002/` no navegador

### App muito lento

1. Ative modo de desenvolvimento: Shake o celular > "Enable Fast Refresh"
2. Ou pressione `j` no terminal para abrir debugger

## 📝 Comandos Úteis

```bash
# Iniciar Expo
npx expo start

# Limpar cache e reiniciar
npx expo start --clear

# Abrir no Android Emulator (se tiver)
npx expo start --android

# Abrir no iOS Simulator (Mac apenas)
npx expo start --ios

# Abrir no navegador web
npx expo start --web
```

## 🎯 Vantagens do Expo Go

- ✅ **Sem cabo USB**: Tudo via Wi-Fi
- ✅ **Sem compilação**: Atualização instantânea
- ✅ **Sem Android Studio**: Não precisa instalar nada pesado
- ✅ **Cross-platform**: Testa no Android e iOS
- ✅ **Hot reload**: Mudanças aparecem em segundos

## 🆘 Suporte

Se tiver problemas:

1. Verifique a [documentação oficial do Expo](https://docs.expo.dev/)
2. Certifique-se de que o IP está correto
3. Confirme que celular e PC estão na mesma rede
4. Reinicie o Expo e o Expo Go

---

**Bom desenvolvimento! 🚀**
