# Projeto Integrador - Skillio

O **Skillio** é uma plataforma educacional gamificada desenvolvida para auxiliar estudantes no aprendizado de disciplinas escolares. O projeto integra conceitos de gamificação, inteligência artificial generativa e um sistema de trilhas de aprendizado personalizadas.

## 📋 Funcionalidades Principais

- **Gamificação**: Sistema de pontos, conquistas, missões e ranking.
- **Trilhas de Aprendizado**: Percursos personalizados baseados no desempenho do aluno.
- **Inteligência Artificial**: Geração de conteúdo educacional personalizado usando IA generativa.
- **Dashboard Interativo**: Visualização de progresso e estatísticas.
- **Sistema de Quiz**: Avaliações adaptativas para nivelamento.
- **Perfil do Usuário**: Gerenciamento de perfil com foto e estatísticas.
- **🔐 Recuperação de Senha**: Sistema completo de "Esqueci minha senha" com AWS Cognito
  - Envio de código por email
  - Redefinição segura de senha
  - Códigos com expiração automática

## 🏗️ Arquitetura do Projeto

O projeto é composto por três partes principais:

- **Backend**: API REST desenvolvida em Django (Python)
- **Frontend**: Interface web desenvolvida em React com TypeScript
- **Mobile**: Aplicativo móvel (em desenvolvimento)

## 🚀 Como Executar o Projeto

### ⚡ Scripts Automatizados (Recomendado)

Escolha o modo de execução baseado na sua necessidade:

#### 🏠 Modo Local (Apenas no PC)

**Ideal para:** Desenvolvimento local sem acesso externo

```cmd
start.bat     # Windows: Inicia backend + frontend (localhost)
./start.sh    # Linux/Mac: Inicia backend + frontend (localhost)
```

- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:8080
- ✅ Acessível apenas do próprio computador

---

#### 📱 Modo Rede (PC + Celular/Tablet)

**Ideal para:** Testar em dispositivos móveis na mesma WiFi

```cmd
start_network.bat     # Windows: Detecta IP automaticamente
```

**O que o script faz:**
- 🔍 Detecta automaticamente o IP da sua rede (ex: 192.168.0.89)
- 🚀 Inicia backend e frontend acessíveis na rede
- 📱 Mostra o endereço para acessar no celular
- ✅ Funciona em qualquer rede (casa, trabalho, cafeteria)

**Exemplo de saída:**
```
================================================
 IP DETECTADO: 192.168.0.89
================================================

ACESSO:
  - Backend:  http://192.168.0.89:8000
  - Frontend: http://192.168.0.89:8080

Use este endereco no navegador do PC e Mobile:
  http://192.168.0.89:8080
================================================
```

**No celular/tablet:** Digite o IP mostrado no navegador (ex: `http://192.168.0.89:8080`)

---

#### 🛑 Para Parar os Servidores

```cmd
stop.bat      # Windows: Para ambos os servidores
./stop.sh     # Linux/Mac: Para ambos os servidores
```

---

📖 **Documentação completa:** [TESTE_REDE.md](./TESTE_REDE.md) - Guia detalhado para teste em rede
⚡ **Comandos rápidos:** [QUICK_COMMANDS.md](./QUICK_COMMANDS.md)

---

### 🐳 Modo Docker (Recomendado para Produção)

**Ideal para:** Deploy, ambientes isolados, configuração simplificada

#### 🚀 Início Rápido

```cmd
# 1. Configure as variáveis de ambiente
copy .env.example .env
notepad .env

# 2. Inicie tudo com Docker
docker-init.bat          # Windows
./docker-init.sh         # Linux/Mac
```

#### 📦 O que inclui

- ✅ **PostgreSQL 15**: Banco de dados local persistente
- ✅ **Django Backend**: API REST com Gunicorn
- ✅ **React Frontend**: Interface com Vite
- ✅ **Nginx**: Proxy reverso e servir arquivos estáticos
- ✅ **Redis**: Sistema de cache (opcional)
- ✅ **Volumes**: Dados persistentes mesmo após restart

#### 🌐 Acessos

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost | Via Nginx (produção) |
| Frontend Dev | http://localhost:5173 | Vite com HMR |
| Backend API | http://localhost:8000 | Django REST |
| Admin | http://localhost:8000/admin | Painel Django |
| PostgreSQL | localhost:5432 | Banco de dados |

#### ⚡ Comandos Docker

```bash
docker-init.bat          # Inicialização completa
docker-stop.bat          # Parar containers
docker-restart.bat       # Reiniciar containers
docker-logs.bat          # Ver logs em tempo real
docker-status.bat        # Status dos serviços
docker-backup.bat        # Backup do banco de dados
docker-check.bat         # Verificar ambiente
docker-clean.bat         # Limpeza completa
```

#### 📚 Documentação Docker

- **[DOCKER_README.md](./DOCKER_README.md)** - Guia completo e detalhado
- **[DOCKER_QUICK_GUIDE.txt](./DOCKER_QUICK_GUIDE.txt)** - Referência rápida

#### 🚀 Deploy em Produção

```bash
# Usar docker-compose de produção (otimizado)
docker-deploy-prod.bat
# ou
docker-compose -f docker-compose.prod.yml up -d
```

---

### Pré-requisitos

- **Node.js** (v18 ou superior) - para desenvolvimento local do frontend
- **Python** (3.x) - para desenvolvimento local do backend
- **PostgreSQL** - banco de dados (ou use o RDS da AWS já configurado)
- **Docker e Docker Compose** (opcional, mas recomendado) - [Instalar Docker Desktop](https://www.docker.com/products/docker-desktop)

### 📥 Clonando e Baixando o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/renaneliakim1/Projeto_integrador.git
   cd projeto_integrador
   ```

### Opção 1: Execução com Docker (Recomendado) 🐳

**A forma mais simples e confiável de executar o projeto!**

✅ **Configurado para acesso em rede (PC, celular, tablet)**
✅ **Usa AWS RDS (sem PostgreSQL local)**
✅ **Scripts automatizados**

#### 🚀 Início Rápido:

```bash
docker-start.bat     # Inicia tudo automaticamente
```

#### 📊 Acessar:

**Do próprio PC:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

**De outro PC/celular (mesma WiFi):**
1. Descubra seu IP: `ipconfig` (ex: 192.168.15.7)
2. Frontend: `http://192.168.15.7:5173`
3. Backend: `http://192.168.15.7:8000`

#### 🛠️ Scripts Disponíveis:

```bash
docker-start.bat          # Inicia containers
docker-stop.bat           # Para containers
docker-logs.bat           # Ver logs
docker-rebuild.bat        # Rebuild completo
docker-diagnostico.bat    # Diagnóstico de rede
```

#### 📚 Documentação Completa:

- **Guia Docker**: `DOCKER_README.md`
- **Acesso em Rede**: `NETWORK_ACCESS_GUIDE.md`
- **Resumo**: `DOCKER_NETWORK_SUMMARY.md`

---

### Opção 2: Execução Local (Desenvolvimento)

Para desenvolvimento, você pode executar cada parte separadamente.

#### 🐍 Backend (Django)

1. **Navegue para a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Crie e ative um ambiente virtual:**
   ```bash
   python -m venv venv
   ```

   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

3. **Instale as dependências:**
   ```bash
   pip install -r ../requirements.txt
   ```

4. **Configure o banco de dados:**
   - Instale e configure PostgreSQL localmente, ou use Docker para o banco:
     ```bash
     docker run --name skillio-postgres -e POSTGRES_DB=skillio_db -e POSTGRES_USER=skillio_user -e POSTGRES_PASSWORD=skillio_password -p 5432:5432 -d postgres:15
     ```

5. **Aplique as migrações:**
   ```bash
   python manage.py migrate
   ```

6. **Inicie o servidor:**

   ### 🏠 Modo Local (Apenas PC)
   ```bash
   python manage.py runserver
   ```
   ✅ Acesse: http://127.0.0.1:8000
   
   **Características:**
   - Acessível apenas do próprio computador
   - Ideal para desenvolvimento local
   - Não precisa configurar firewall

   ### 📱 Modo Rede (PC + Mobile)
   
   **Passo 1 - Descubra seu IP:**
   ```bash
   ipconfig          # Windows
   ifconfig          # Linux/Mac
   ```
   Procure por "IPv4" ou "inet" (ex: 192.168.0.89)
   
   **Passo 2 - Inicie com o IP:**
   ```bash
   python manage.py runserver  192.168.15.7:8000
   ```

   ```bash
   python manage.py runserver 192.168.0.89:8000
   ```

   
    ```bash
   python manage.py runserver 192.168.206.160:8000
   ```
   

   
    ```bash
   python manage.py runserver 172.27.240.1:8000
   ```
   

   

   (Substitua pelo seu IP)
   
   ✅ Acesse do PC: http://192.168.0.89:8000
   
   ✅ Acesse do Mobile: http://192.168.0.89:8000
   
   **Características:**
   - Acessível de qualquer dispositivo na mesma WiFi
   - Ideal para testes em celular/tablet
   - **Requer configuração de firewall** (veja seção abaixo)

   **💡 Atalho:** Use o script `backend\start_network.bat` que detecta o IP automaticamente!

7. **Acesse a documentação da API (Swagger):**
   - **Swagger UI**: http://127.0.0.1:8000/swagger/ (ou use seu IP de rede)
   - **ReDoc**: http://127.0.0.1:8000/redoc/
   - **Schema JSON**: http://127.0.0.1:8000/swagger.json

#### ⚛️ Frontend (React + TypeScript)

1. **Navegue para a pasta do frontend:**
   ```bash
   cd Frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   Ou se preferir usar Bun:
   ```bash
   bun install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env` (se existir)
   - Configure `VITE_API_BASE_URL=http://localhost:8000`

4. **Inicie o servidor de desenvolvimento:**

   ### 🏠 Modo Local (Apenas PC)
   ```bash
   npm run dev
   ```
   Ou com Bun:
   ```bash
   bun run dev
   ```
   
   ✅ Acesse: http://localhost:5173
   
   **Características:**
   - Acessível apenas do próprio computador
   - URL padrão do Vite (localhost:5173)
   - Ideal para desenvolvimento local

   ### 📱 Modo Rede (PC + Mobile)
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
   
   O Vite mostrará algo como:
   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.0.89:5173/
   ```
   
   ✅ Acesse do PC: http://localhost:5173
   
   ✅ Acesse do Mobile: http://192.168.0.89:5173 (use o IP "Network")
   
   **Características:**
   - `--host 0.0.0.0` permite acesso externo
   - Acessível de qualquer dispositivo na mesma WiFi
   - Vite mostra automaticamente o IP de rede
   - Frontend detecta automaticamente o IP do backend (configurado em `axios.ts`)

   **💡 Atalho:** Use o script `Frontend\start_network.bat` para iniciar automaticamente!

   **🔧 Configuração Automática de API:**
   O frontend detecta automaticamente se está sendo acessado via IP de rede e ajusta a URL da API:
   - Acesso via `localhost` → API: `http://127.0.0.1:8000`
   - Acesso via `192.168.x.x` → API: `http://192.168.x.x:8000`
   
   (Veja `Frontend/src/api/axios.ts` para detalhes)

## 📁 Estrutura do Projeto

```
projeto_integrador/
├── backend/                 # API Django
│   ├── core/               # Configurações principais
│   ├── api/                # Aplicação principal
│   ├── media/              # Arquivos de mídia
│   ├── manage.py           # Script de gerenciamento Django
│   └── requirements.txt    # Dependências Python
├── Frontend/               # Interface React
│   ├── src/                # Código fonte
│   ├── public/             # Assets estáticos
│   ├── package.json        # Dependências Node.js
│   └── vite.config.ts      # Configuração Vite
├── mobile/                 # Aplicativo móvel (em desenvolvimento)
├── docker-compose.yml      # Configuração Docker
├── requirements.txt        # Dependências Python globais
└── README.md              # Este arquivo
```

## 🔧 Configurações Adicionais

### Variáveis de Ambiente

Para o backend, crie um arquivo `.env` na pasta `backend/` com:

```env
DEBUG=1
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=postgresql://skillio_user:skillio_password@localhost:5432/skillio_db
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Banco de Dados

O projeto usa PostgreSQL. Para desenvolvimento local:

```bash
# Usando Docker
docker run --name skillio-postgres \
  -e POSTGRES_DB=skillio_db \
  -e POSTGRES_USER=skillio_user \
  -e POSTGRES_PASSWORD=skillio_password \
  -p 5432:5432 \
  -d postgres:15
```

## 🐛 Solução de Problemas

### Erro: "ImportError: cannot import name 'load_dotenv'"

- Certifique-se de que o ambiente virtual está ativado
- Reinstale as dependências: `pip install -r ../requirements.txt`

### Erro: "ModuleNotFoundError: No module named 'drf_yasg'"

- Instale o pacote: `pip install drf-yasg`

### Erro: "Porta já em uso"

- Mude as portas no `docker-compose.yml` ou pare outros serviços

### Frontend não conecta com Backend

- Verifique se o backend está rodando
- Confirme a URL da API no `.env` do frontend

### Acesso Mobile: ERR_CONNECTION_REFUSED

**Problema comum:** Dispositivos móveis não conseguem acessar o backend mesmo na mesma rede Wi-Fi.

**Causa:** O Django por padrão inicia em `127.0.0.1:8000` (localhost apenas), que não aceita conexões externas. Além disso, firewalls podem bloquear as portas 8000 e 8080.

**✅ Solução Completa (Passo a Passo):**

#### 1️⃣ Inicie o servidor no modo REDE (ESSENCIAL)

**❌ NÃO faça isso:**
```bash
python manage.py runserver        # Só funciona em localhost!
```

**✅ FAÇA isso:**
```bash
# Descubra seu IP primeiro
ipconfig   # Windows
ifconfig   # Linux/Mac

# Inicie com o IP (ex: 192.168.0.89)
python manage.py runserver 192.168.0.89:8000
```

**💡 Atalho:** Use o script que detecta o IP automaticamente:
```bash
backend\start_network.bat     # Windows
```

#### 2️⃣ Configure o Firewall do Windows

**Método 1 - PowerShell (Rápido):**
```powershell
# Execute como Administrador
New-NetFirewallRule -DisplayName "Skillio Backend (8000)" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Skillio Frontend (8080)" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

**Método 2 - Interface Gráfica:**
1. Painel de Controle → Sistema e Segurança → Firewall do Windows
2. Configurações Avançadas
3. Regras de Entrada → Nova Regra
4. Porta → TCP → `8000,8080`
5. Permitir Conexão → Nome: "Skillio Dev"

#### 3️⃣ Configure o Firewall do Antivírus (se tiver)

**Avast, Norton, McAfee, etc:**

**Opção A - Liberar Portas:**
- Abra o Antivírus → Configurações → Firewall → Regras de Pacote
- Adicione regra:
  - Nome: `Skillio Dev`
  - Direção: **Entrada**
  - Protocolo: **TCP**
  - Portas: `8000, 8080`
  - Ação: **Permitir**

**Opção B - Adicionar Exceção ao Executável:**
- Adicione `backend\venv\Scripts\python.exe` nas exceções

#### 4️⃣ Verifique se está escutando no IP correto

```bash
netstat -an | findstr :8000
```

**Deve mostrar:**
```
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
TCP    192.168.0.89:8000      ...                    ESTABLISHED
```

✅ **Correto:** `0.0.0.0:8000` ou `192.168.0.89:8000`

❌ **Errado:** `127.0.0.1:8000` (não aceita conexões externas!)

#### 5️⃣ Teste do celular

**Certifique-se:**
- ✅ PC e celular na **mesma WiFi**
- ✅ Backend rodando em: `http://192.168.0.89:8000`
- ✅ Frontend rodando em: `http://192.168.0.89:8080`

**No navegador do celular:**
```
http://192.168.0.89:8080
```

---

### � Resumo - Comandos para Acesso Mobile

**Opção 1 - Scripts Automáticos (RECOMENDADO):**
```cmd
start_network.bat     # Detecta IP e inicia tudo
```

**Opção 2 - Manual:**
```bash
# Backend
cd backend
call venv\Scripts\activate.bat
python manage.py runserver 192.168.0.89:8000


ou 



cd backend
call venv\Scripts\activate.bat
python manage.py runserver 192.168.206.80:8000

# Frontend (outro terminal)
cd Frontend
npm run dev -- --host 0.0.0.0
```

**Configurar Firewall:**
```powershell
# PowerShell como Administrador
New-NetFirewallRule -DisplayName "Skillio Dev" -Direction Inbound -LocalPort 8000,8080 -Protocol TCP -Action Allow
```

**No celular:**
```
http://192.168.0.89:8080
```

💡 **Dica Final:** Sempre use `start_network.bat` para evitar esquecer o IP correto!

## 📖 Documentação da API (Swagger)

O projeto possui documentação interativa da API usando **Swagger/OpenAPI**.

### Acesso à Documentação

- **Swagger UI** (Interativo): http://localhost:8000/swagger/
- **ReDoc** (Limpo): http://localhost:8000/redoc/
- **Schema JSON**: http://localhost:8000/swagger.json
- **Schema YAML**: http://localhost:8000/swagger.yaml

### Como Autenticar no Swagger

1. Faça login via `/api/v1/auth/login/` para obter o token JWT
2. Clique no botão **🔒 Authorize** no topo do Swagger
3. Digite: `Bearer SEU_TOKEN_AQUI`
4. Clique em "Authorize"
5. Agora você pode testar todos os endpoints protegidos!

### Principais Endpoints Documentados

- **Autenticação**: Login, refresh token
- **Usuários**: Registro, perfil, atualização
- **Gamificação**: XP, vidas, blocos, conquistas
- **Performance**: Atualização de desempenho por matéria
- **Activity Log**: Histórico de atividades do usuário

## 📚 Documentação Adicional

### Guias Gerais
- [Documentacao/](./Documentacao/) - Documentação específica do projeto
- [TODO.md](./TODO.md) - Lista de tarefas pendentes

### 🔐 Recuperação de Senha (AWS Cognito)
- **[🚀 Tutorial Rápido (15 min)](./Docs/AWS_COGNITO_QUICK_TUTORIAL.md)** - Configure AWS Cognito rapidamente
- **[📖 Guia Completo](./Docs/AWS_COGNITO_SETUP.md)** - Documentação detalhada com troubleshooting
- **[⚡ Guia de Início Rápido](./Docs/PASSWORD_RESET_QUICKSTART.md)** - Visão geral da implementação

### Outros Guias
- [Docs/](./Docs/) - Todos os guias de configuração e deploy
- [DOCKER_README.md](./Docs/DOCKER_README.md) - Guia Docker
- [RENDER_DEPLOY.md](./Docs/RENDER_DEPLOY.md) - Deploy no Render

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

Para dúvidas ou suporte, entre em contato com a equipe de desenvolvimento.

# Progressive Web App (PWA)

A interface web (Frontend) agora suporta PWA! Você pode instalar o Skillio como aplicativo no seu celular ou computador.

**Como usar:**
- Acesse o site pelo navegador (Chrome, Edge, Firefox, etc)
- Procure o botão "Instalar" ou use o menu do navegador para adicionar à tela inicial
- O app funciona offline e pode receber atualizações automáticas

**Funcionalidades PWA:**
- Instalação como app nativo
- Ícone personalizado
- Suporte offline básico
- Atualização automática via service worker

**Como testar localmente:**
1. Execute o Frontend normalmente:
   ```cmd
   cd Frontend
   npm run dev -- --host 0.0.0.0
   ```
2. Acesse pelo navegador: `http://localhost:5173` ou pelo IP da rede
3. Instale o app usando o navegador

**Observação:**
- O PWA está disponível apenas na interface web (pasta Frontend)
- As pastas "mobile" e "mobile22" não são afetadas
- Para ícones personalizados, substitua os arquivos `Frontend/public/pwa-192x192.png` e `Frontend/public/pwa-512x512.png` por suas imagens

---
