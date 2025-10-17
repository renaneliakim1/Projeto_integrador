# Backend do Projeto Integrador

Este é o backend do projeto, desenvolvido com Django.

## Como Rodar o Projeto

Siga as instruções abaixo para configurar e rodar o ambiente de desenvolvimento local.

### Pré-requisitos

- Python 3.x instalado
- `pip` (gerenciador de pacotes do Python)

### Passos

1.  **Navegue até a pasta do backend:**

    ```bash
    cd backend
    ```

2.  **Crie um ambiente virtual:**

    ```bash
    python -m venv venv
    ```

3.  **Ative o ambiente virtual:**

    -   No Windows:
        ```bash
        venv\Scripts\activate
        ```
    -   No macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

4.  **Instale as dependências:**

    Certifique-se de que o arquivo `requirements.txt` está na raiz do projeto (um nível acima da pasta `backend`).

    ```bash
    pip install -r ../requirements.txt
    ```

5.  **Aplique as migrações do banco de dados:**

    ```bash
    python manage.py migrate
    ```

6.  **Inicie o servidor de desenvolvimento:**

   2. Inicie o servidor:
   ```bash
   python manage.py runserver
   ```

O servidor estará rodando em `http://127.0.0.1:8000/`.
