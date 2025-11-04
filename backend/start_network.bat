@echo off
cd /d c:\Users\RENAN\Downloads\Projeto_integrador\backend
call venv\Scripts\activate.bat
python manage.py runserver 192.168.0.89:8000
