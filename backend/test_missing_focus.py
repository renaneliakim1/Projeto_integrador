#!/usr/bin/env python
"""Script para criar um plano SEM o foco para testar a funcionalidade"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

USER_EMAIL = 'renaneliakim2@gmail.com'

# Plano que NÃO inclui "Direito" nos cards
PLANO_SEM_FOCO = {
    "title": "Plano de Estudo",
    "greeting": "Olá! Preparamos um plano de estudo para você.",
    "analysis": {
        "summary": "Com base no seu desempenho, organizamos os conteúdos importantes.",
        "focusPoints": ["Cálculos", "Interpretação"],
        "strength": "Raciocínio lógico"
    },
    "actionPlan": [
        {
            "area": "Matemática",
            "emoji": "📐",
            "topics": [
                {"title": "Álgebra", "description": "Equações e sistemas lineares"},
                {"title": "Geometria", "description": "Figuras planas e espaciais"}
            ]
        },
        {
            "area": "História",
            "emoji": "📚",
            "topics": [
                {"title": "Brasil Colônia", "description": "Período colonial"},
                {"title": "República", "description": "Era republicana"}
            ]
        },
        {
            "area": "Geografia",
            "emoji": "🌎",
            "topics": [
                {"title": "Clima", "description": "Tipos climáticos"},
                {"title": "Relevo", "description": "Formações do relevo"}
            ]
        }
    ],
    "nextChallenge": {
        "title": "Próximo Desafio",
        "suggestion": "Continue estudando e pratique!"
    },
    "motivation": "Você consegue! 💪"
}

try:
    user = User.objects.get(email=USER_EMAIL)
    profile = user.profile
    
    # Define foco como Direito mas NÃO inclui no plano
    profile.focus = 'Direito'
    profile.study_plan = PLANO_SEM_FOCO
    profile.save()
    
    print(f"✅ Plano de teste criado!")
    print(f"\n👤 Usuário: {user.email}")
    print(f"🎯 Focus: '{profile.focus}'")
    print(f"\n📋 Cards no plano:")
    for action in PLANO_SEM_FOCO['actionPlan']:
        print(f"   - {action['area']}")
    print(f"\n⚠️  Observe que 'Direito' NÃO está na lista de cards!")
    print(f"\n💡 Agora acesse o frontend e o sistema vai:")
    print(f"   1. Detectar que 'Direito' não está na lista")
    print(f"   2. Criar automaticamente um card 'Direito' com emoji 🎯")
    print(f"   3. Colocar o card de 'Direito' como PRIMEIRO da lista")
    print(f"   4. Marcar com badge 'SEU FOCO'")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
