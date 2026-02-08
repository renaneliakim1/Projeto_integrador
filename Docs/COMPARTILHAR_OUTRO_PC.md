# 🌐 GUIA COMPLETO: Como Acessar o Skillio de Outro PC

## 📋 INFORMAÇÕES DO SEU SISTEMA

- **Seu IP**: `192.168.15.7`
- **Rede WiFi**: Vivofribra
- **Frontend**: http://192.168.15.7:5173
- **Backend**: http://192.168.15.7:8000

---

## ✅ PASSO 1: VERIFICAR SE O DOCKER ESTÁ RODANDO (SEU PC)

Abra o terminal e execute:

```bash
docker-compose ps
```

**Você deve ver:**
```
✔ projeto_integrador-backend-1    Up    0.0.0.0:8000->8000/tcp
✔ projeto_integrador-frontend-1   Up    0.0.0.0:5173->5173/tcp
```

✅ **Status**: "Up" significa que está rodando
❌ **Se não estiver**: Execute `docker-start.bat`

---

## ✅ PASSO 2: CONFIGURAR O FIREWALL DO WINDOWS (SEU PC)

### Por que precisa?
O firewall bloqueia conexões externas por padrão. Você precisa criar regras para permitir acesso nas portas 5173 e 8000.

### Opção A: PowerShell (Mais Rápido)

1. **Clique com botão direito no ícone do Windows**
2. Selecione **"Terminal (Admin)"** ou **"PowerShell (Administrador)"**
3. Cole e execute estes comandos:

```powershell
New-NetFirewallRule -DisplayName "Skillio Frontend Docker" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow

New-NetFirewallRule -DisplayName "Skillio Backend Docker" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
```

4. Você verá mensagens de confirmação para cada regra

### Opção B: Interface Gráfica (Passo a Passo)

1. **Abrir Firewall do Windows:**
   - Pressione `Win + R`
   - Digite: `wf.msc`
   - Pressione Enter

2. **Criar Regra de Entrada:**
   - Clique em **"Regras de Entrada"** (lado esquerdo)
   - Clique em **"Nova Regra..."** (lado direito)

3. **Tipo de Regra:**
   - Selecione: **"Porta"**
   - Clique em **"Avançar"**

4. **Protocolo e Portas:**
   - Protocolo: **TCP**
   - Portas locais específicas: Digite `5173, 8000`
   - Clique em **"Avançar"**

5. **Ação:**
   - Selecione: **"Permitir a conexão"**
   - Clique em **"Avançar"**

6. **Perfil:**
   - Marque TODAS as opções:
     - ✅ Domínio
     - ✅ Particular
     - ✅ Público
   - Clique em **"Avançar"**

7. **Nome:**
   - Nome: `Skillio Docker`
   - Descrição: `Permite acesso ao Skillio via Docker`
   - Clique em **"Concluir"**

---

## ✅ PASSO 3: VERIFICAR SE AS PORTAS ESTÃO ABERTAS (SEU PC)

Execute no terminal:

```bash
netstat -ano | findstr :5173
netstat -ano | findstr :8000
```

**Você deve ver algo como:**
```
TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
```

✅ **"0.0.0.0"** significa que está aceitando conexões de qualquer IP
✅ **"LISTENING"** significa que está escutando/esperando conexões

---

## ✅ PASSO 4: CONECTAR OUTRO PC NA MESMA REDE

### No Outro PC:

1. **Conecte na mesma rede WiFi:**
   - Nome da rede: **Vivofribra**
   - Mesma senha que você usa

2. **Verifique se está na mesma rede:**
   - Abra o terminal (CMD)
   - Execute: `ipconfig`
   - O IP deve começar com **192.168.15.xxx**
   - Exemplo: `192.168.15.25`, `192.168.15.100`, etc.

---

## ✅ PASSO 5: ACESSAR DO OUTRO PC

### No navegador do outro PC:

1. Abra Chrome, Edge ou Firefox
2. Digite na barra de endereço:

```
http://192.168.15.7:5173
```

3. Pressione Enter

### O que deve acontecer:

✅ **Sucesso**: A página do Skillio carrega normalmente
❌ **Erro**: Veja a seção de Troubleshooting abaixo

---

## 🔍 PASSO 6: TESTAR A CONEXÃO

### Do Outro PC, teste primeiro a API:

Abra: http://192.168.15.7:8000/api/v1/health/

**Deve retornar:**
```json
{"status":"healthy","database":"connected","message":"API is running successfully"}
```

Se funcionar, o frontend também funcionará!

---

## 🐛 TROUBLESHOOTING (RESOLUÇÃO DE PROBLEMAS)

### ❌ Problema 1: "Não consegue conectar" / "Timeout"

**Causa:** Firewall bloqueando

**Solução:**
1. Verifique se criou as regras de firewall (Passo 2)
2. Execute no SEU PC (servidor):
   ```bash
   docker-diagnostico.bat
   ```
3. Verifique se aparece "LISTENING" nas portas

### ❌ Problema 2: "Conexão recusada" / "Connection refused"

**Causa:** Docker não está rodando

**Solução:**
1. No SEU PC, execute:
   ```bash
   docker-compose ps
   ```
2. Se aparecer "Exit" ou nada, execute:
   ```bash
   docker-start.bat
   ```

### ❌ Problema 3: "Página não carrega" mas API funciona

**Causa:** Frontend teve problema ao iniciar

**Solução:**
1. Veja os logs do frontend:
   ```bash
   docker-compose logs frontend
   ```
2. Reinicie o frontend:
   ```bash
   docker-compose restart frontend
   ```

### ❌ Problema 4: Outro PC não está na mesma rede

**Causa:** WiFi diferente ou cabo de rede

**Solução:**
1. No outro PC, verifique:
   ```bash
   ipconfig
   ```
2. O IP deve começar com `192.168.15.xxx`
3. Se começar com outro número, conecte na WiFi correta (Vivofribra)

### ❌ Problema 5: "CORS error" no console do navegador

**Causa:** Backend não permite a origem

**Solução:**
1. Já está configurado! O backend aceita todas as origens (DEBUG=True)
2. Se ainda der erro, reinicie:
   ```bash
   docker-compose restart backend
   ```

---

## 📱 ACESSAR DO CELULAR (MESMO PROCESSO)

1. Conecte o celular na WiFi **Vivofribra**
2. Abra o navegador (Chrome, Safari, etc)
3. Digite: `http://192.168.15.7:5173`
4. Pronto! Funciona igual no PC

---

## 🔐 SOBRE SEGURANÇA

### ⚠️ IMPORTANTE:

Esta configuração é **APENAS PARA DESENVOLVIMENTO E DEMONSTRAÇÃO** em rede local!

**Por que é seguro na sua rede local:**
- ✅ Apenas dispositivos na mesma WiFi podem acessar
- ✅ Não está exposto à internet
- ✅ Firewall do Windows ainda protege seu PC

**NÃO FAÇA PARA PRODUÇÃO:**
- ❌ Não exponha para a internet sem HTTPS
- ❌ Não use DEBUG=True em produção
- ❌ Não use CORS_ALLOW_ALL_ORIGINS em produção

---

## 📊 COMANDOS ÚTEIS PARA MONITORAR

### Ver quantas pessoas estão acessando:

```bash
docker-compose logs backend | findstr "GET /"
```

### Ver logs em tempo real:

```bash
docker-compose logs -f
```

### Ver apenas logs do frontend:

```bash
docker-compose logs -f frontend
```

### Verificar recursos (CPU, RAM):

```bash
docker stats
```

---

## ✅ CHECKLIST COMPLETO

Antes de chamar alguém para testar, confirme:

- [ ] Docker rodando? (`docker-compose ps`)
- [ ] Portas LISTENING? (`netstat -ano | findstr :5173`)
- [ ] Firewall configurado? (Regras criadas)
- [ ] IP correto? (`ipconfig` - 192.168.15.7)
- [ ] Testou no próprio PC? (`http://localhost:5173`)
- [ ] API funcionando? (`http://192.168.15.7:8000/api/v1/health/`)

---

## 🎯 RESUMO RÁPIDO

### No SEU PC (Servidor):

```bash
# 1. Iniciar Docker (se não estiver rodando)
docker-start.bat

# 2. Configurar Firewall (só precisa fazer uma vez)
PowerShell como Admin:
New-NetFirewallRule -DisplayName "Skillio Docker" -Direction Inbound -LocalPort 5173,8000 -Protocol TCP -Action Allow

# 3. Descobrir seu IP
ipconfig
# Anote: 192.168.15.7
```

### No OUTRO PC:

```bash
# 1. Conectar na mesma WiFi (Vivofribra)

# 2. Abrir navegador e acessar:
http://192.168.15.7:5173
```

---

## 💡 DICAS EXTRAS

1. **Compartilhe o IP**: Anote `192.168.15.7:5173` num papel ou Slack/WhatsApp
2. **QR Code**: Se quiser, crie um QR Code da URL para facilitar
3. **Bookmark**: No outro PC, adicione aos favoritos
4. **Teste você mesmo**: Antes de chamar outros, teste no seu celular
5. **Logs abertos**: Mantenha `docker-compose logs -f` rodando para ver acessos

---

## 📞 SUPORTE

Se nada funcionar:

1. Execute: `docker-diagnostico.bat`
2. Tire print da saída
3. Verifique os logs: `docker-compose logs`
4. Reinicie tudo: `docker-compose restart`

---

**✅ Pronto! Seu sistema está compartilhado na rede local! 🎉**
