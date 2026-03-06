# Script PowerShell para corrigir permissões do arquivo skillio-key.pem
# Execute como Administrador

Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔧 Corrigindo permissões do skillio-key.pem" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$keyFile = "skillio-key.pem"

if (-not (Test-Path $keyFile)) {
    Write-Host "❌ Arquivo $keyFile não encontrado!" -ForegroundColor Red
    Write-Host "   Certifique-se de estar na pasta raiz do projeto" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Arquivo encontrado: $keyFile" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Resetando permissões..." -ForegroundColor Yellow

# Resetar permissões
icacls $keyFile /reset | Out-Null

# Remover herança
icacls $keyFile /inheritance:r | Out-Null

# Adicionar permissão de leitura apenas para o usuário atual
$username = $env:USERNAME
icacls $keyFile /grant:r "${username}:R" | Out-Null

Write-Host "✅ Permissões corrigidas!" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ CONCLUÍDO!" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora você pode usar SSH normalmente:" -ForegroundColor White
Write-Host "   ssh -i skillio-key.pem ubuntu@54.227.194.67" -ForegroundColor Cyan
Write-Host ""
pause
