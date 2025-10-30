#!/usr/bin/env python
"""Script para criar um plano de estudo de teste"""
import os
import sys
import django
import json

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Email do usuário (mude se necessário)
USER_EMAIL = 'renaneliakim1@gmail.com'

# Plano de estudo de teste com foco em Lógica (ATUALIZADO para aparecer nos estudos)
PLANO_TESTE = {
    "title": "Plano de Estudo - Foco em Lógica",
    "greeting": "Olá! Com base no seu quiz, preparamos um plano de estudo focado em Lógica, incluindo outras áreas importantes.",
    "analysis": {
        "summary": "Você demonstrou forte interesse em Lógica e Raciocínio. Vamos desenvolver esse potencial com um plano estruturado do básico ao avançado!",
        "focusPoints": [
            "Raciocínio Lógico",
            "Lógica Proposicional",
            "Resolução de Problemas"
        ],
        "strength": "Pensamento analítico e estruturado"
    },
    "actionPlan": [
        {
            "area": "Lógica e Raciocínio",  # ← ESTE É O SEU FOCO - deve aparecer PRIMEIRO
            "emoji": "🧩",
            "topics": [
                {
                    "title": "Lógica Proposicional",
                    "description": "Estude conectivos lógicos (E, OU, NÃO), tabelas-verdade e proposições compostas"
                },
                {
                    "title": "Silogismos e Argumentos",
                    "description": "Aprenda a identificar argumentos válidos, falácias e premissas corretas"
                },
                {
                    "title": "Problemas de Raciocínio",
                    "description": "Resolva enigmas, quebra-cabeças e problemas de raciocínio lógico-dedutivo"
                },
                {
                    "title": "Sequências e Padrões",
                    "description": "Identifique padrões em sequências numéricas, alfabéticas e lógicas"
                }
            ]
        },
        {
            "area": "Matemática Básica",
            "emoji": "➕",
            "topics": [
                {
                    "title": "Operações Fundamentais",
                    "description": "Revise adição, subtração, multiplicação e divisão com números inteiros e decimais"
                },
                {
                    "title": "Frações e Percentuais",
                    "description": "Domine conversões, simplificações e operações com frações e porcentagens"
                }
            ]
        },
        {
            "area": "Português - Interpretação",
            "emoji": "📚",
            "topics": [
                {
                    "title": "Interpretação de Textos",
                    "description": "Pratique leitura e compreensão de textos diversos: narrativos, argumentativos e informativos"
                },
                {
                    "title": "Gramática Aplicada",
                    "description": "Revise classes gramaticais, concordância e regência em contextos reais"
                }
            ]
        }
    ],
    "nextChallenge": {
        "title": "Próximo Desafio",
        "suggestion": "Complete 5 blocos de questões de Lógica na trilha principal e alcance o próximo nível!"
    },
    "motivation": "💪 Continue praticando! A lógica é a base do pensamento estruturado e resolução de problemas!"
}

try:
    user = User.objects.get(email=USER_EMAIL)
    profile = user.profile
    
    print(f"👤 Usuário: {user.email}")
    print(f"🎯 Focus atual: '{profile.focus}'")
    print(f"\n📋 Criando plano de teste...\n")
    
    # Salva o plano
    profile.study_plan = PLANO_TESTE
    profile.save()
    
    print("✅ Plano de teste criado com sucesso!")
    print(f"\n📄 Plano salvo:")
    print(f"   - Title: {PLANO_TESTE['title']}")
    print(f"   - Áreas no ActionPlan: {len(PLANO_TESTE['actionPlan'])}")
    for i, action in enumerate(PLANO_TESTE['actionPlan'], 1):
        print(f"     {i}. {action['emoji']} {action['area']}")
    
    print(f"\n💡 Agora acesse o Plano de Estudo no frontend para ver:")
    print(f"   - Badge '🎯 Foco Principal: {profile.focus}'")
    print(f"   - Card '{PLANO_TESTE['actionPlan'][0]['area']}' com badge 'SEU FOCO'")
    print(f"   - Outros cards sem o badge")
    
except User.DoesNotExist:
    print(f"❌ Usuário {USER_EMAIL} não encontrado!")
    print("\nUsuários disponíveis:")
    for u in User.objects.all():
        print(f"   - {u.email}")
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
