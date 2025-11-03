"""
Script para adicionar gamificação aos usuários existentes que não têm.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import Gamification, UserProfile

def add_gamification_to_users():
    """Adiciona gamificação aos usuários sem gamification"""
    users_without_gamification = User.objects.filter(gamification__isnull=True)
    
    print(f"Encontrados {users_without_gamification.count()} usuários sem gamificação")
    
    for user in users_without_gamification:
        # Cria gamificação com alguns pontos iniciais
        gamification, created = Gamification.objects.get_or_create(
            user=user,
            defaults={
                'xp': 25,  # XP inicial para aparecer no ranking
                'level': 1,
                'streak': 0,
                'hearts': 5,
                'hearts_last_refill': None
            }
        )
        
        if created:
            print(f"✅ Gamificação criada para {user.username} ({user.first_name or 'Sem nome'}) - 25 XP")
        else:
            print(f"⚠️  {user.username} já tinha gamificação")
    
    print("\n✨ Processo concluído!")
    
    # Mostra o ranking atualizado
    print("\n📊 Ranking atual:")
    all_users = User.objects.filter(gamification__xp__gt=0).select_related('gamification').order_by('-gamification__xp')
    for idx, user in enumerate(all_users, 1):
        print(f"{idx}. {user.first_name or user.username} - {user.gamification.xp} XP - Level {user.gamification.level}")

if __name__ == '__main__':
    add_gamification_to_users()
