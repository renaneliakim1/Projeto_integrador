# 🚀 Guia de Deploy no Render

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com) (grátis)
2. Repositório no GitHub com o código
3. API Keys (Gemini, Google) em mãos

---

## 🎯 Deploy Automático com Blueprint

### Opção 1: Deploy com 1 Clique (Recomendado)

1. **Acesse o Render Dashboard**: https://dashboard.render.com
2. **New → Blueprint**
3. **Conecte o repositório GitHub**: `renaneliakim1/Projeto_integrador`
4. **Branch**: `Renan---AWS-Free-Tier`
5. **Blueprint file**: `render.yaml` (detectado automaticamente)
6. **Configure as variáveis secretas**:
   ```
   GEMINI_API_KEY=sua_chave_aqui
   GOOGLE_API_KEY=sua_chave_aqui
   CORS_ALLOWED_ORIGINS=https://skillio-frontend.onrender.com
   ```
7. **Clique em "Apply"** 🎉

O Render vai criar TUDO automaticamente:
- ✅ PostgreSQL Database
- ✅ Redis Instance
- ✅ Backend Django API
- ✅ Frontend React
- ✅ Celery Worker

### Opção 2: Deploy Manual (Passo a Passo)

Se preferir criar cada serviço manualmente:

#### 1️⃣ PostgreSQL Database

```
Name: skillio-db
Database: skillio_db
User: skillio_user
Region: Oregon (US West)
Plan: Free
```

**Após criar, copie o `Internal Database URL`**

#### 2️⃣ Redis Instance

```
Name: skillio-redis
Plan: Free
Region: Oregon
```

**Após criar, copie o `Internal Redis URL`**

#### 3️⃣ Backend Web Service

```
Name: skillio-backend
Environment: Python
Region: Oregon
Branch: Renan---AWS-Free-Tier
Root Directory: backend
Build Command: pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
Start Command: gunicorn core.wsgi:application
Plan: Free
```

**Environment Variables:**
```bash
PYTHON_VERSION=3.11.6
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=[Auto Generate]
DATABASE_URL=[Cole o Internal Database URL]
REDIS_URL=[Cole o Internal Redis URL]
ALLOWED_HOSTS=.onrender.com
CORS_ALLOWED_ORIGINS=https://skillio-frontend.onrender.com
GEMINI_API_KEY=sua_chave
GOOGLE_API_KEY=sua_chave
```

**Health Check Path:** `/api/health/`

#### 4️⃣ Frontend Static Site

```
Name: skillio-frontend
Environment: Static Site
Region: Oregon
Branch: Renan---AWS-Free-Tier
Root Directory: Frontend
Build Command: npm install && npm run build
Publish Directory: ./dist
Plan: Free
```

**Environment Variables:**
```bash
NODE_VERSION=20.10.0
VITE_API_URL=https://skillio-backend.onrender.com
```

**Rewrite Rules:**
- Source: `/*`
- Destination: `/index.html`

#### 5️⃣ Celery Worker (Opcional - Para Background Tasks)

```
Name: skillio-celery
Environment: Python
Region: Oregon
Branch: Renan---AWS-Free-Tier
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: celery -A core worker --loglevel=info
Plan: Free
```

**Environment Variables:** (mesmas do backend)

---

## 🔧 Configurações Necessárias no Código

### 1. Adicionar Gunicorn ao requirements.txt

```bash
cd backend
echo "gunicorn==21.2.0" >> requirements.txt
```

### 2. Atualizar settings.py para produção

Já vou fazer isso automaticamente para você! ✅

### 3. Criar endpoint de health check

Também vou criar isso! ✅

---

## 📊 Após o Deploy

### URLs dos Serviços

Você receberá URLs assim:
- **Frontend**: `https://skillio-frontend.onrender.com`
- **Backend**: `https://skillio-backend.onrender.com`
- **API Docs**: `https://skillio-backend.onrender.com/swagger/`

### Configurar o Mobile (Expo)

Edite `Mobile/src/services/api.ts`:
```typescript
const API_URL = 'https://skillio-backend.onrender.com/api';
```

### Atualizar CORS no Backend

No Render Dashboard → skillio-backend → Environment:
```bash
CORS_ALLOWED_ORIGINS=https://skillio-frontend.onrender.com,https://skillio-mobile.app
```

---

## ⚠️ Limitações do Free Tier

### O que esperar:

✅ **Funciona perfeitamente** para:
- Desenvolvimento
- Testes
- Portfolio
- Demonstrações

⚠️ **Limitações**:
- **Cold Starts**: Após 15min sem uso, demora ~30s no primeiro acesso
- **750h/mês**: Se usar 24/7, vai dormir alguns dias no final do mês
- **Desempenho**: Mais lento que o paid tier

### Evitar Cold Starts (Hack Gratuito):

Use **UptimeRobot** ou **Cron-Job.org** para fazer ping a cada 14 minutos:
```
GET https://skillio-backend.onrender.com/api/health/
```

---

## 💰 Upgrade para Paid (Quando Necessário)

**$7/mês por serviço** = Zero downtime + Melhor performance

Custo estimado:
- Backend: $7/mês
- Frontend: $0 (static site sempre free)
- Database: $7/mês (ou usar Supabase free)
- Redis: $7/mês (ou usar Upstash free)

**Total**: ~$21/mês para 100% uptime

---

## 🐛 Troubleshooting

### Erro: "Application failed to respond"
- Verifique os logs no Render Dashboard
- Confirme que `ALLOWED_HOSTS` inclui `.onrender.com`
- Health check path está correto?

### Erro de Database
- Confirme que `DATABASE_URL` está configurada
- Verifique se as migrations rodaram no build

### Frontend não carrega
- `VITE_API_URL` está apontando para o backend correto?
- Rewrite rule `/* → /index.html` está configurada?

### Cold Start muito lento
- Configure UptimeRobot para fazer ping
- Ou upgrade para paid tier ($7/mês)

---

## 📚 Recursos Úteis

- [Render Docs - Django](https://render.com/docs/deploy-django)
- [Render Docs - React/Vite](https://render.com/docs/deploy-vite)
- [Dashboard Render](https://dashboard.render.com)

---

## ✅ Checklist Final

- [ ] Blueprint aplicado ou serviços criados manualmente
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Migrations executadas com sucesso
- [ ] Frontend carregando e conectando com backend
- [ ] API retornando dados corretamente
- [ ] Swagger docs acessível em `/swagger/`
- [ ] CORS configurado corretamente
- [ ] UptimeRobot configurado (opcional)

---

**🎉 Parabéns! Seu app está no ar!**
