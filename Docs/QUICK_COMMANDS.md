# Atalhos Rápidos para o Projeto

## 🚀 Comandos Rápidos

### Iniciar Projeto Completo
```bash
./start.sh       # Linux/Mac
start.bat        # Windows
```

### Parar Projeto
```bash
./stop.sh        # Linux/Mac
stop.bat         # Windows
```

## 🔧 Comandos Individuais

### Backend apenas
```bash
cd backend
source ../.venv/bin/activate  # Linux/Mac
../.venv/Scripts/activate     # Windows
python manage.py runserver
```

### Frontend apenas
```bash
cd Frontend
npm run dev
```

## 📦 Manutenção

### Instalar/Atualizar dependências Backend
```bash
source .venv/bin/activate
cd backend
pip install -r requirements.txt
```

### Instalar/Atualizar dependências Frontend
```bash
cd Frontend
npm install
```

### Aplicar migrações do banco
```bash
cd backend
source ../.venv/bin/activate
python manage.py migrate
```

### Criar superusuário
```bash
cd backend
source ../.venv/bin/activate
python manage.py createsuperuser
```

### Coletar arquivos estáticos
```bash
cd backend
source ../.venv/bin/activate
python manage.py collectstatic
```

## 🌐 URLs Principais

- Frontend: http://localhost:8080
- Backend: http://localhost:8000
- Admin: http://localhost:8000/admin
- Swagger: http://localhost:8000/swagger
- ReDoc: http://localhost:8000/redoc
