# Projeto Integrador - Skillio

O **Skillio** é uma plataforma educacional gamificada desenvolvida para auxiliar estudantes no aprendizado de disciplinas escolares. O projeto integra conceitos de gamificação, inteligência artificial generativa e um sistema de trilhas de aprendizado personalizadas.

## 📋 Funcionalidades Principais

- **Gamificação**: Sistema de pontos, conquistas, missões e ranking.
- **Trilhas de Aprendizado**: Percursos personalizados baseados no desempenho do aluno.
- **Inteligência Artificial**: Geração de conteúdo educacional personalizado usando IA generativa.
- **Dashboard Interativo**: Visualização de progresso e estatísticas.
- **Sistema de Quiz**: Avaliações adaptativas para nivelamento.
- **Perfil do Usuário**: Gerenciamento de perfil com foto e estatísticas.

## 🏗️ Arquitetura do Projeto

O projeto é composto por três partes principais:

- **Backend**: API REST desenvolvida em Django (Python)
- **Frontend**: Interface web desenvolvida em React com TypeScript
- **Mobile**: Aplicativo móvel (em desenvolvimento)

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Docker e Docker Compose** (recomendado para execução completa)
- **Node.js** (v18 ou superior) - para desenvolvimento local do frontend
- **Python** (3.x) - para desenvolvimento local do backend
- **PostgreSQL** - banco de dados (incluído no Docker)
- **Redis** - cache (incluído no Docker)

### 📥 Clonando e Baixando o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/renaneliakim1/Projeto_integrador.git
   cd projeto_integrador
   ```

### Opção 1: Execução com Docker (Recomendado)

Esta é a forma mais simples de executar o projeto completo, pois configura automaticamente todos os serviços necessários.

#### Passos:

1. **Certifique-se de que o Docker está instalado e rodando**

2. **Execute o projeto:**
   ```bash
   docker-compose up --build
   ```

3. **Acesse as aplicações:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **Swagger UI**: http://localhost:8000/swagger/
   - **ReDoc**: http://localhost:8000/redoc/
   - **Admin Django**: http://localhost:8000/admin

#### Acesso em Outro Dispositivo/Rede

Para acessar de outro PC na mesma rede:

1. **Descubra o IP do seu computador:**
   - Windows: `ipconfig` no CMD
   - Linux/Mac: `ifconfig` ou `ip addr` no terminal

2. **Substitua `localhost` pelo seu IP:**
   - Frontend: `http://SEU_IP:3000`
   - Backend: `http://SEU_IP:8000`

3. **Configure o firewall** para permitir conexões nas portas 3000 e 8000.

#### Comandos Úteis do Docker

```bash
# Parar os containers
docker-compose down

# Ver logs em tempo real
docker-compose logs -f

# Reconstruir e executar
docker-compose up --build --force-recreate

# Executar em background
docker-compose up -d

# Remover volumes (dados do banco)
docker-compose down -v
```

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
   
   **Para acesso apenas local:**
   ```bash
   python manage.py runserver
   ```
   O backend estará disponível em: http://127.0.0.1:8000

   **Para acesso de dispositivos móveis na mesma rede:**
   ```bash
   python manage.py runserver 192.168.0.89:8000
   ```
   (Substitua `192.168.0.89` pelo IP do seu computador - descubra com `ipconfig`)

7. **Acesse a documentação da API (Swagger):**
   - **Swagger UI**: http://127.0.0.1:8000/swagger/
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
   ```bash
   npm run dev
   ```
   Ou com Bun:
   ```bash
   bun run dev
   ```

   O frontend estará disponível em: http://localhost:5173

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

**Causa:** O Django por padrão inicia em `127.0.0.1:8000` (localhost apenas), que não aceita conexões externas. Além disso, firewalls podem bloquear a porta 8000.

**Solução completa:**

1. **Inicie o servidor com IP de rede (ESSENCIAL):**
   ```bash
   python manage.py runserver 192.168.0.89:8000
   ```
   ⚠️ **NÃO use** apenas `python manage.py runserver` (isso volta para localhost)
   
   💡 Use `ipconfig` no CMD para descobrir seu IP local (procure por "Endereço IPv4")

2. **Firewall do Windows:**
   ```powershell
   # Execute como Administrador no PowerShell
   New-NetFirewallRule -DisplayName "Django Backend - Porta 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```

3. **Firewall do Antivírus (Avast, Norton, McAfee, etc.):**
   - Abra o Avast → **Menu** → **Configurações** → **Proteção** → **Firewall**
   - Vá em **Regras de pacote** → **Nova regra**
   - Configure:
     - Nome: `Django Backend`
     - Direção: **Entrada**
     - Protocolo: **TCP**
     - Porta remota: `Qualquer`
     - Porta local: `8000`
     - Ação: **Permitir**
   
   **Ou adicione exceção para:** `backend\venv\Scripts\python.exe`

4. **Verifique se está escutando no IP correto:**
   ```bash
   netstat -an | findstr :8000
   ```
   Deve mostrar conexões com seu IP (ex: 192.168.0.89:8000)

5. **Teste do mobile:**
   - Frontend: `http://192.168.0.89:8080`
   - Backend: `http://192.168.0.89:8000`

💡 **Dica:** Use o arquivo `backend\start_server.bat` e escolha opção [2] para iniciar automaticamente no modo rede!

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

- [Documentacao/](./Documentacao/) - Documentação específica do projeto
- [TODO.md](./TODO.md) - Lista de tarefas pendentes

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
