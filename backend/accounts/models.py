import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    """
    Modelo de usuário customizado. O login será feito com email.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, blank=False, null=False)
    
    # O campo 'name' do frontend será mapeado para 'first_name'
    # O campo 'password' já é gerenciado pelo AbstractUser
    
    birth_date = models.DateField(null=True, blank=True)
    educational_level = models.CharField(max_length=50, blank=True)
    profession = models.CharField(max_length=255, blank=True)
    focus = models.CharField(max_length=255, blank=True)
    photo_url = models.CharField(max_length=255, blank=True, null=True)
    terms_accepted = models.BooleanField(default=False)

    # O AbstractUser já tem: username, first_name, last_name, is_staff, is_active, date_joined
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username'] # 'username' ainda é requerido pelo AbstractUser nos bastidores

    def __str__(self):
        return self.email

class UserGamification(models.Model):
    """
    Armazena os dados de gamificação do usuário.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name='gamification')
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    quiz_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Gamification for {self.user.email}"

class UserAchievement(models.Model):
    """
    Tabela de junção para conquistas desbloqueadas pelo usuário.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey('study_plans.Achievement', on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.email} - {self.achievement.name}"

class UserDailyQuest(models.Model):
    """
    Tabela de junção para o status das missões diárias do usuário.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quest = models.ForeignKey('study_plans.DailyQuest', on_delete=models.CASCADE)
    quest_date = models.DateField()
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'quest', 'quest_date')

    def __str__(self):
        return f"{self.user.email} - {self.quest.description} on {self.quest_date}"
