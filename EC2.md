Conectar pelo AWS Console (recomendado, sem chave)
Console AWS → EC2 → Instances → selecione i-011652edaf0416223 → Connect → escolha “EC2 Instance Connect (browser-based SSH)” → Connect.
Ou, se Instance Connect não estiver disponível, use Session Manager (se SSM estiver ativo):

Console → EC2 → Instance → Connect → Session Manager → Connect
Ou local: aws ssm start-session --target i-011652edaf0416223
Depois de conectado no terminal da EC2, rode estes comandos (cole os outputs se der erro):




# confirmar usuário e diretório
whoami
pwd
ls -la

# localizar o repositório (tentar ~/Projeto_integrador)
cd ~/Projeto_integrador || cd /home/ubuntu/Projeto_integrador || cd /home/ec2-user/Projeto_integrador
pwd
ls -la

# atualizar branch remoto e aplicar mudanças (mesma ação do .bat)
git fetch --all
git reset --hard origin/Renan---AWS-Free-Tier
git clean -fd
chmod +x deploy_scripts/update_backend.sh
# rodar deploy (se precisar sudo, use sudo)
./deploy_scripts/update_backend.sh

# verificar serviço (substitua 'skillio' pelo nome do service se diferente)
sudo systemctl status skillio -l --no-pager
sudo journalctl -u skillio -n 200 --no-pager

# checar se backend está escutando na porta esperada (8000/80)
sudo ss -tulnp | egrep '8000|80|443'

# verificar variável de recarga no settings / .env
grep -n "GAMIFICATION_REFILL" -R backend || grep -n "REFILL_SECONDS" -R backend || grep -n "GAMIFICATION_REFILL_SECONDS" -R .

# testar endpoint refill localmente (se protegido por token, execute só para checar resposta 401/200)
curl -i -X POST http://127.0.0.1:8000/study/gamification/refill/
# ou, se exposto em 8000 público:
curl -i -X POST http://localhost:8000/study/gamification/refill/