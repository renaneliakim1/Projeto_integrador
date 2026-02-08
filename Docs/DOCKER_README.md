# 🐳 Guia Docker - Skillio

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Git (para clonar o repositório)
- Conexão com internet (para baixar imagens)

## 🚀 Início Rápido

### 1. Iniciar o projeto completo

```bash
docker-start.bat
```

Este comando irá:
- Parar containers antigos
- Construir as imagens Docker
- Iniciar backend e frontend
- Aplicar migrações no banco de dados AWS RDS

### 2. Descobrir seu IP

```bash
ipconfig
```

Anote o **Endereço IPv4** (ex: `192.168.15.7`)

### 3. Acessar a aplicação

- **Frontend**: http://[SEU-IP]:5173 ou http://localhost:5173
- **Backend API**: http://[SEU-IP]:8000 ou http://localhost:8000
- **Admin Django**: http://[SEU-IP]:8000/admin

### 4. Parar os containers

```bash
docker-stop.bat
```

## 📊 Comandos Úteis

### Ver logs em tempo real

```bash
docker-logs.bat
```

Ou logs de um serviço específico:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Diagnóstico de rede (acesso externo)

```bash
docker-diagnostico.bat
```

Este script verifica:
- IP do computador
- Status dos containers
- Portas abertas
- Conectividade local
- Regras de firewall

### Rebuild completo (limpar tudo e reconstruir)

```bash
docker-rebuild.bat
```

Use quando:
- Mudou dependências (package.json, requirements.txt)
- Quer garantir build limpo
- Está tendo problemas de cache

### Executar comandos no backend

```bash
# Acessar shell do container
docker-compose exec backend bash

# Rodar migrations
docker-compose exec backend python manage.py migrate

# Criar superuser
docker-compose exec backend python manage.py createsuperuser

# Executar script Python
docker-compose exec backend python manage.py shell
```

### Executar comandos no frontend

```bash
# Acessar shell do container
docker-compose exec frontend sh

# Instalar nova dependência
docker-compose exec frontend npm install <package-name>
```

## 🏗️ Estrutura do Projeto

```
Projeto_integrador/
├── backend/
│   ├── Dockerfile              # Configuração Docker do Django
│   ├── requirements.txt        # Dependências Python
│   └── ...
├── Frontend/
│   ├── Dockerfile              # Configuração Docker do Vite
│   ├── package.json            # Dependências Node
│   └── ...
├── docker-compose.yml          # Orquestração dos containers
├── .dockerignore               # Arquivos ignorados pelo Docker
├── docker-start.bat            # Script de início
├── docker-stop.bat             # Script de parada
├── docker-logs.bat             # Ver logs
└── docker-rebuild.bat          # Rebuild completo
```

## 🔧 Configuração

### Variáveis de Ambiente

As variáveis são definidas no `docker-compose.yml`:

**Backend:**
- `DB_NAME`: skillio_db
- `DB_USER`: postgres
- `DB_PASSWORD`: Skillio*7
- `DB_HOST`: database-1.ctg0eyqokqwa.us-east-2.rds.amazonaws.com (AWS RDS)
- `DB_PORT`: 5432

**Frontend:**
- `VITE_API_BASE_URL`: http://192.168.15.7:8000

### Portas Expostas

- `8000`: Backend Django
- `5173`: Frontend Vite

## 🐛 Troubleshooting

### Erro: "port is already allocated"

```bash
# Ver o que está usando a porta
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Parar containers
docker-compose down

# Matar processo específico
taskkill /F /PID <PID>
```

### Erro ao conectar no banco de dados

Verifique:
1. Credenciais AWS RDS corretas no `docker-compose.yml`
2. Security Group do RDS permite conexão do seu IP
3. Banco de dados `skillio_db` existe no RDS

```bash
# Ver logs do backend
docker-compose logs backend
```

### Frontend não atualiza código

```bash
# O volume está mapeado para hot-reload
# Se não funcionar, rebuild:
docker-compose restart frontend
```

### Limpar tudo e começar do zero

```bash
# Parar e remover tudo
docker-compose down -v

# Remover imagens
docker rmi projeto_integrador-backend projeto_integrador-frontend

# Rebuild
docker-start.bat
```

## 📦 Build para Produção

Para produção, você precisará:

1. **Backend**: Usar Gunicorn em vez de runserver
2. **Frontend**: Build estático com `npm run build`
3. **Nginx**: Servir arquivos estáticos
4. **SSL**: Certificados HTTPS

Exemplo de comando para produção no backend:

```dockerfile
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

## 🔐 Segurança

⚠️ **IMPORTANTE**: Antes de colocar em produção:

1. Mude `SECRET_KEY` do Django
2. Configure `DEBUG=0`
3. Use variáveis de ambiente seguras (não no código)
4. Configure HTTPS
5. Restrinja CORS apenas para domínios permitidos
6. Use senhas fortes para banco de dados

## 📱 Acessar do Celular

Se quiser acessar do celular na mesma rede WiFi:

1. Certifique-se que está na mesma rede (Vivofribra)
2. Acesse: http://192.168.15.7:5173
3. Verifique firewall do Windows permite conexões

## 🎯 Arquivos Ignorados

O `.dockerignore` exclui automaticamente:

- Pastas `Mobile/`, `mobile/`, `mobile3/`
- `node_modules/`
- Arquivos `.env`
- `__pycache__/`
- Arquivos temporários

## 💡 Dicas

1. **Desenvolvimento**: Use `docker-compose up` (sem `-d`) para ver logs em tempo real
2. **Hot Reload**: Funciona automaticamente graças aos volumes mapeados
3. **Banco de Dados**: Usando AWS RDS, não precisa de container PostgreSQL local
4. **Performance**: Em Windows, WSL2 + Docker Desktop tem melhor performance
5. **Logs**: Use `docker-compose logs -f --tail=100` para ver últimas 100 linhas
6. **Acesso em Rede**: Leia `NETWORK_ACCESS_GUIDE.md` para acessar de outros PCs/celulares

## 🌐 Acesso de Outros Dispositivos

O projeto está **100% configurado** para acesso de outros PCs e celulares na mesma rede!

**Resumo:**
1. Execute `docker-start.bat` no PC servidor
2. Descubra seu IP: `ipconfig` (ex: 192.168.15.7)
3. Em outro dispositivo na mesma WiFi: `http://192.168.15.7:5173`
4. O frontend detecta automaticamente o IP e ajusta a API

**Detalhes completos:** Consulte `NETWORK_ACCESS_GUIDE.md`

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs: `docker-logs.bat`
2. Verifique status: `docker-compose ps`
3. Verifique recursos: `docker stats`
4. Rebuild limpo: `docker-rebuild.bat`

---

**Desenvolvido com ❤️ para aprendizado interativo**
