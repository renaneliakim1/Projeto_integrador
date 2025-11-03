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
import base64
from django.conf import settings
import google.generativeai as genai
import json


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
    View para buscar e atualizar os dados do usuário logado.
    Acessível apenas por usuários autenticados.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) # Adicionado para lidar com a foto

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_object(self):
        # Retorna o usuário associado à requisição atual
        user = self.request.user
        return user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        profile = user.profile

        # Update user fields
        first_name = request.data.get('first_name')
        email = request.data.get('email')

        if first_name is not None:
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
            profile.profession = profession
        if focus is not None:
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
    try:
        print(f"   🤖 gerar_plano_de_estudo: Iniciando...")
        print(f"      - Foco: '{foco}'")
        print(f"      - Escolaridade: '{escolaridade}'")
        print(f"      - Idade: {idade}")
        
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
    Endpoint para obter rankings de usuários por XP.
    Suporta diferentes categorias: global, semanal, e por matéria.
    """
    permission_classes = [permissions.AllowAny]
    
    def get_avatar_url(self, user, request):
        """Helper method to safely get avatar URL"""
        try:
            if hasattr(user, 'profile') and user.profile and user.profile.foto:
                # Como foto é BinaryField, retornamos URL para endpoint de avatar
                return request.build_absolute_uri(f'/api/v1/avatar/{user.id}/')
        except Exception:
            pass
        return None

    def get(self, request, *args, **kwargs):
        category = request.query_params.get('category', 'global')
        limit = int(request.query_params.get('limit', 100))
        
        # Busca todos os usuários com gamificação
        users = User.objects.select_related('profile', 'gamification').all()
        
        if category == 'semanal':
            # Ranking da última semana (baseado em activity logs)
            one_week_ago = timezone.now() - timezone.timedelta(days=7)
            
            # Calcula XP ganho na última semana para cada usuário
            user_weekly_xp = []
            for user in users:
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
                
                if weekly_xp > 0 or user.gamification.xp > 0:
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
                
                user_subject_performance = []
                for user in users:
                    # Verifica se o usuário tem gamification
                    if not hasattr(user, 'gamification'):
                        continue
                        
                    try:
                        performance = UserPerformance.objects.get(user=user, subject=subject)
                        # XP baseado em acertos (10 XP por acerto)
                        subject_xp = performance.correct_answers * 10
                        
                        if subject_xp > 0:
                            user_subject_performance.append({
                                'id': user.id,
                                'name': user.first_name or user.username,
                                'username': user.username,
                                'avatar': self.get_avatar_url(user, request),
                                'xp': subject_xp,
                                'level': user.gamification.level,
                                'correct_answers': performance.correct_answers,
                                'incorrect_answers': performance.incorrect_answers
                            })
                    except UserPerformance.DoesNotExist:
                        continue
                
                # Ordena por XP da matéria
                ranking = sorted(user_subject_performance, key=lambda x: x['xp'], reverse=True)[:limit]
                
            except Subject.DoesNotExist:
                # Matéria não encontrada, retorna ranking vazio
                ranking = []
        
        else:
            # Ranking global (por XP total)
            user_rankings = []
            for user in users:
                # Verifica se o usuário tem gamification
                if not hasattr(user, 'gamification'):
                    continue
                    
                if user.gamification.xp > 0:
                    user_rankings.append({
                        'id': user.id,
                        'name': user.first_name or user.username,
                        'username': user.username,
                        'avatar': self.get_avatar_url(user, request),
                        'xp': user.gamification.xp,
                        'level': user.gamification.level,
                        'streak': user.gamification.streak
                    })
            
            # Ordena por XP total
            ranking = sorted(user_rankings, key=lambda x: x['xp'], reverse=True)[:limit]
        
        # Adiciona posição no ranking
        for index, user_data in enumerate(ranking, start=1):
            user_data['rank'] = index
        
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