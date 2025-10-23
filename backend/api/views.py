from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .serializers import UserSerializer, UserDetailSerializer, ActivityLogSerializer
from .models import UserPerformance, Subject, ActivityLog, Gamification, Quest, UserQuest
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.shortcuts import get_object_or_404
import base64
from django.conf import settings


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
        return self.request.user

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
                performance, created = UserPerformance.objects.get_or_create(user=user, subject=subject)
                performance.correct_answers += correct
                performance.incorrect_answers += incorrect
                performance.save()
            except Subject.DoesNotExist:
                # Opcional: lidar com o caso de a matéria não existir
                pass

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
        gamification = user.gamification
        gamification.xp += amount
        
        # Check for level up
        xp_for_next_level = 100 * (gamification.level ** 1.5)
        if gamification.xp >= xp_for_next_level:
            gamification.level += 1
            gamification.xp = gamification.xp - xp_for_next_level

        gamification.save()
        
        return Response({
            'new_level': gamification.level,
            'new_xp': gamification.xp
        }, status=status.HTTP_200_OK)


class LoseHeartView(generics.GenericAPIView):
    """Decrementa 1 vida do usuário autenticado."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        gamification = user.gamification
        if gamification.hearts > 0:
            gamification.hearts = max(0, gamification.hearts - 1)
            # Ao perder a primeira vida, registra o tempo de início da recarga se ainda não houver
            if gamification.hearts == 0 and gamification.hearts_last_refill is None:
                gamification.hearts_last_refill = timezone.now()
            gamification.save()
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

        return Response({'blocos_completos': current}, status=status.HTTP_200_OK)