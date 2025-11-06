"""
Exemplo de implementação do reCAPTCHA v3 no backend Django

Adicione este código ao seu views.py ou serializers.py
"""

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view


def validate_recaptcha(token):
    """
    Valida o token do reCAPTCHA com a API do Google
    
    Args:
        token (str): Token gerado pelo reCAPTCHA v3 no frontend
        
    Returns:
        tuple: (is_valid: bool, score: float, errors: list)
    """
    try:
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': settings.RECAPTCHA_PRIVATE_KEY,
                'response': token
            },
            timeout=5
        )
        result = response.json()
        
        success = result.get('success', False)
        score = result.get('score', 0)
        error_codes = result.get('error-codes', [])
        
        # Verifica se passou no threshold mínimo
        is_valid = success and score >= settings.RECAPTCHA_REQUIRED_SCORE
        
        return is_valid, score, error_codes
        
    except requests.RequestException as e:
        # Em caso de erro na requisição, log e retorna False
        print(f"Erro ao validar reCAPTCHA: {e}")
        return False, 0, ['network-error']


@api_view(['POST'])
def login_view(request):
    """
    View de login com validação de reCAPTCHA
    """
    # Obtém o token do reCAPTCHA
    recaptcha_token = request.data.get('recaptcha_token')
    
    if not recaptcha_token:
        return Response({
            'detail': 'Token de segurança ausente.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Valida o token
    is_valid, score, errors = validate_recaptcha(recaptcha_token)
    
    if not is_valid:
        return Response({
            'detail': 'Validação de segurança falhou. Tente novamente.',
            'recaptcha_score': score,
            'errors': errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Continue com a lógica de autenticação normal
    username = request.data.get('username')
    password = request.data.get('password')
    
    # ... resto do código de login
    
    return Response({
        'access': 'token_aqui',
        'refresh': 'refresh_token_aqui'
    })


# Configurações necessárias no settings.py:
"""
# settings.py

INSTALLED_APPS = [
    # ... outras apps
    'captcha',
]

# Configurações do reCAPTCHA v3
RECAPTCHA_PUBLIC_KEY = env('RECAPTCHA_PUBLIC_KEY', default='')
RECAPTCHA_PRIVATE_KEY = env('RECAPTCHA_PRIVATE_KEY', default='')
RECAPTCHA_REQUIRED_SCORE = 0.5  # Score mínimo (0.0 a 1.0)

# Interpretação dos scores:
# 0.0 - 0.3: Provavelmente bot
# 0.3 - 0.7: Suspeito (pode ser bot ou humano)
# 0.7 - 1.0: Provavelmente humano
"""

# requirements.txt
"""
django-recaptcha>=3.0.0
requests>=2.28.0
"""
