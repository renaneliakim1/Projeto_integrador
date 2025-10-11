from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Modelo para armazenar informações adicionais do usuário,
    complementando o modelo User padrão do Django.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    birth_date = models.DateField(null=True, blank=True)
    educational_level = models.CharField(max_length=50, blank=True)
    profession = models.CharField(max_length=100, blank=True)
    focus = models.CharField(max_length=100, blank=True)
    terms_accepted = models.BooleanField(default=False)
    foto = models.BinaryField(null=True, blank=True)

class AreaBNCC(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    area = models.ForeignKey(AreaBNCC, related_name='subjects', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class UserPerformance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'subject')

    def __str__(self):
        return f'{self.user.username} - {self.subject.name}'

class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activity_logs')
    date = models.DateField()
    type = models.CharField(max_length=10, choices=[('pratica', 'Prática'), ('falha', 'Falha')])

    class Meta:
        unique_together = ('user', 'date', 'type')

    def __str__(self):
        return f'{self.user.username} - {self.date} - {self.type}'

class Gamification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification')
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)
    streak = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f'{self.user.username} - Nível: {self.level}, XP: {self.xp}'

class Achievement(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f'{self.user.username} - {self.achievement.name}'

class Quest(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    description = models.CharField(max_length=255)
    xp_reward = models.PositiveIntegerField()
    # 'daily' or 'achievement'
    type = models.CharField(max_length=20, default='daily')

    def __str__(self):
        return self.description

class UserQuest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_quests')
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE)
    quest_date = models.DateField()
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'quest', 'quest_date')

    def __str__(self):
        return f'{self.user.username} - {self.quest.description} ({self.quest_date})'