# Guia de Execução – Backend e Frontend (Local e Rede)

Este guia ensina, passo a passo, como rodar o backend (Django) e o frontend (Vite + React) no Windows, tanto em modo local (apenas no PC) quanto em modo rede (PC + celular/tablet na mesma Wi-Fi).

Observação: os exemplos abaixo usam o IP 192.168.207.105 (o seu pode ser diferente). Sempre descubra o seu IP com `ipconfig`.

## Visão Geral de Portas

- Backend (Django): 8000
- Frontend (Vite): 8080

## Opção 1 – Scripts Automáticos (Recomendado)

- Para iniciar tudo em modo local (localhost):

  ```cmd
  start.bat
  ```

- Para iniciar tudo em modo rede (detecta o IP automaticamente):

  ```cmd
  start_network.bat
  ```

- Para encerrar ambos:

  ```cmd
  stop.bat
  ```

O script de rede mostra os endereços de acesso para PC e celular, por exemplo:

```text
================================================
 IP DETECTADO: 192.168.207.105
================================================

ACESSO:
  - Backend:  http://192.168.207.105:8000
  - Frontend: http://192.168.207.105:8080

Use este endereco no navegador do PC e Mobile:
  http://192.168.207.105:8080
================================================
```

## Opção 2 – Execução Manual (Desenvolvimento)

### 1) Backend (Django)

1. Entre na pasta do backend e crie o ambiente virtual (primeira vez):

  ```cmd
  cd backend
  python -m venv venv
  ```

1. Ative o ambiente virtual:

  ```cmd
  venv\Scripts\activate.bat
  ```

1. Instale as dependências (primeira vez ou quando mudar `requirements.txt`):

  ```cmd
  pip install -r ..\requirements.txt
  ```
1. (Opcional) Configure o banco local com PostgreSQL ou use o que já está definido no `.env`/RDS.
1. Aplique as migrações:

  ```cmd
  python manage.py migrate
  ```

1. Inicie o servidor:
   - Modo Local (PC apenas):

     ```cmd
     python manage.py runserver
     ```

     Acesse: <http://127.0.0.1:8000/>

   - Modo Rede (PC + celular/tablet):
     Descubra seu IP:

      ```cmd
      ipconfig
      ```

      Procure "Endereço IPv4" (ex.: 192.168.207.105)

    Inicie com o IP:

      ```cmd
      python manage.py runserver 192.168.207.105:8000
      ```

      Substitua pelo seu IP.

  Se necessário, libere as portas no firewall do Windows (PowerShell como Administrador):

  ```powershell
  New-NetFirewallRule -DisplayName "Skillio Backend (8000)" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
  ```

1. Endpoints úteis do backend:

- Swagger (UI): <http://SEU_IP:8000/swagger/>
- ReDoc: <http://SEU_IP:8000/redoc/>
- Admin: <http://SEU_IP:8000/admin/>
- Raiz (redireciona para Swagger): <http://SEU_IP:8000/>

### 2) Frontend (Vite + React)

1. Entre na pasta do frontend e instale dependências (primeira vez):

  ```cmd
  cd Frontend
  npm install
  ```
1. Inicie o servidor de desenvolvimento:
   - Modo Local (PC apenas):

     ```cmd
     npm run dev
     ```

     Acesse: <http://localhost:8080/>

   - Modo Rede (PC + celular/tablet):

     ```cmd
     npm run dev -- --host 0.0.0.0
     ```

     O Vite está configurado para usar a porta 8080. Acesse pelo IP da máquina, por exemplo:
     - PC: <http://localhost:8080/>
     - Mobile (mesma Wi‑Fi): <http://SEU_IP:8080/>

  Se necessário, libere no firewall (PowerShell como Administrador):

  ```powershell
  New-NetFirewallRule -DisplayName "Skillio Frontend (8080)" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
  ```

1. Variáveis de ambiente do frontend (opcional):
   - Se houver `.env.example`, copie para `.env` e ajuste `VITE_API_BASE_URL` conforme necessário.
   - O projeto também detecta IP de rede em tempo de execução (ver `Frontend/src/api/axios.ts`, se aplicável).

## Verificação Rápida

- Backend OK: acesse <http://SEU_IP:8000/swagger/>
- Frontend OK: acesse <http://SEU_IP:8080/>
- Do celular: use <http://SEU_IP:8080/> (celular e PC precisam estar na mesma rede Wi‑Fi)

## Dicas e Solução de Problemas

- Porta em uso: feche processos ocupando 8000/8080 ou altere a porta.
- Dependências faltando no backend:
  - Ative o venv e rode novamente `pip install -r ..\requirements.txt`.
  - Pacotes comuns: `python-dotenv`, `drf-yasg`, `djangorestframework`, `django-cors-headers`, `psycopg2-binary`, `google-generativeai`.
- Banco de dados:
  - Configure `backend/.env` conforme sua instância (ex.: PostgreSQL local ou RDS). Depois rode `python manage.py migrate`.
- Verifique se o Django está escutando no IP correto:

  ```cmd
  netstat -an | findstr :8000
  ```

  O ideal é ver `0.0.0.0:8000` ou `SEU_IP:8000` como LISTENING. Se mostrar `127.0.0.1:8000`, o acesso externo será bloqueado.
- Antivírus/Firewall de terceiros:
  - Libere as portas 8000 e 8080 ou adicione exceção para o Python do venv (`backend\venv\Scripts\python.exe`).

## Parando os Servidores

- Feche os terminais que estão rodando o backend e o frontend, ou use:

  ```cmd
  stop.bat
  ```

---

Pronto! Com este guia você consegue iniciar e testar o projeto tanto localmente quanto em rede, incluindo acesso a partir do celular. Se quiser, posso ajustar automaticamente suas variáveis de ambiente e validar o acesso fim‑a‑fim agora.
