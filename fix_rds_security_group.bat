@echo off
chcp 65001 >nul
echo ════════════════════════════════════════════════════
echo    🔧 SKILLIO - Configurar Security Group do RDS
echo ════════════════════════════════════════════════════
echo.
echo Este script vai liberar o acesso do EC2 ao banco RDS
echo.

REM Verificar se AWS CLI está configurado
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ AWS CLI não configurado!
    echo.
    echo Configure com: aws configure
    echo.
    pause
    exit /b 1
)

echo ✅ AWS CLI configurado
echo.
echo 📡 Obtendo Security Group do EC2...

REM Obter Security Group do EC2
for /f "tokens=*" %%i in ('aws ec2 describe-instances --instance-ids i-0832ea4e8f50447ec --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" --output text --region us-east-1 2^>nul') do set EC2_SG=%%i

if "%EC2_SG%"=="" (
    echo ❌ Não foi possível obter o Security Group do EC2
    echo    Verifique se a instância i-0832ea4e8f50447ec existe
    pause
    exit /b 1
)

echo ✅ Security Group do EC2: %EC2_SG%
echo.
echo 🔓 Liberando porta 5432 do RDS para o EC2...

REM Adicionar regra no Security Group do RDS
aws ec2 authorize-security-group-ingress ^
  --group-id sg-0174782fac2ec4826 ^
  --protocol tcp ^
  --port 5432 ^
  --source-group %EC2_SG% ^
  --region us-east-1 2>nul

if errorlevel 1 (
    echo ⚠️  A regra pode já existir (isso é OK!)
) else (
    echo ✅ Regra adicionada com sucesso!
)

echo.
echo ════════════════════════════════════════════════════
echo    ✅ SECURITY GROUP CONFIGURADO!
echo ════════════════════════════════════════════════════
echo.
echo 📊 Detalhes:
echo    RDS SG: sg-0174782fac2ec4826
echo    EC2 SG: %EC2_SG%
echo    Porta: 5432 (PostgreSQL)
echo.
echo Agora você pode rodar: update_backend_aws.bat
echo.
pause
