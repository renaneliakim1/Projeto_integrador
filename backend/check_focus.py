#!/usr/bin/env python
"""Script para verificar o foco e plano de estudo dos usuários"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import UserProfile
import json

print("=" * 80)
print("DIAGNÓSTICO: Foco e Plano de Estudo dos Usuários")
print("=" * 80)

users = User.objects.all()
print(f"\n📊 Total de usuários: {users.count()}\n")

for user in users:
    try:
        profile = user.profile
        print(f"\n👤 Usuário: {user.email}")
        print(f"   🎯 Focus: '{profile.focus}' (vazio: {not profile.focus})")
        
        plan = profile.study_plan
        if plan and isinstance(plan, dict) and len(plan) > 0:
            print(f"   📋 Plano: Existe ({len(plan)} chaves)")
            
            # Verifica actionPlan
            if 'actionPlan' in plan:
                action_plan = plan['actionPlan']
                if isinstance(action_plan, list):
                    print(f"   📚 Action Plan: {len(action_plan)} áreas")
                    for i, action in enumerate(action_plan[:5]):  # Mostra primeiras 5
                        area = action.get('area', 'SEM NOME')
                        emoji = action.get('emoji', '')
                        print(f"      {i+1}. {emoji} {area}")
                    
                    # Verifica se alguma área contém o focus
                    if profile.focus:
                        focus_lower = profile.focus.lower()
                        matches = [a['area'] for a in action_plan if focus_lower in a['area'].lower()]
                        if matches:
                            print(f"   ✅ Áreas que correspondem ao foco '{profile.focus}':")
                            for m in matches:
                                print(f"      - {m}")
                        else:
                            print(f"   ❌ Nenhuma área contém '{profile.focus}' no nome")
        else:
            print(f"   ⚠️  Plano: Vazio ou inválido")
            
    except UserProfile.DoesNotExist:
        print(f"\n👤 Usuário: {user.email}")
        print(f"   ❌ Sem perfil")

print("\n" + "=" * 80)
print("ANÁLISE COMPLETA")
print("=" * 80 + "\n")
