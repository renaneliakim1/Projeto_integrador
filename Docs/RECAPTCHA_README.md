# 🔐 Google reCAPTCHA v3 - Implementação Completa

## ✅ O que foi implementado

### Frontend
1. ✅ Instalado `react-google-recaptcha-v3`
2. ✅ Adicionado `GoogleReCaptchaProvider` no `App.tsx`
3. ✅ Integrado reCAPTCHA no componente `Login.tsx`
4. ✅ Criado arquivo `.env.example` com variáveis necessárias

### Arquivos Modificados
- `Frontend/src/App.tsx` - Provider do reCAPTCHA
- `Frontend/src/pages/Login.tsx` - Hook e validação
- `Frontend/.env.example` - Template de configuração

### Arquivos Criados
- `Frontend/RECAPTCHA_SETUP.md` - Guia completo de configuração
- `backend/recaptcha_example.py` - Exemplo de implementação no backend

## 🚀 Próximos Passos

### 1. Obter Chaves do Google (5 minutos)
1. Acesse https://www.google.com/recaptcha/admin
2. Crie um novo site com reCAPTCHA v3
3. Adicione domínios: `localhost` e seu domínio de produção
4. Copie a **Site Key** e **Secret Key**

### 2. Configurar Frontend
```bash
cd Frontend
cp .env.example .env
# Edite o .env e adicione:
# VITE_RECAPTCHA_SITE_KEY=sua_site_key_aqui
```

### 3. Configurar Backend
```bash
cd backend
pip install django-recaptcha requests
```

Adicione ao `settings.py`:
```python
RECAPTCHA_PRIVATE_KEY = 'sua_secret_key_aqui'
RECAPTCHA_REQUIRED_SCORE = 0.5
```

### 4. Implementar Validação no Backend
Use o código exemplo em `backend/recaptcha_example.py`

## 🎯 Como Funciona

1. **Usuário tenta fazer login**
2. **Frontend**: Executa reCAPTCHA invisível → Gera token
3. **Frontend**: Envia credenciais + token para o backend
4. **Backend**: Valida token com Google → Verifica score
5. **Backend**: Se score ≥ 0.5 → Permite login

## 📊 Interpretação dos Scores

| Score | Significado |
|-------|------------|
| 0.0 - 0.3 | 🤖 Provavelmente bot |
| 0.3 - 0.7 | 🤔 Suspeito |
| 0.7 - 1.0 | ✅ Provavelmente humano |

## 🔒 Segurança

- ✅ Token único por requisição
- ✅ Validação server-side
- ✅ Invisível para usuários legítimos
- ✅ Não requer CAPTCHA visual

## 📖 Documentação Completa

Leia `Frontend/RECAPTCHA_SETUP.md` para instruções detalhadas.

## 🧪 Testando

O reCAPTCHA funciona automaticamente em:
- `localhost` (desenvolvimento)
- Domínios registrados (produção)

## ⚠️ Importante

- **NUNCA** exponha a Secret Key no frontend
- Use variáveis de ambiente
- Ajuste o score conforme necessário (padrão: 0.5)
- O badge do reCAPTCHA aparecerá no canto inferior direito
