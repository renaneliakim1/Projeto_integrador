import uuid
from django.db import models
from django.conf import settings

class Achievement(models.Model):
    """
    Catálogo de todas as conquistas disponíveis na plataforma.
    """
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True) # Nome do ícone (ex: 'Trophy')

    def __str__(self):
        return self.name

class DailyQuest(models.Model):
    """
    Catálogo de todas as missões diárias disponíveis.
    """
    id = models.CharField(max_length=50, primary_key=True)
    description = models.TextField()
    xp_reward = models.IntegerField()

    def __str__(self):
        return self.description

class QuizResult(models.Model):
    """
    Armazena o resultado de um usuário para uma área/matéria específica em um quiz.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_results')
    subject = models.CharField(max_length=255) # Matéria (ex: Matemática)
    area = models.CharField(max_length=255) # Área da BNCC (ex: Matemática e suas Tecnologias)
    correct_answers = models.IntegerField()
    wrong_answers = models.IntegerField()
    quiz_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quiz result for {self.user.email} in {self.subject}"