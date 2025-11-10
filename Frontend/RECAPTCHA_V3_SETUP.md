# Configuração do Google reCAPTCHA v3

## O que mudou?

O sistema foi atualizado de **reCAPTCHA v2** (com checkbox) para **reCAPTCHA v3** (invisível).

### Diferenças principais:

- **v2**: Usuário precisa clicar em "Não sou um robô"
- **v3**: Validação automática e invisível, baseada em score de comportamento

## Configuração necessária

### 1. Criar chaves do reCAPTCHA v3

1. Acesse: https://www.google.com/recaptcha/admin
2. Clique em "+" para adicionar novo site
3. Preencha:
   - **Label**: Nome do seu projeto (ex: Skillio Suporte)
   - **reCAPTCHA type**: Selecione **reCAPTCHA v3**
   - **Domains**: 
     - `localhost` (para desenvolvimento)
     - Seu domínio de produção (ex: `skillio.com`)
4. Aceite os termos e clique em "Submit"
5. Copie as chaves geradas:
   - **Site Key** (chave pública)
   - **Secret Key** (chave privada - use no backend)

### 2. Configurar variáveis de ambiente

#### Frontend (.env)

```env
VITE_RECAPTCHA_SITE_KEY=sua_site_key_aqui
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_USER_ID=seu_user_id
```

#### Backend (se validar server-side)

```env
RECAPTCHA_SECRET_KEY=sua_secret_key_aqui
```

### 3. Validação no backend (opcional mas recomendado)

Para validar o token do reCAPTCHA v3 no backend:

```python
import requests

def verify_recaptcha(token, secret_key):
    """Verifica o token do reCAPTCHA v3"""
    url = 'https://www.google.com/recaptcha/api/siteverify'
    data = {
        'secret': secret_key,
        'response': token
    }
    
    response = requests.post(url, data=data)
    result = response.json()
    
    # Score de 0.0 a 1.0 (quanto maior, mais humano)
    # Recomendado: aceitar score >= 0.5
    return result.get('success') and result.get('score', 0) >= 0.5
```

### 4. Integração no EmailJS (se usar)

No template do EmailJS, adicione um campo para receber o token:

```
Nome: {{from_name}}
Email: {{from_email}}
Mensagem: {{message}}
reCAPTCHA Token: {{g-recaptcha-response}}
```

## Como funciona no código

### main.tsx
```tsx
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

<GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
  <AuthProvider>
    <App />
  </AuthProvider>
</GoogleReCaptchaProvider>
```

### Suporte.tsx
```tsx
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const { executeRecaptcha } = useGoogleReCaptcha();

// Ao enviar o formulário
const token = await executeRecaptcha('contact_form');

// Enviar token junto com os dados do formulário
await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
  from_name: name,
  from_email: email,
  message: message,
  'g-recaptcha-response': token, // Token do reCAPTCHA
}, USER_ID);
```

## Vantagens do v3

✅ **Melhor UX**: Usuário não precisa clicar em nada
✅ **Mais seguro**: Analisa comportamento do usuário
✅ **Score baseado**: Você pode ajustar o nível de segurança
✅ **Menos fricção**: Aumenta conversão de formulários

## Troubleshooting

### Erro: "reCAPTCHA não está disponível"
- Verifique se `VITE_RECAPTCHA_SITE_KEY` está no arquivo `.env`
- Verifique se o domínio está registrado no console do Google
- Verifique se o `GoogleReCaptchaProvider` está envolvendo o App

### Token sempre inválido
- Certifique-se de estar usando a **Site Key** no frontend
- Use a **Secret Key** apenas no backend
- Verifique se está usando chaves do reCAPTCHA **v3** (não v2)

### Score muito baixo
- Em desenvolvimento, o score pode ser baixo
- Ajuste o threshold no backend (ex: `>= 0.3` para dev, `>= 0.5` para prod)
- Teste em ambiente de produção com comportamento real

## Links úteis

- [Documentação oficial](https://developers.google.com/recaptcha/docs/v3)
- [Admin Console](https://www.google.com/recaptcha/admin)
- [Biblioteca React](https://www.npmjs.com/package/react-google-recaptcha-v3)
