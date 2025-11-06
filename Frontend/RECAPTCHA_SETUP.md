# Configuração do Google reCAPTCHA v3

Este guia explica como configurar o Google reCAPTCHA v3 no projeto.

## Passo 1: Obter as Chaves do reCAPTCHA

1. Acesse o [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Clique em "+" para criar um novo site
3. Preencha os dados:
   - **Label**: Nome do seu projeto (ex: "Skillio")
   - **reCAPTCHA type**: Selecione **reCAPTCHA v3**
   - **Domains**: Adicione seus domínios:
     - `localhost` (para desenvolvimento)
     - Seu domínio de produção (ex: `skillio.com`)
4. Aceite os termos de serviço
5. Clique em "Submit"

Você receberá duas chaves:
- **Site Key**: Usada no frontend (pública)
- **Secret Key**: Usada no backend (privada)

## Passo 2: Configurar o Frontend

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione sua **Site Key**:
   ```env
   VITE_RECAPTCHA_SITE_KEY=sua_site_key_aqui
   ```

## Passo 3: Configurar o Backend (Django)

1. Instale a biblioteca necessária:
   ```bash
   pip install django-recaptcha
   ```

2. Adicione ao `settings.py`:
   ```python
   INSTALLED_APPS = [
       # ... outras apps
       'captcha',
   ]

   # Configurações do reCAPTCHA
   RECAPTCHA_PUBLIC_KEY = 'sua_site_key_aqui'
   RECAPTCHA_PRIVATE_KEY = 'sua_secret_key_aqui'
   RECAPTCHA_REQUIRED_SCORE = 0.5  # Score mínimo (0.0 a 1.0)
   ```

3. No seu view de login, adicione a validação:
   ```python
   import requests
   from django.conf import settings

   def validate_recaptcha(token):
       response = requests.post(
           'https://www.google.com/recaptcha/api/siteverify',
           data={
               'secret': settings.RECAPTCHA_PRIVATE_KEY,
               'response': token
           }
       )
       result = response.json()
       return result.get('success', False) and result.get('score', 0) >= settings.RECAPTCHA_REQUIRED_SCORE

   # No seu login view:
   def login_view(request):
       recaptcha_token = request.data.get('recaptcha_token')
       
       if not validate_recaptcha(recaptcha_token):
           return Response({
               'detail': 'Validação de segurança falhou. Tente novamente.'
           }, status=400)
       
       # Continue com a lógica de login...
   ```

## Como Funciona

### Frontend
1. O `GoogleReCaptchaProvider` envolve toda a aplicação no `App.tsx`
2. No componente `Login.tsx`, usamos o hook `useGoogleReCaptcha()`
3. Ao submeter o formulário, executamos `executeRecaptcha('login')`
4. O token gerado é enviado para o backend junto com as credenciais

### Backend
1. O backend recebe o token do reCAPTCHA
2. Valida o token com a API do Google
3. Verifica o score (0.0 a 1.0):
   - 0.0 = Muito provável ser um bot
   - 1.0 = Muito provável ser humano
4. Se o score for >= 0.5, permite o login

## Segurança

- **Nunca** exponha sua Secret Key no frontend
- Use variáveis de ambiente para armazenar as chaves
- Configure CORS adequadamente no backend
- Ajuste o score mínimo conforme necessário (recomendado: 0.5)

## Testando

1. Durante o desenvolvimento, o reCAPTCHA funciona em `localhost`
2. Para testar em produção, adicione seu domínio no console do reCAPTCHA
3. O badge do reCAPTCHA aparecerá no canto inferior direito da página

## Solução de Problemas

### Badge não aparece
- Verifique se a Site Key está correta no `.env`
- Certifique-se que o `GoogleReCaptchaProvider` está envolvendo a aplicação

### Validação falha sempre
- Verifique se o domínio está registrado no console do reCAPTCHA
- Confirme que a Secret Key no backend está correta
- Verifique os logs do backend para mensagens de erro

### Score muito baixo
- Ajuste o `RECAPTCHA_REQUIRED_SCORE` no backend
- Scores baixos podem acontecer em ambientes de teste

## Links Úteis

- [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [Documentação reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [django-recaptcha GitHub](https://github.com/torchbox/django-recaptcha)
