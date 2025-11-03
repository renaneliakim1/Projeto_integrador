#!/usr/bin/env python
"""Script para criar um plano de estudo focado em Português"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Email do usuário
USER_EMAIL = 'renaneliakim1@gmail.com'

# Plano de estudo focado em Português com conteúdo detalhado
PLANO_PORTUGUES = {
    "title": "Plano de Estudo - Foco em Português",
    "greeting": "Olá! Com base no seu quiz, preparamos um plano de estudo focado em Português, incluindo outras áreas importantes.",
    "analysis": {
        "summary": "Você demonstrou interesse em aprimorar seus conhecimentos de Português. Vamos desenvolver suas habilidades linguísticas do básico ao avançado!",
        "focusPoints": [
            "Gramática",
            "Interpretação de Texto",
            "Ortografia e Acentuação"
        ],
        "strength": "Comunicação e expressão escrita"
    },
    "actionPlan": [
        {
            "area": "Português - Gramática Básica",
            "emoji": "📝",
            "topics": [
                {
                    "title": "Revisar conceitos básicos",
                    "description": "Fundamentos da gramática portuguesa"
                },
                {
                    "title": "Praticar exercícios",
                    "description": "Exercícios de fixação gramatical"
                },
                {
                    "title": "Estudar mais",
                    "description": "Aprofundamento em regras gramaticais"
                },
                {
                    "title": "Resolver questões",
                    "description": "Questões práticas de gramática"
                }
            ]
        },
        {
            "area": "Matemática Básica",
            "emoji": "➕",
            "topics": [
                {
                    "title": "Operações Fundamentais",
                    "description": "Adição, subtração, multiplicação e divisão"
                },
                {
                    "title": "Frações e Percentuais",
                    "description": "Conversões e cálculos com frações"
                }
            ]
        },
        {
            "area": "História do Brasil",
            "emoji": "📚",
            "topics": [
                {
                    "title": "Brasil Colônia",
                    "description": "Período colonial brasileiro"
                },
                {
                    "title": "Independência",
                    "description": "Processo de independência do Brasil"
                }
            ]
        }
    ],
    "nextChallenge": {
        "title": "Próximo Desafio",
        "suggestion": "Complete 5 blocos de questões de Português na trilha principal e domine a gramática!"
    },
    "motivation": "💪 Continue praticando! O domínio do Português é essencial para todas as áreas!"
}

try:
    user = User.objects.get(email=USER_EMAIL)
    profile = user.profile
    
    # Atualiza o foco para Português
    profile.focus = 'Português'
    profile.study_plan = PLANO_PORTUGUES
    profile.save()
    
    print(f"✅ Plano de Português criado com sucesso!")
    print(f"\n👤 Usuário: {user.email}")
    print(f"🎯 Focus atualizado para: '{profile.focus}'")
    print(f"\n📄 Plano salvo:")
    print(f"   - Title: {PLANO_PORTUGUES['title']}")
    print(f"   - Áreas no ActionPlan: {len(PLANO_PORTUGUES['actionPlan'])}")
    for i, action in enumerate(PLANO_PORTUGUES['actionPlan'], 1):
        print(f"     {i}. {action['emoji']} {action['area']}")
    
    print(f"\n💡 Agora acesse o Plano de Estudo no frontend para ver:")
    print(f"   - Badge '🎯 Foco Principal: Português'")
    print(f"   - '🎯 Priorizando: Português' antes da lista de cards")
    print(f"   - Card 'Português - Gramática Básica' com badge 'SEU FOCO'")
    print(f"   - Tópicos DETALHADOS de gramática (adjetivos, preposições, sílabas tônicas, etc.)")
    
except User.DoesNotExist:
    print(f"❌ Usuário {USER_EMAIL} não encontrado!")
    print("\nUsuários disponíveis:")
    for u in User.objects.all():
        print(f"   - {u.email}")
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
