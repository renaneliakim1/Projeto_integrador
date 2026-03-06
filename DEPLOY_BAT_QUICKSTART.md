# 🚀 Guia Rápido - Deploy Backend via .BAT

## 📋 Pré-requisitos

Siga estes 2 passos antes de usar `update_backend_aws.bat`:

---

## PASSO 1: Corrigir Permissões SSH ✅

### Opção A: PowerShell (RECOMENDADO)

1. **Abra PowerShell como Administrador**
2. Navegue até a pasta do projeto:
   ```powershell
   cd C:\Users\RENAN\Downloads\Projeto_integrador
   ```
3. Execute:
   ```powershell
   .\fix_ssh_permissions.ps1
   ```

### Opção B: Git Bash

```bash
chmod 400 skillio-key.pem
```

### Testar SSH:

```bash
ssh -i skillio-key.pem ubuntu@54.227.194.67
```

Se conectar, está OK! Digite `exit` para sair.

---

## PASSO 2: Configurar Security Group do RDS 🔓

### Opção A: Script Automatizado (FÁCIL)

Execute o script que criei:

```cmd
fix_rds_security_group.bat
```

**Requisito:** AWS CLI configurado (`aws configure`)

### Opção B: AWS Console (MANUAL)

1. Acesse: https://console.aws.amazon.com/rds/
2. Clique em **Databases** → **skillio-db**
3. Vá em **Connectivity & security**
4. Clique no **Security Group** (`sg-0174782fac2ec4826`)
5. **Edit inbound rules**
6. **Add rule:**
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: **Custom** → Digite o IP privado do EC2: `172.31.19.48/32`
   - Ou selecione o Security Group do EC2
7. **Save rules**

---

## PASSO 3: Deploy! 🚀

Agora sim, execute:

```cmd
update_backend_aws.bat
```

O script vai:
- ✅ Conectar ao EC2 via SSH
- ✅ Baixar código do GitHub
- ✅ Rodar migrações
- ✅ Coletar arquivos estáticos
- ✅ Reiniciar serviço

---

## 📝 Resumo dos Comandos

```powershell
# 1. Corrigir SSH
.\fix_ssh_permissions.ps1

# 2. Configurar RDS Security Group
.\fix_rds_security_group.bat

# 3. Deploy
.\update_backend_aws.bat
```

---

## 🆘 Problemas Comuns

### SSH ainda dá erro de permissão

**Solução:** Use Git Bash:
```bash
chmod 400 skillio-key.pem
ssh -i skillio-key.pem ubuntu@54.227.194.67
```

### RDS ainda não conecta

**Verifique:**
- Security Group do RDS está liberado para o EC2?
- Senha do banco está correta no `.env` do servidor?

**Testar conexão:**
```bash
ssh -i skillio-key.pem ubuntu@54.227.194.67
psql -h skillio-db.ckzscmomw7mp.us-east-1.rds.amazonaws.com -U postgres -d skillio_db
# Senha: Skillio*7
```

### AWS CLI não configurado

```cmd
aws configure
```

Você precisará:
- Access Key ID
- Secret Access Key
- Region: **us-east-1**

---

## ✅ Checklist

- [ ] SSH funcionando (testar conexão)
- [ ] Security Group do RDS configurado
- [ ] `.env` correto no servidor EC2
- [ ] AWS CLI configurado (se for usar scripts automáticos)

---

Pronto! Agora pode usar `update_backend_aws.bat` sempre que precisar fazer deploy! 🎉
