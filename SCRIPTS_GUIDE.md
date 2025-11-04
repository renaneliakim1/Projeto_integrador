# 🚀 Scripts de Inicialização do Projeto

Este projeto possui scripts automatizados para facilitar a inicialização e parada dos servidores Backend (Django) e Frontend (React + Vite).

## 📁 Arquivos Disponíveis

### Linux/Mac
- **`start.sh`** - Inicia ambos os servidores
- **`stop.sh`** - Para ambos os servidores

### Windows
- **`start.bat`** - Inicia ambos os servidores
- **`stop.bat`** - Para ambos os servidores

## 🎯 Como Usar

### Linux/Mac

#### Iniciar os servidores:
```bash
./start.sh
```

#### Parar os servidores:
```bash
./stop.sh
```

Ou simplesmente pressione `Ctrl+C` no terminal onde o `start.sh` está rodando.

### Windows

#### Iniciar os servidores:
```cmd
start.bat
```
Ou clique duas vezes no arquivo `start.bat`

#### Parar os servidores:
```cmd
stop.bat
```
Ou clique duas vezes no arquivo `stop.bat`, ou feche as janelas do Backend e Frontend.

## 🔧 O que os scripts fazem

### Script `start.sh` / `start.bat`

1. ✅ Verifica a estrutura do projeto
2. ✅ Verifica se o ambiente virtual Python existe
3. ✅ Libera as portas 8000 e 8080 se estiverem em uso
4. ✅ Inicia o Backend Django na porta 8000
5. ✅ Inicia o Frontend React/Vite na porta 8080
6. ✅ Exibe informações sobre URLs de acesso
7. ✅ Mostra logs em tempo real (Linux) ou em janelas separadas (Windows)

### Script `stop.sh` / `stop.bat`

1. ✅ Para o servidor Backend (porta 8000)
2. ✅ Para o servidor Frontend (porta 8080)
3. ✅ Mata todos os processos relacionados

## 📌 URLs de Acesso (após iniciar)

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:8080 |
| **Backend API** | http://localhost:8000 |
| **Admin Django** | http://localhost:8000/admin |
| **API Swagger** | http://localhost:8000/swagger |
| **API ReDoc** | http://localhost:8000/redoc |

## ⚠️ Requisitos

### Antes de executar os scripts pela primeira vez:

1. **Criar ambiente virtual Python:**
   ```bash
   python -m venv .venv
   ```

2. **Instalar dependências do Backend:**
   ```bash
   source .venv/bin/activate  # Linux/Mac
   # ou
   .venv\Scripts\activate     # Windows
   
   cd backend
   pip install -r requirements.txt
   ```

3. **Instalar dependências do Frontend:**
   ```bash
   cd Frontend
   npm install
   ```

4. **Aplicar migrações do banco de dados:**
   ```bash
   cd backend
   python manage.py migrate
   ```

5. **Criar superusuário (opcional, para acessar o admin):**
   ```bash
   cd backend
   python manage.py createsuperuser
   ```

## 🐛 Solução de Problemas

### Erro: "Porta já está em uso"
Os scripts tentam liberar as portas automaticamente. Se persistir:

**Linux/Mac:**
```bash
./stop.sh
```

**Windows:**
```cmd
stop.bat
```

### Erro: "Ambiente virtual não encontrado"
Crie o ambiente virtual:
```bash
python -m venv .venv
```

### Erro: "node_modules não encontrado"
O script `start.sh`/`start.bat` instala automaticamente, mas você pode fazer manualmente:
```bash
cd Frontend
npm install
```

### Backend não inicia
Verifique se as dependências estão instaladas:
```bash
source .venv/bin/activate
cd backend
pip install -r requirements.txt
```

### Frontend não inicia
Verifique se as dependências estão instaladas:
```bash
cd Frontend
npm install
```

## 💡 Dicas

- **Linux/Mac**: Os logs aparecem em tempo real no terminal
- **Windows**: Duas janelas separadas são abertas para Backend e Frontend
- Para desenvolvimento, deixe os servidores rodando e faça alterações - eles recarregam automaticamente
- Use `Ctrl+C` para parar os servidores (Linux/Mac)
- No Windows, você pode fechar as janelas ou executar `stop.bat`

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Verifique se as portas 8000 e 8080 estão livres
3. Consulte os logs para mensagens de erro
4. Revise o arquivo `.env` em `backend/` e `Frontend/`
