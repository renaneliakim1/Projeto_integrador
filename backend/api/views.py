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