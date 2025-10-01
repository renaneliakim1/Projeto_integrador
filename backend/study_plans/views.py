from rest_framework import generics, permissions
from .models import Achievement, DailyQuest, QuizResult
from accounts.models import UserAchievement, UserDailyQuest
from .serializers import (
    AchievementSerializer, 
    DailyQuestSerializer, 
    QuizResultSerializer,
    UserAchievementSerializer,
    UserDailyQuestSerializer
)

class AchievementListView(generics.ListAPIView):
    """
    Endpoint para listar todas as conquistas disponíveis.
    """
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserAchievementListView(generics.ListAPIView):
    """
    Endpoint para listar as conquistas do usuário logado.
    """
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)

class DailyQuestListView(generics.ListAPIView):
    """
    Endpoint para listar todas as missões diárias disponíveis.
    """
    queryset = DailyQuest.objects.all()
    serializer_class = DailyQuestSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDailyQuestListView(generics.ListAPIView):
    """
    Endpoint para listar o status das missões diárias do usuário logado.
    """
    serializer_class = UserDailyQuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Idealmente, aqui você filtraria por data (ex: hoje)
        from django.utils import timezone
        today = timezone.now().date()
        return UserDailyQuest.objects.filter(user=self.request.user, quest_date=today)

class QuizResultCreateView(generics.CreateAPIView):
    """
    Endpoint para um usuário submeter os resultados de um quiz.
    O serializer já associa o usuário logado automaticamente.
    """
    queryset = QuizResult.objects.all()
    serializer_class = QuizResultSerializer
    permission_classes = [permissions.IsAuthenticated]