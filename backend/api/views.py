from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import UserSerializer, UserDetailSerializer, ActivityLogSerializer
from .models import UserPerformance, Subject, ActivityLog, Gamification, Quest, UserQuest, AreaBNCC
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import base64
from django.conf import settings
import google.generativeai as genai
import json
import io
from PIL import Image, ImageDraw, ImageFont, ImageOps
from django.http import HttpResponse
import requests
import os


class CreateUserView(generics.CreateAPIView):
    """
    View para criar um novo usuário no sistema. Após a criação,
    gera e retorna os tokens de acesso (access) e atualização (refresh).
    """
    serializer_class = UserSerializer
    # Permite que qualquer usuário (mesmo não autenticado) acesse esta view.
    permission_classes = [permissions.AllowAny]
    # Adiciona os parsers para lidar com dados de formulário e uploads de arquivos.
    parser_classes = (MultiPartParser, FormParser)
    # Não precisamos mais sobrescrever o método create, a lógica agora está no serializer.


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View OTIMIZADA para buscar e atualizar os dados do usuário logado.
    Acessível apenas por usuários autenticados.
    
    OTIMIZAÇÕES:
    - select_related para buscar profile, gamification, achievements em uma query
    - prefetch_related para buscar daily quests eficientemente
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) # Adicionado para lidar com a foto

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_object(self):
        # OTIMIZADO: Busca usuário com todas as relações necessárias de uma vez
        user = User.objects.select_related(
            'profile',
            'gamification'
        ).prefetch_related(
            'achievements__achievement',
            'user_quests__quest',
            'performance__subject__area'
        ).get(pk=self.request.user.pk)
        # Garantir que as vidas sejam recalculadas com base no tempo decorrido
        try:
            from django.conf import settings as _settings
            MAX_HEARTS = 5
            REFILL_MINUTES = getattr(_settings, 'GAMIFICATION_REFILL_MINUTES', 3)
            gam = getattr(user, 'gamification', None)
            if gam is not None:
                # Só tenta recalcular se existe um timestamp de recarga
                if gam.hearts < MAX_HEARTS and gam.hearts_last_refill is not None:
                    now = timezone.now()
                    elapsed = now - gam.hearts_last_refill
                    elapsed_minutes = int(elapsed.total_seconds() // 60)
                    hearts_to_add = elapsed_minutes // REFILL_MINUTES
                    if hearts_to_add > 0:
                        new_hearts = min(MAX_HEARTS, gam.hearts + hearts_to_add)
                        minutes_used = hearts_to_add * REFILL_MINUTES
                        remainder_seconds = int(elapsed.total_seconds() - (minutes_used * 60))
                        gam.hearts = new_hearts
                        if gam.hearts >= MAX_HEARTS:
                            gam.hearts_last_refill = None
                        else:
                            gam.hearts_last_refill = now - timezone.timedelta(seconds=remainder_seconds)
                        gam.save()
        except Exception:
            # Não falhar a view por causa de problemas no recalculo de vidas
            pass

        return user

    def update(self, request, *args, **kwargs):
        from .validators import validate_safe_content
        
        user = self.get_object()
        profile = user.profile

        # Update user fields
        first_name = request.data.get('first_name')
        email = request.data.get('email')

        if first_name is not None:
            # Valida nome
            try:
                first_name = validate_safe_content(first_name, "nome")
            except Exception as e:
                return Response({'first_name': [str(e)]}, status=status.HTTP_400_BAD_REQUEST)
            user.first_name = first_name
        if email is not None:
            # Check if email is unique
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'email': ['Já existe uma conta com este e-mail.']}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user.username = email  # Assuming username is email

        user.save()

        # Update profile fields
        birth_date = request.data.get('profile.birth_date')
        educational_level = request.data.get('profile.educational_level')
        profession = request.data.get('profile.profession')
        focus = request.data.get('profile.focus')
        foto = request.data.get('profile.foto')  # This will be the dataURL or base64 string

        if birth_date is not None:
            profile.birth_date = birth_date
        if educational_level is not None:
            profile.educational_level = educational_level
        if profession is not None:
            # Valida profissão
            try:
                profession = validate_safe_content(profession, "profissão")
            except Exception as e:
                return Response({'profession': [str(e)]}, status=status.HTTP_400_BAD_REQUEST)
            profile.profession = profession
        if focus is not None:
            # Valida foco
            try:
                focus = validate_safe_content(focus, "foco de estudo")
            except Exception as e:
                return Response({'focus': [str(e)]}, status=status.HTTP_400_BAD_REQUEST)
            profile.focus = focus
        if foto is not None and foto != '':
            try:
                if foto.startswith('data:image/'):
                    base64_data = foto.split(',')[1]
                    profile.foto = base64.b64decode(base64_data)
                else:
                    profile.foto = base64.b64decode(foto)
            except Exception:
                return Response({'profile.foto': ['Foto inválida.']}, status=status.HTTP_400_BAD_REQUEST)
        elif foto == '':
            profile.foto = None  # Allow clearing the photo

        profile.save()

        # Return the serialized data
        serializer = self.get_serializer(user)
        return Response(serializer.data)

def gerar_plano_de_estudo(analise, escolaridade, foco, idade, max_streak, max_error_streak):
    from .content_filter import ContentFilter
    
    try:
        print(f"   🤖 gerar_plano_de_estudo: Iniciando...")
        print(f"      - Foco: '{foco}'")
        print(f"      - Escolaridade: '{escolaridade}'")
        print(f"      - Idade: {idade}")
        
        # VALIDA E SANITIZA O FOCO (proteção contra injection na IA)
        if foco:
            is_safe, reason = ContentFilter.is_safe(foco)
            if not is_safe:
                print(f"   ⚠️ Foco bloqueado: {reason}")
                foco = "Conhecimentos Gerais"  # Fallback seguro
            else:
                foco = ContentFilter.sanitize(foco)
        else:
            foco = "Conhecimentos Gerais"
        
        # SANITIZA a escolaridade também
        if escolaridade:
            escolaridade = ContentFilter.sanitize(escolaridade)
        
        api_key = getattr(settings, 'GEMINI_API_KEY', None)
        if not api_key:
            print(f"   ❌ GEMINI_API_KEY não configurada!")
            return None

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        desempenho = "\n".join([
            f"- **{area}**: Acertou {dados['acertos']} de {dados['acertos'] + dados['erros'] + dados['pulos']} (pulou {dados['pulos']})."
            for area, dados in analise.items()
        ])

        prompt = f"""Você é um assistente educacional especializado. Com base nos dados abaixo, crie um plano de estudo personalizado em formato JSON.

**Dados do Aluno:**
- Idade: {idade} anos
- Escolaridade: {escolaridade}
- Foco de Estudo: {foco}
- Maior sequência de acertos: {max_streak}
- Maior sequência de erros: {max_error_streak}

**Desempenho no Quiz:**
{desempenho}

**IMPORTANTE:**
1. O plano DEVE priorizar a área de foco "{foco}" como primeira área no actionPlan
2. Identifique os pontos fracos (áreas com mais erros ou pulos) e inclua nas focusPoints
3. Identifique o ponto forte (área com melhor desempenho) para strength
4. Crie um actionPlan com 3 áreas: a área de foco PRIMEIRO, depois outras áreas importantes
5. Para cada área, forneça tópicos ESPECÍFICOS e DETALHADOS (não use tópicos genéricos)
6. NUNCA mencione quebra-cabeças, enigmas ou jogos - sugira apenas estudo focado, exercícios práticos e revisão de conteúdos

**Formato JSON esperado:**
{{{{
  "title": "Plano de Estudo - Foco em [área de foco]",
  "greeting": "Olá! Com base no seu quiz, preparamos um plano focado em {foco}, incluindo outras áreas importantes.",
  "analysis": {{{{
    "summary": "Análise detalhada do desempenho no quiz com insights específicos",
    "focusPoints": ["Área1 com dificuldade", "Área2 com dificuldade", "Área3 com dificuldade"],
    "strength": "Área onde o aluno foi melhor"
  }}}},
  "actionPlan": [
    {{{{
      "area": "{foco} - [subtópico específico]",
      "emoji": "📝",
      "topics": [
        {{{{ "title": "Tópico específico 1", "description": "Descrição detalhada" }}}},
        {{{{ "title": "Tópico específico 2", "description": "Descrição detalhada" }}}},
        {{{{ "title": "Tópico específico 3", "description": "Descrição detalhada" }}}},
        {{{{ "title": "Tópico específico 4", "description": "Descrição detalhada" }}}}
      ]
    }}}},
    {{{{
      "area": "Segunda Área Importante",
      "emoji": "➕",
      "topics": [
        {{{{ "title": "Tópico específico 1", "description": "Descrição" }}}},
        {{{{ "title": "Tópico específico 2", "description": "Descrição" }}}}
      ]
    }}}},
    {{{{
      "area": "Terceira Área Importante",
      "emoji": "📚",
      "topics": [
        {{{{ "title": "Tópico específico 1", "description": "Descrição" }}}},
        {{{{ "title": "Tópico específico 2", "description": "Descrição" }}}}
      ]
    }}}}
  ],
  "nextChallenge": {{{{
    "title": "Próximo Desafio",
    "suggestion": "Sugestão motivadora sobre ESTUDAR conteúdos específicos, fazer exercícios práticos ou revisar matérias (NUNCA mencione quebra-cabeças, enigmas ou jogos)"
  }}}},
  "motivation": "Mensagem motivacional personalizada"
}}}}

Retorne APENAS o JSON, sem texto adicional."""

        print(f"   🤖 Chamando Gemini API...")
        response = model.generate_content(prompt)
        
        # Limpeza da resposta para extrair o JSON
        text = response.text.strip()
        print(f"   📄 Resposta recebida ({len(text)} chars)")
        
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()

        plano = json.loads(text)
        print(f"   ✅ JSON parsed com sucesso! Chaves: {list(plano.keys())}")
        return plano

    except Exception as e:
        print(f"   ❌ Erro ao gerar plano: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

class GenerateStudyPlanView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        profile = user.profile
        
        print(f"🎯 GenerateStudyPlanView: Gerando plano para {user.email}")
        
        # Extrair dados do request
        analise = request.data.get('analise')
        max_streak = request.data.get('maxStreak')
        max_error_streak = request.data.get('maxErrorStreak')

        print(f"   📊 Análise recebida: {list(analise.keys()) if analise else 'None'}")
        print(f"   🎯 Focus do perfil: '{profile.focus}'")

        # Obter informações do perfil
        escolaridade = profile.educational_level or "Ensino Médio"
        foco = profile.focus or "Conhecimentos Gerais"
        idade = (timezone.now().date() - profile.birth_date).days // 365 if profile.birth_date else 25

        # Gerar o plano de estudo
        print(f"   🤖 Chamando gerar_plano_de_estudo...")
        plano = gerar_plano_de_estudo(analise, escolaridade, foco, idade, max_streak, max_error_streak)

        if plano:
            print(f"   ✅ Plano gerado com sucesso! Chaves: {list(plano.keys())}")
            profile.study_plan = plano
            profile.save()
            print(f"   💾 Plano salvo no profile de {user.email}")
            return Response({"detail": "Plano de estudo gerado com sucesso."}, status=status.HTTP_200_OK)
        else:
            print(f"   ❌ Falha ao gerar plano (retornou None)")
            return Response({"detail": "Falha ao gerar o plano de estudo."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdatePerformanceView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        results = request.data.get('results', [])
        user = request.user
        today = timezone.now().date()

        for result in results:
            subject_name = result.get('subject')
            correct = result.get('correct', 0)
            incorrect = result.get('incorrect', 0)

            if correct > 0:
                ActivityLog.objects.get_or_create(user=user, date=today, type='pratica')
            if incorrect > 0:
                ActivityLog.objects.get_or_create(user=user, date=today, type='falha')

            try:
                subject = Subject.objects.get(name=subject_name)
            except Subject.DoesNotExist:
                # Matéria não existe - cria automaticamente com área padrão
                print(f"⚠️ UpdatePerformanceView: Matéria '{subject_name}' não encontrada. Criando automaticamente...")
                
                # Busca ou cria a área "Conhecimentos Gerais" como padrão
                area, _ = AreaBNCC.objects.get_or_create(name='Conhecimentos Gerais')
                subject = Subject.objects.create(name=subject_name, area=area)
                print(f"✅ UpdatePerformanceView: Matéria '{subject_name}' criada na área '{area.name}'")
            
            # Registra ou atualiza a performance
            performance, created = UserPerformance.objects.get_or_create(user=user, subject=subject)
            performance.correct_answers += correct
            performance.incorrect_answers += incorrect
            performance.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

class ActivityLogView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ActivityLog.objects.filter(user=self.request.user)


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello, world!"})

class AddXpView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        amount = request.data.get('amount', 0)
        user = request.user
        
        # Force refresh from DB to avoid stale data
        from django.db import transaction
        with transaction.atomic():
            gamification = Gamification.objects.select_for_update().get(user=user)
            
            print(f"AddXpView: User {user.username} (ID: {user.id}), adding {amount} XP")
            print(f"AddXpView: Before - Level: {gamification.level}, XP: {gamification.xp}")
            
            # XP sempre acumula, nunca subtrai (10 XP por pergunta certa)
            gamification.xp += amount

            gamification.save()
            
            print(f"AddXpView: After save - Level: {gamification.level}, XP: {gamification.xp}")
            print(f"AddXpView: Gamification ID: {gamification.id}")
        
        return Response({
            'level_up': False,  # Level sobe apenas quando completa 15 blocos, não por XP
            'new_level': gamification.level,
            'new_xp': gamification.xp
        }, status=status.HTTP_200_OK)


class LoseHeartView(generics.GenericAPIView):
    """Decrementa 1 vida do usuário autenticado."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        gamification = user.gamification
        print(f"LoseHeartView: User {user.username}, current hearts: {gamification.hearts}")
        if gamification.hearts > 0:
            gamification.hearts = max(0, gamification.hearts - 1)
            # Ao perder a última vida, registra o tempo de início da recarga
            if gamification.hearts == 0:
                gamification.hearts_last_refill = timezone.now()
            gamification.save()
            print(f"LoseHeartView: After save, hearts: {gamification.hearts}")
        return Response({'hearts': gamification.hearts}, status=status.HTTP_200_OK)


class ResetHeartsView(generics.GenericAPIView):
    """Reseta as vidas do usuário para o máximo (5)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        gamification = user.gamification
        gamification.hearts = 5
        gamification.hearts_last_refill = None
        gamification.save()
        return Response({'hearts': gamification.hearts}, status=status.HTTP_200_OK)


class RefillHeartsView(generics.GenericAPIView):
    """Tenta recarregar vidas com base no tempo decorrido: 1 vida a cada 3 minutos desde que o usuário ficou sem vidas.
    Retorna as novas vidas e o tempo restante até a próxima vida se não estiver cheio.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        gamification = user.gamification
        MAX_HEARTS = 5
        REFILL_MINUTES_PER_HEART = getattr(settings, 'GAMIFICATION_REFILL_MINUTES', 3)

        now = timezone.now()

        # Se já está cheio, nada a fazer
        if gamification.hearts >= MAX_HEARTS:
            gamification.hearts_last_refill = None
            gamification.save()
            return Response({'hearts': gamification.hearts, 'next_in_seconds': None}, status=status.HTTP_200_OK)

        # Se não houver timestamp, e hearts < max, consideramos que o contador começa agora
        if gamification.hearts_last_refill is None:
            gamification.hearts_last_refill = now
            gamification.save()
            return Response({'hearts': gamification.hearts, 'next_in_seconds': REFILL_MINUTES_PER_HEART * 60}, status=status.HTTP_200_OK)

        elapsed = now - gamification.hearts_last_refill
        elapsed_minutes = int(elapsed.total_seconds() // 60)
        # Quantas vidas recuperar
        hearts_to_add = elapsed_minutes // REFILL_MINUTES_PER_HEART
        if hearts_to_add > 0:
            new_hearts = min(MAX_HEARTS, gamification.hearts + hearts_to_add)
            # calcula quanto tempo sobrou após aplicar a recarga
            minutes_used = hearts_to_add * REFILL_MINUTES_PER_HEART
            remainder_seconds = int(elapsed.total_seconds() - (minutes_used * 60))
            gamification.hearts = new_hearts
            # Se já estiver cheio, limpa o timestamp, senão atualiza para o tempo do último tick aplicado
            if gamification.hearts >= MAX_HEARTS:
                gamification.hearts_last_refill = None
            else:
                gamification.hearts_last_refill = now - timezone.timedelta(seconds=remainder_seconds)
            gamification.save()
        else:
            # Ainda não recuperou nenhuma vida; calcula quanto falta até o próximo
            remainder_seconds = REFILL_MINUTES_PER_HEART * 60 - int(elapsed.total_seconds())

        next_in = None if gamification.hearts >= MAX_HEARTS else remainder_seconds
        return Response({'hearts': gamification.hearts, 'next_in_seconds': next_in}, status=status.HTTP_200_OK)


class CompleteQuestView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quest_id, *args, **kwargs):
        user = request.user
        quest = get_object_or_404(Quest, id=quest_id)
        today = timezone.now().date()
        
        user_quest, created = UserQuest.objects.get_or_create(user=user, quest=quest, quest_date=today)
        
        if not user_quest.is_completed:
            user_quest.is_completed = True
            user_quest.save()
            
            # Add XP
            gamification = user.gamification
            gamification.xp += quest.xp_reward
            gamification.save()
            
            # Check for level up after getting XP
            xp_for_next_level = 100 * (gamification.level ** 1.5)
            if gamification.xp >= xp_for_next_level:
                gamification.level += 1
                gamification.xp = int(gamification.xp - xp_for_next_level)
                gamification.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class CompleteBlockView(generics.GenericAPIView):
    """Marca um bloco como completo no perfil do usuário (persistente)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        block_id = request.data.get('block_id')
        if not block_id:
            return Response({'detail': 'block_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        profile = getattr(user, 'profile', None)
        if profile is None:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Handle JSONField or TextField storage
        try:
            current = profile.blocos_completos or []
            if isinstance(current, str):
                import json
                current = json.loads(current)
        except Exception:
            current = []

        if block_id not in current:
            current.append(block_id)
            try:
                profile.blocos_completos = current
                profile.save()
            except Exception:
                # Try serializing to string if needed
                import json
                profile.blocos_completos = json.dumps(current)
                profile.save()

            # Atualiza o level baseado em blocos completados (a cada 15 blocos = +1 nível)
            new_level = (len(current) // 15) + 1
            gamification = user.gamification
            old_level = gamification.level
            gamification.level = new_level
            gamification.save()
            
            print(f"CompleteBlockView: User {user.username} completed block {block_id}")
            print(f"CompleteBlockView: Total blocks: {len(current)}, Level: {old_level} -> {new_level}")

        return Response({'blocos_completos': current}, status=status.HTTP_200_OK)


class StudyPlanView(generics.GenericAPIView):
    """Get / Save the study plan for the logged user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        profile = getattr(user, 'profile', None)
        if profile is None:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        plan = getattr(profile, 'study_plan', None)
        # Normalize TextField fallback
        if isinstance(plan, str):
            try:
                import json
                plan = json.loads(plan)
            except Exception:
                plan = None

        return Response({'study_plan': plan}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Expect a JSON object body with the plan
        user = request.user
        profile = getattr(user, 'profile', None)
        if profile is None:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

        plan = request.data
        # Save into JSONField or TextField fallback
        try:
            profile.study_plan = plan
            profile.save()
        except Exception:
            import json
            profile.study_plan = json.dumps(plan)
            profile.save()

        return Response({'study_plan': plan}, status=status.HTTP_200_OK)


class DeleteAccountView(generics.GenericAPIView):
    """Endpoint seguro para exclusão completa da conta do usuário.

    Recebe POST com JSON { "password": "..." } e, se a senha for válida,
    deleta o usuário (e todas as relações com on_delete=CASCADE).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        password = request.data.get('password')
        if not password:
            return Response({'detail': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({'detail': 'Invalid password.'}, status=status.HTTP_403_FORBIDDEN)

        # Optionally: perform any cleanup here (delete files, revoke tokens, etc.)
        username = user.username
        user.delete()

        return Response({'detail': f'User {username} deleted.'}, status=status.HTTP_200_OK)


class RankingView(generics.GenericAPIView):
    """
    Endpoint OTIMIZADO para obter rankings de usuários por XP.
    Suporta diferentes categorias: global, semanal, e por matéria.
    
    OTIMIZAÇÕES:
    - Usa order_by e slicing para limitar queries ao banco
    - select_related para evitar queries N+1
    - Filtra antes de processar (não processa todos os usuários)
    """
    permission_classes = [permissions.AllowAny]
    
    def get_avatar_url(self, user, request):
        """Helper method to safely get avatar URL"""
        try:
            if hasattr(user, 'profile') and user.profile and user.profile.foto:
                # Retorna URL absoluta para funcionar em desenvolvimento local e produção
                return request.build_absolute_uri(f'/api/v1/avatar/{user.id}/')
        except Exception:
            pass
        return None

    def get(self, request, *args, **kwargs):
        category = request.query_params.get('category', 'global')
        limit = int(request.query_params.get('limit', 100))
        
        if category == 'semanal':
            # Ranking da última semana (baseado em activity logs)
            one_week_ago = timezone.now() - timezone.timedelta(days=7)
            
            # OTIMIZADO: Filtra usuários com atividades na semana ANTES de processar
            active_users = User.objects.filter(
                activity_logs__date__gte=one_week_ago.date()
            ).select_related('profile', 'gamification').distinct()
            
            # Calcula XP ganho na última semana para cada usuário
            user_weekly_xp = []
            for user in active_users:
                # Verifica se o usuário tem gamification
                if not hasattr(user, 'gamification'):
                    continue
                    
                # Conta atividades da semana
                weekly_activities = ActivityLog.objects.filter(
                    user=user,
                    date__gte=one_week_ago.date()
                ).count()
                
                # Assume 10 XP por atividade (ajuste conforme sua lógica)
                weekly_xp = weekly_activities * 10
                
                if weekly_xp > 0:
                    user_weekly_xp.append({
                        'id': user.id,
                        'name': user.first_name or user.username,
                        'username': user.username,
                        'avatar': self.get_avatar_url(user, request),
                        'xp': weekly_xp,
                        'level': user.gamification.level,
                        'total_xp': user.gamification.xp
                    })
            
            # Ordena por XP semanal
            ranking = sorted(user_weekly_xp, key=lambda x: x['xp'], reverse=True)[:limit]
            
        elif category != 'global':
            # Ranking por matéria específica
            try:
                subject = Subject.objects.get(name__iexact=category)
                
                # OTIMIZADO: Filtra usuários com performance na matéria ANTES de processar
                performances = UserPerformance.objects.filter(
                    subject=subject,
                    correct_answers__gt=0
                ).select_related('user', 'user__profile', 'user__gamification').order_by('-correct_answers')[:limit]
                
                ranking = []
                for idx, performance in enumerate(performances, start=1):
                    user = performance.user
                    # XP baseado em acertos (10 XP por acerto)
                    subject_xp = performance.correct_answers * 10
                    
                    ranking.append({
                        'id': user.id,
                        'rank': idx,
                        'name': user.first_name or user.username,
                        'username': user.username,
                        'avatar': self.get_avatar_url(user, request),
                        'xp': subject_xp,
                        'level': user.gamification.level if hasattr(user, 'gamification') else 1,
                        'correct_answers': performance.correct_answers,
                        'incorrect_answers': performance.incorrect_answers
                    })
                
            except Subject.DoesNotExist:
                # Matéria não encontrada, retorna ranking vazio
                ranking = []
        
        else:
            # Ranking global (por XP total)
            # OTIMIZADO: Ordena no banco e limita ANTES de processar
            top_users = User.objects.filter(
                gamification__xp__gt=0
            ).select_related('profile', 'gamification').order_by('-gamification__xp')[:limit]
            
            ranking = []
            for idx, user in enumerate(top_users, start=1):
                ranking.append({
                    'id': user.id,
                    'rank': idx,
                    'name': user.first_name or user.username,
                    'username': user.username,
                    'avatar': self.get_avatar_url(user, request),
                    'xp': user.gamification.xp,
                    'level': user.gamification.level,
                    'streak': user.gamification.streak
                })
        
        return Response({
            'category': category,
            'ranking': ranking,
            'total_users': len(ranking)
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_user_avatar(request, user_id):
    """
    Endpoint para servir fotos de perfil armazenadas como BinaryField.
    """
    try:
        user = User.objects.get(id=user_id)
        
        if hasattr(user, 'profile') and user.profile and user.profile.foto:
            from django.http import HttpResponse
            # Retorna a imagem binária como PNG
            return HttpResponse(user.profile.foto, content_type='image/png')
        else:
            # Retorna 404 se não tiver foto
            return Response({'detail': 'Avatar not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_profile_card(request, user_id):
    """
    Gera dinamicamente um cartão visual do perfil como PNG (og:image friendly).
    Retorna 1200x630 PNG com avatar, nome e stats básicos.
    """
    try:
        user = get_object_or_404(User.objects.select_related('profile', 'gamification'), id=user_id)

        # Tamanho padrão OG
        width, height = 1200, 630
        bg_color = (250, 250, 255)

        img = Image.new('RGBA', (width, height), bg_color)
        draw = ImageDraw.Draw(img)

        # Carrega avatar se existir
        avatar_size = 280
        avatar_x = 80
        avatar_y = (height - avatar_size) // 2

        if hasattr(user, 'profile') and user.profile and user.profile.foto:
            try:
                avatar_bytes = io.BytesIO(user.profile.foto)
                avatar = Image.open(avatar_bytes).convert('RGBA')
                avatar = ImageOps.fit(avatar, (avatar_size, avatar_size), centering=(0.5, 0.5))
                # Máscara circular
                mask = Image.new('L', (avatar_size, avatar_size), 0)
                mask_draw = ImageDraw.Draw(mask)
                mask_draw.ellipse((0, 0, avatar_size, avatar_size), fill=255)
                img.paste(avatar, (avatar_x, avatar_y), mask)
            except Exception:
                # Se falhar ao processar avatar, cai para fallback
                avatar = None
        else:
            avatar = None

        # Se não há avatar, desenha círculo com iniciais
        if avatar is None:
            circle_color = (59, 130, 246)  # azul
            mask = Image.new('RGBA', (avatar_size, avatar_size), (0, 0, 0, 0))
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.ellipse((0, 0, avatar_size, avatar_size), fill=circle_color)
            img.paste(mask, (avatar_x, avatar_y), mask)

            initials = ''.join([part[0] for part in (user.first_name or user.username).split()][:2]).upper()
            try:
                font = ImageFont.truetype(str(settings.BASE_DIR / 'fonts' / 'Inter-Bold.ttf'), 72)
            except Exception:
                font = ImageFont.load_default()
            w, h = draw.textsize(initials, font=font)
            draw.text((avatar_x + (avatar_size - w) / 2, avatar_y + (avatar_size - h) / 2), initials, fill='white', font=font)

        # Texto: nome, level e xp
        try:
            title_font = ImageFont.truetype(str(settings.BASE_DIR / 'fonts' / 'Inter-Bold.ttf'), 56)
            subtitle_font = ImageFont.truetype(str(settings.BASE_DIR / 'fonts' / 'Inter-Regular.ttf'), 32)
        except Exception:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()

        text_x = avatar_x + avatar_size + 60
        text_y = avatar_y + 20

        display_name = (user.first_name or user.username)
        draw.text((text_x, text_y), display_name, fill=(20, 20, 20), font=title_font)

        # Gamification info
        level = getattr(user.gamification, 'level', 1) if hasattr(user, 'gamification') else 1
        xp = int(getattr(user.gamification, 'xp', 0)) if hasattr(user, 'gamification') else 0
        sub_text = f"Nível {level} • {xp} XP"
        draw.text((text_x, text_y + 90), sub_text, fill=(80, 80, 80), font=subtitle_font)

        # Pequena linha inferior com site
        footer_font = subtitle_font
        footer_text = getattr(settings, 'SITE_NAME', 'Skillio')
        fw, fh = draw.textsize(footer_text, font=footer_font)
        draw.text((width - fw - 40, height - fh - 30), footer_text, fill=(120, 120, 120), font=footer_font)

        output = io.BytesIO()
        img.convert('RGB').save(output, format='PNG', optimize=True)
        output.seek(0)

        return HttpResponse(output.read(), content_type='image/png')

    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def public_profile_page(request, user_id):
    """
    Retorna uma página pública básica do perfil com meta tags Open Graph
    apontando para o `card.png` gerado acima.
    """
    try:
        user = get_object_or_404(User, id=user_id)

        card_url = request.build_absolute_uri(f"/api/users/{user_id}/card.png")
        profile_url = request.build_absolute_uri(f"/api/v1/users/{user_id}/public/")

        # Dados para exibição
        level = getattr(user.gamification, 'level', 1) if hasattr(user, 'gamification') else 1
        xp = int(getattr(user.gamification, 'xp', 0)) if hasattr(user, 'gamification') else 0
        streak = getattr(user.gamification, 'streak', 0) if hasattr(user, 'gamification') else 0
        display_name = user.first_name or user.username

        # Frase de convite customizável
        invite_text = getattr(settings, 'PROFILE_INVITE_PHRASE', 'Junte-se a mim no Skillio e comece a aprender de forma divertida e gamificada!')

        og_description = f"{display_name} — Nível {level} • {xp} XP • {streak} dias em sequência"

        html = f"""
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta property="og:title" content="{display_name} — Skillio" />
    <meta property="og:description" content="{og_description} - {invite_text}" />
    <meta property="og:image" content="{card_url}" />
    <meta property="og:type" content="profile" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Perfil público — {display_name}</title>
    <style>
        :root{{--bg:#f3f4f6;--card:#ffffff;--muted:#6b7280;--accent:#3b82f6}}
        html,body{{height:100%;margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial}}
        body{{background:var(--bg);display:flex;align-items:center;justify-content:center;padding:24px;color:#0f172a}}
        .card{{width:100%;max-width:900px;background:var(--card);border-radius:16px;box-shadow:0 10px 30px rgba(2,6,23,0.08);display:flex;gap:28px;overflow:hidden}}
        .left{{flex:0 0 420px;background:linear-gradient(180deg,rgba(59,130,246,0.06),transparent);display:flex;align-items:center;justify-content:center;padding:32px}}
        .right{{flex:1;padding:32px;display:flex;flex-direction:column;justify-content:center}}
        .avatar-wrap{{width:220px;height:220px;border-radius:20px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:linear-gradient(180deg,var(--accent),#60a5fa);box-shadow:0 8px 20px rgba(59,130,246,0.12)}}
        .avatar-wrap img{{width:100%;height:100%;object-fit:cover}}
        h1{{margin:0;font-size:32px;color:#0b1220}}
        .meta{{margin-top:8px;color:var(--muted);font-size:15px}}
        .lead{{margin-top:18px;color:#334155;font-size:16px;line-height:1.45}}
        .actions{{margin-top:22px;display:flex;gap:12px;align-items:center}}
        .btn{{padding:10px 16px;border-radius:10px;border:0;cursor:pointer;font-weight:600}}
        .btn-primary{{background:var(--accent);color:white;box-shadow:0 6px 18px rgba(59,130,246,0.18)}}
        .btn-ghost{{background:transparent;border:1px solid #e6edf9;color:var(--accent)}}
        .card-image{{width:100%;border-radius:10px;box-shadow:0 6px 18px rgba(2,6,23,0.06)}}

        @media (max-width:880px){{
            .card{{flex-direction:column}}
            .left{{flex:0 0 auto;padding:20px}}
            .avatar-wrap{{width:160px;height:160px;border-radius:16px}}
        }}
    </style>
</head>
<body>
    <div class="card" role="article" aria-label="Perfil público {display_name}">
        <div class="left">
            <div style="text-align:center">
                <div class="avatar-wrap">
                    <img src="{card_url}" alt="{display_name} card image" />
                </div>
                <div style="margin-top:14px;color:var(--muted);font-size:13px">{footer_text}</div>
            </div>
        </div>
        <div class="right">
            <h1>{display_name}</h1>
            <div class="meta">Nível {level} • {xp} XP • {streak} dias em sequência</div>
            <p class="lead">{invite_text}</p>

            <div class="actions">
                <button class="btn btn-primary" onclick="shareProfile()">Compartilhar</button>
                <button class="btn btn-ghost" onclick="copyLink()">Copiar link</button>
            </div>

            <div style="margin-top:18px;color:var(--muted);font-size:13px">Abra este link em um app de mensagens para ver a prévia com imagem.</div>
        </div>
    </div>

    <script>
        const profileUrl = "{profile_url}";
        async function shareProfile(){{
            if(navigator.share){{
                try{{
                    await navigator.share({{title: '{display_name} — Skillio', text: '{invite_text}', url: profileUrl}});
                }}catch(e){{}}
            }} else {{
                copyLink();
                alert('Link copiado para a área de transferência');
            }}
        }}
        function copyLink(){{
            if(navigator.clipboard && navigator.clipboard.writeText){{
                navigator.clipboard.writeText(profileUrl);
            }} else {{
                const t = document.createElement('textarea'); t.value = profileUrl; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
            }}
        }}
    </script>
</body>
</html>
"""

        return HttpResponse(html, content_type='text/html')
    except User.DoesNotExist:
        return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_hero_stats(request):
    """
    Endpoint OTIMIZADO para obter estatísticas para a página Hero:
    - Recorde de XP (usuário com maior XP)
    - Número de jogadores online (usuários ativos nos últimos 15 minutos)
    
    OTIMIZAÇÕES:
    - only() para buscar apenas campos necessários
    - Limita query a apenas 1 usuário para recorde
    - Count otimizado com distinct()
    - Rastreamento em tempo real usando ActivityLog.timestamp
    """
    try:
        # OTIMIZADO: Busca apenas o top 1 com os campos necessários
        top_user = User.objects.select_related('gamification').filter(
            gamification__isnull=False
        ).only('id', 'first_name', 'username', 'gamification__xp').order_by('-gamification__xp').first()
        
        record_holder = None
        record_xp = 0
        
        if top_user and hasattr(top_user, 'gamification'):
            record_holder = top_user.first_name or top_user.username
            record_xp = int(top_user.gamification.xp)
        
        # TEMPO REAL: Conta usuários ativos nos últimos 15 minutos
        # ActivityLog agora tem timestamp (DateTimeField) para rastreamento preciso
        # Filtra apenas registros com timestamp válido (não None)
        last_15_minutes = timezone.now() - timezone.timedelta(minutes=15)
        online_users = User.objects.filter(
            activity_logs__timestamp__isnull=False,
            activity_logs__timestamp__gte=last_15_minutes
        ).distinct().count()
        
        return Response({
            'record': {
                'holder': record_holder,
                'xp': record_xp
            },
            'online_players': online_users
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': str(e),
            'record': {'holder': None, 'xp': 0},
            'online_players': 0
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_public_user(request, user_id):
    """
    Endpoint público para obter dados de qualquer usuário (sem informações sensíveis).
    Usado para exibir perfis públicos a partir do ranking.
    """
    try:
        user = get_object_or_404(
            User.objects.select_related('profile', 'gamification'),
            id=user_id
        )
        
        # Serializa apenas dados públicos
        foto_url = None
        if hasattr(user, 'profile') and user.profile.foto:
            foto_url = f"data:image/png;base64,{base64.b64encode(user.profile.foto).decode('utf-8')}"
        
        # Obtém achievements desbloqueados
        achievements = []
        if hasattr(user, 'userachievement_set'):
            for ua in user.userachievement_set.select_related('achievement').all():
                achievements.append({
                    'id': ua.achievement.id,
                    'name': ua.achievement.name,
                    'description': ua.achievement.description,
                    'icon': ua.achievement.icon,
                    'unlocked_at': ua.unlocked_at.isoformat() if ua.unlocked_at else None
                })
        
        return Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name or user.username,
            'profile': {
                'foto': foto_url,
                'focus': user.profile.focus if hasattr(user, 'profile') else None
            },
            'gamification': {
                'level': user.gamification.level if hasattr(user, 'gamification') else 1,
                'xp': int(user.gamification.xp) if hasattr(user, 'gamification') else 0
            },
            'achievements': achievements
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Usuário não encontrado',
            'detail': str(e)
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_user_basic_info(request):
    """
    Endpoint LEVE para obter apenas informações básicas do usuário (sem performance).
    Usado pelo componente Profile para carregamento rápido.
    
    OTIMIZADO: Retorna apenas dados essenciais, sem performance de matérias.
    """
    try:
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Busca dados básicos com select_related
        user = User.objects.select_related('profile', 'gamification').get(pk=user.pk)
        
        foto_url = None
        if hasattr(user, 'profile') and user.profile and user.profile.foto:
            foto_url = f"data:image/png;base64,{base64.b64encode(user.profile.foto).decode('utf-8')}"
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name or user.username,
            'date_joined': user.date_joined.isoformat(),
            'profile': {
                'focus': user.profile.focus if hasattr(user, 'profile') and user.profile else None,
                'foto': foto_url,
                'educational_level': user.profile.educational_level if hasattr(user, 'profile') and user.profile else None,
                'profession': user.profile.profession if hasattr(user, 'profile') and user.profile else None,
            },
            'gamification': {
                'level': user.gamification.level if hasattr(user, 'gamification') else 1,
                'xp': int(user.gamification.xp) if hasattr(user, 'gamification') else 0,
                'hearts': user.gamification.hearts if hasattr(user, 'gamification') else 5,
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'error': 'Erro ao buscar dados básicos',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== Recuperação de Senha (Django) ====================

@api_view(['POST'])
def forgot_password(request):
    """
    Inicia o processo de recuperação de senha.
    Gera um código de 6 dígitos e envia por email usando EmailJS.
    
    Body: {
        "email": "usuario@email.com"
    }
    """
    import random
    from django.core.cache import cache
    from django.contrib.auth.models import User
    
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email é obrigatório'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar se o usuário existe
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Por segurança, não revelamos se o email existe ou não
        return Response({
            'message': 'Se este email estiver cadastrado, você receberá um código de verificação em alguns minutos.'
        }, status=status.HTTP_200_OK)
    
    # Gerar código de 6 dígitos
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Salvar código no cache por 10 minutos
    cache_key = f'reset_password_{email}'
    cache.set(cache_key, code, 600)  # 10 minutos
    
    print(f'🔐 Código gerado para {email}: {code}')
    
    # Retornar código para o frontend enviar email
    # EmailJS só funciona em aplicações browser (não aceita chamadas de backend)
    return Response({
        'message': 'Código gerado com sucesso.',
        'code': code,
        'email': email,
        'username': user.username
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def reset_password(request):
    """
    Confirma a redefinição de senha com o código recebido.
    
    Body: {
        "email": "usuario@email.com",
        "code": "123456",
        "new_password": "NovaSenha123!"
    }
    """
    from django.core.cache import cache
    from django.contrib.auth.models import User
    
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not all([email, code, new_password]):
        return Response({
            'error': 'Email, código e nova senha são obrigatórios'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar código no cache
    cache_key = f'reset_password_{email}'
    cached_code = cache.get(cache_key)
    
    if not cached_code:
        return Response({
            'error': 'Código expirado. Solicite um novo código.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if cached_code != code:
        return Response({
            'error': 'Código de verificação inválido.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Atualizar senha
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Remover código do cache
        cache.delete(cache_key)
        
        return Response({
            'message': 'Senha redefinida com sucesso!'
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({
            'error': 'Usuário não encontrado.'
        }, status=status.HTTP_400_BAD_REQUEST)


# ==================== Progresso e Gamificação ====================


@api_view(['POST'])
def resend_code(request):
    """
    Reenvia o código de verificação.
    
    Body: {
        "email": "usuario@email.com"
    }
    """
    from .cognito_service import cognito_service
    
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email é obrigatório'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    result = cognito_service.resend_confirmation_code(email)
    
    if result['success']:
        return Response({
            'message': result['message']
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
def change_password(request):
    """
    Altera a senha do usuário autenticado.
    
    Body: {
        "new_password1": "NovaSenha123!",
        "new_password2": "NovaSenha123!"
    }
    """
    # Verifica autenticação
    if not request.user.is_authenticated:
        return Response({
            'detail': 'Autenticação necessária.'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    user = request.user
    new_password1 = request.data.get('new_password1')
    new_password2 = request.data.get('new_password2')
    
    if not all([new_password1, new_password2]):
        return Response({
            'detail': 'Ambos os campos de senha são obrigatórios.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if new_password1 != new_password2:
        return Response({
            'detail': 'As senhas não correspondem.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password1) < 6:
        return Response({
            'detail': 'A senha deve ter pelo menos 6 caracteres.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Atualizar senha
    user.set_password(new_password1)
    user.save()
    
    return Response({
        'detail': 'Senha alterada com sucesso!'
    }, status=status.HTTP_200_OK)
