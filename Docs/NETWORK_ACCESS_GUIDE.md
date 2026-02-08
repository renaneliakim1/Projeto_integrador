# 🌐 Guia de Acesso em Rede - Skillio Docker

## ✅ CONFIGURAÇÕES APLICADAS

O projeto está **PRONTO** para acesso de outros PCs na mesma rede! 

### 🔧 Configurações Ativas:

1. **Backend (Django):**
   - ✅ Porta: `0.0.0.0:8000` (aceita conexões de qualquer IP)
   - ✅ CORS: `CORS_ALLOW_ALL_ORIGINS = True` (permite qualquer origem)
   - ✅ ALLOWED_HOSTS: `*` (aceita qualquer domínio/IP)

2. **Frontend (Vite):**
   - ✅ Porta: `0.0.0.0:5173` (aceita conexões de qualquer IP)
   - ✅ Detecção Automática: O frontend detecta automaticamente o IP e ajusta a API
   - ✅ Sem IP hardcoded: Funciona em qualquer rede

3. **Banco de Dados:**
   - ✅ AWS RDS (externo, acessível de qualquer lugar)

## 📱 COMO ACESSAR DE OUTRO PC/CELULAR

### Passo 1: Descubra o IP do PC que roda o Docker

**No PC onde o Docker está rodando:**

```bash
ipconfig
```

Procure por:
- **Adaptador de Rede sem Fio Wi-Fi** (se estiver no WiFi)
- **Adaptador Ethernet** (se estiver com cabo)

Anote o **Endereço IPv4**, exemplo: `192.168.15.7`

### Passo 2: Inicie o Docker

**No PC servidor:**

```bash
docker-start.bat
```

Aguarde até ver:
```
✔ Container projeto_integrador-backend-1   Started
✔ Container projeto_integrador-frontend-1  Started
```

### Passo 3: Acesse de Outro Dispositivo

**Certifique-se que o outro PC/celular está na MESMA rede WiFi!**

Então acesse no navegador:

```
http://[IP-DO-SERVIDOR]:5173
```

**Exemplos:**
- `http://192.168.15.7:5173` (frontend)
- `http://192.168.15.7:8000` (backend API)

### Passo 4: Verificar Funcionamento

O frontend detectará automaticamente que está acessando via rede e ajustará a URL da API.

**No console do navegador (F12), você verá:**
```
🌐 Modo Rede - Base URL: http://192.168.15.7:8000/api/v1
```

## 🔥 FIREWALL DO WINDOWS

Se NÃO conseguir acessar de outros dispositivos, configure o firewall:

### Opção 1: PowerShell (Execute como Administrador)

```powershell
New-NetFirewallRule -DisplayName "Docker Skillio Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Docker Skillio Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

### Opção 2: GUI Windows Firewall

1. Pressione `Win + R`, digite `wf.msc`, Enter
2. Clique em **Regras de Entrada** → **Nova Regra**
3. Tipo: **Porta**
4. Protocolo: **TCP**
5. Portas locais específicas: `5173, 8000`
6. Ação: **Permitir a conexão**
7. Perfil: Marque **Domínio, Particular, Público**
8. Nome: `Docker Skillio`

## 🧪 TESTAR CONECTIVIDADE

### Do PC Servidor (onde o Docker roda):

```bash
# Verificar se as portas estão abertas
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Deve mostrar:
# TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING
# TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
```

### De Outro PC na Rede:

```bash
# Windows
curl http://192.168.15.7:5173
curl http://192.168.15.7:8000/api/v1/health/

# Ou apenas abra no navegador
```

## 📊 EXEMPLO DE CONFIGURAÇÃO

### Cenário:
- **PC Servidor**: `192.168.15.7` (rodando Docker)
- **Laptop**: `192.168.15.10` (mesmo WiFi)
- **Celular**: `192.168.15.25` (mesmo WiFi)

### URLs de Acesso:

**No PC Servidor:**
- Frontend: `http://localhost:5173` ou `http://192.168.15.7:5173`
- Backend: `http://localhost:8000` ou `http://192.168.15.7:8000`

**No Laptop:**
- Frontend: `http://192.168.15.7:5173`
- Backend: `http://192.168.15.7:8000`

**No Celular:**
- Frontend: `http://192.168.15.7:5173`
- Backend: `http://192.168.15.7:8000`

## 🎯 DETECÇÃO AUTOMÁTICA DO FRONTEND

O código em `Frontend/src/api/axios.ts` faz a mágica:

```typescript
const getBaseURL = () => {
    const hostname = window.location.hostname;
    
    // Se acessando via IP de rede (192.168.x.x)
    if (hostname.startsWith('192.168')) {
        return `http://${hostname}:8000/api/v1`;
    }
    
    // Se acessando via localhost
    return 'http://127.0.0.1:8000/api/v1';
};
```

**Isso significa:**
- Acesso em `http://192.168.15.7:5173` → API: `http://192.168.15.7:8000`
- Acesso em `http://localhost:5173` → API: `http://127.0.0.1:8000`
- Acesso em `http://10.0.0.5:5173` → API: `http://10.0.0.5:8000`

**Funciona automaticamente em qualquer rede!** 🎉

## 🔐 SEGURANÇA

⚠️ **Estas configurações são para DESENVOLVIMENTO em rede local!**

**Para PRODUÇÃO, você DEVE:**

1. Configurar HTTPS com certificado SSL
2. Configurar CORS apenas para domínios específicos
3. Desativar `DEBUG=False`
4. Usar `SECRET_KEY` segura
5. Configurar `ALLOWED_HOSTS` específicos
6. Usar autenticação forte
7. Configurar firewall restritivo

## 🐛 TROUBLESHOOTING

### Problema: "Não consigo acessar do celular"

**Checklist:**
- [ ] PC e celular na MESMA rede WiFi?
- [ ] Docker rodando? (`docker-compose ps`)
- [ ] Firewall configurado? (regras criadas)
- [ ] IP correto? (`ipconfig` no PC servidor)
- [ ] Portas 5173 e 8000 abertas? (`netstat -ano`)

### Problema: "CORS error no console"

**Solução:**
- Verifique se `DEBUG=1` está configurado no docker-compose.yml
- Reinicie os containers: `docker-compose restart`

### Problema: "Failed to fetch" ou "Network Error"

**Solução:**
1. Verifique o console do navegador (F12)
2. Veja qual URL está tentando acessar
3. Teste diretamente: `http://[IP]:8000/api/v1/health/`
4. Se retornar erro 404/500, o backend não está rodando
5. Se não conectar, é problema de firewall

### Problema: "Connection refused"

**Solução:**
- Firewall bloqueando
- Docker não está rodando
- Porta já ocupada por outro processo

```bash
# Ver o que está usando a porta
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Matar processo se necessário
taskkill /F /PID [PID]
```

## 📱 ACESSO MÓVEL (CELULAR/TABLET)

### Android/iOS:

1. Conecte no mesmo WiFi
2. Abra o navegador (Chrome, Safari, etc)
3. Digite: `http://192.168.15.7:5173`
4. Funciona normalmente!

### Dica: Adicionar à Tela Inicial (PWA)

**No Chrome (Android):**
1. Acesse a aplicação
2. Menu (⋮) → "Adicionar à tela inicial"
3. Agora você tem um ícone na tela inicial!

**No Safari (iOS):**
1. Acesse a aplicação
2. Toque em Compartilhar
3. "Adicionar à Tela de Início"

## 🌍 ACESSO PELA INTERNET (OPCIONAL)

Se quiser acessar de FORA da sua rede (via internet):

### Opção 1: Ngrok (Mais Fácil)

```bash
# Instalar ngrok
choco install ngrok

# Expor porta 5173
ngrok http 5173

# Ngrok vai dar uma URL pública, ex:
# https://abc123.ngrok.io
```

### Opção 2: Port Forwarding no Roteador

1. Acesse o painel do roteador (geralmente 192.168.1.1)
2. Procure "Port Forwarding" ou "Encaminhamento de Porta"
3. Adicione:
   - Porta Externa: 5173 → Porta Interna: 5173 → IP: 192.168.15.7
   - Porta Externa: 8000 → Porta Interna: 8000 → IP: 192.168.15.7
4. Descubra seu IP público: https://whatismyip.com
5. Acesse: `http://[SEU-IP-PUBLICO]:5173`

⚠️ **ATENÇÃO:** Expor na internet sem HTTPS e autenticação forte é INSEGURO!

## 💡 DICAS FINAIS

1. **Performance**: Docker em Windows funciona melhor com WSL2
2. **Logs**: Use `docker-logs.bat` para monitorar problemas
3. **Rebuild**: Se mudou código, faça `docker-compose restart`
4. **IP Dinâmico**: Seu IP local pode mudar, use `ipconfig` novamente
5. **Múltiplos Usuários**: O Docker suporta múltiplos acessos simultâneos

---

**✅ Configuração Completa! Seu projeto Docker está pronto para acesso em rede! 🚀**
