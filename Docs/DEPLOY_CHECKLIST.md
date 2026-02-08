# 🎯 Deploy Rápido - Checklist

## ✅ Preparação Completa

Arquivos criados e configurados:
- ✅ `render.yaml` - Blueprint de deploy automático
- ✅ `backend/build.sh` - Script de build
- ✅ `backend/requirements.txt` - Adicionado gunicorn, whitenoise, dj-database-url
- ✅ `backend/core/settings.py` - Configurado para produção
- ✅ `backend/api/health.py` - Endpoint de health check
- ✅ `backend/api/urls.py` - Rota de health check adicionada
- ✅ `Frontend/.env.production` - Variáveis de ambiente de produção
- ✅ `RENDER_DEPLOY.md` - Guia completo de deploy

## 🚀 Próximos Passos

### 1. Commit e Push para GitHub

```powershell
git add .
git commit -m "feat: Configuração para deploy no Render"
git push origin Renan---AWS-Free-Tier
```

### 2. Deploy no Render (Escolha uma opção)

#### Opção A: Deploy Automático com Blueprint (Recomendado) 🌟

1. Acesse: https://dashboard.render.com/blueprints
2. Clique em **"New Blueprint Instance"**
3. Conecte o repositório: `renaneliakim1/Projeto_integrador`
4. Branch: `Renan---AWS-Free-Tier`
5. Configure as variáveis secretas:
   - `GEMINI_API_KEY=sua_chave`
   - `GOOGLE_API_KEY=sua_chave`
   - `CORS_ALLOWED_ORIGINS=https://skillio-frontend.onrender.com`
6. Clique em **"Apply"**

**Pronto! 🎉** O Render criará tudo automaticamente.

#### Opção B: Deploy Manual

Siga o guia detalhado em `RENDER_DEPLOY.md`

### 3. Após o Deploy

1. **Anote as URLs**:
   - Frontend: `https://skillio-frontend.onrender.com`
   - Backend: `https://skillio-backend.onrender.com`

2. **Atualize o CORS**:
   - No Render Dashboard → skillio-backend → Environment
   - Edite `CORS_ALLOWED_ORIGINS` com a URL real do frontend

3. **Teste a API**:
   - Acesse: `https://skillio-backend.onrender.com/swagger/`
   - Teste o endpoint de health: `https://skillio-backend.onrender.com/api/health/`

4. **Configure o Mobile**:
   - Edite `Mobile/src/services/api.ts`
   - Altere a `API_URL` para a URL do backend no Render

### 4. Evitar Cold Starts (Opcional)

Use **UptimeRobot** (gratuito):
1. Acesse: https://uptimerobot.com
2. Crie um monitor HTTP(s)
3. URL: `https://skillio-backend.onrender.com/api/health/`
4. Intervalo: 14 minutos

## 📊 Monitoramento

Acompanhe o deploy em:
- **Dashboard**: https://dashboard.render.com
- **Logs**: Render Dashboard → Seu serviço → Logs

## 🐛 Problemas Comuns

### Erro no build do backend
- Verifique se todas as dependências estão em `requirements.txt`
- Confira os logs do build no Render

### Frontend não conecta com backend
- Confirme se `VITE_API_URL` está correto
- Verifique CORS no backend

### Database error
- Confirme que as migrations rodaram
- Verifique se `DATABASE_URL` está configurada

## 💡 Dicas

- **Free tier**: Aguarde ~30s no primeiro acesso (cold start)
- **Logs**: Use o dashboard do Render para debugar
- **Migrations**: Executam automaticamente no build
- **Static files**: WhiteNoise cuida disso automaticamente

---

**Tudo pronto para o deploy! 🚀**

Dúvidas? Consulte `RENDER_DEPLOY.md` para o guia completo.
