from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, AreaBNCC, Subject, UserPerformance, ActivityLog, Gamification, Achievement, UserAchievement, Quest, UserQuest
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.validators import UniqueValidator
from django.utils import timezone
import base64

class UserSerializer(serializers.ModelSerializer):
    # Trazendo os campos do perfil para o serializer principal.
    # O DRF não lida bem com FormData aninhado por padrão.
    # `write_only=True` significa que esses campos são usados para criar/atualizar, mas não são mostrados na resposta.
    birth_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    educational_level = serializers.CharField(write_only=True, required=False, allow_blank=True)
    profession = serializers.CharField(write_only=True, required=False, allow_blank=True)
    focus = serializers.CharField(write_only=True, required=False, allow_blank=True)
    foto = serializers.FileField(write_only=True, required=False)
    # Este campo deve ser obrigatoriamente `True`.
    # Adicionamos um validador para garantir isso.
    terms_accepted = serializers.CharField(
        write_only=True,
    )

    # Campos para retornar os tokens na resposta
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    email = serializers.EmailField(
        required=True,
        # Adiciona um validador que verifica se já existe um usuário com este email.
        validators=[UniqueValidator(queryset=User.objects.all(), message="Já existe uma conta com este e-mail.")]
    )

    class Meta:
        model = User
        fields = (
            'email', 'password', 'first_name', 'foto',
            'birth_date', 'educational_level', 'profession', 'focus', 'terms_accepted',
            'access', 'refresh'
        )
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_terms_accepted(self, value):
        if value.lower() != 'true':
            raise ValidationError("Você deve aceitar os termos e condições para se registrar.")
        return True

    def create(self, validated_data):
        # Separamos os dados que pertencem ao UserProfile
        profile_fields = ['birth_date', 'educational_level', 'profession', 'focus', 'terms_accepted', 'foto']
        profile_data = {field: validated_data.pop(field) for field in profile_fields if field in validated_data}

        # Read foto if present
        if 'foto' in profile_data and profile_data['foto']:
            try:
                profile_data['foto'] = profile_data['foto'].read()
            except Exception:
                raise ValidationError("Foto inválida.")

        # Usamos o email como username para garantir unicidade e facilitar o login
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
        )

        # Criamos o perfil do usuário com os dados extras
        UserProfile.objects.create(
            user=user,
            **profile_data
        )

        # Criamos a entrada de gamificação para o usuário
        Gamification.objects.create(user=user)

        # Gera os tokens para o usuário recém-criado
        refresh = RefreshToken.for_user(user)

        # Adiciona os tokens ao objeto user para que sejam incluídos na resposta
        user.refresh = refresh
        user.access = refresh.access_token

        return user


# --- Serializers para Leitura de Dados ---

class UserPerformanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPerformance
        fields = ('subject', 'correct_answers', 'incorrect_answers')

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name')

class AreaBNCCSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = AreaBNCC
        fields = ('id', 'name', 'subjects')

class GamificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gamification
        fields = ('level', 'xp', 'streak', 'hearts', 'hearts_last_refill')

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ('id', 'name', 'description', 'icon')

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    class Meta:
        model = UserAchievement
        fields = ('achievement', 'unlocked_at')

class QuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quest
        fields = ('id', 'description', 'xp_reward')

class UserQuestSerializer(serializers.ModelSerializer):
    quest = QuestSerializer(read_only=True)
    class Meta:
        model = UserQuest
        fields = ('quest', 'quest_date', 'is_completed')

class UserProfileDetailSerializer(serializers.ModelSerializer):
    """Serializer para exibir os detalhes do perfil do usuário."""
    foto = serializers.SerializerMethodField()
    gamification = GamificationSerializer(read_only=True, source='user.gamification')
    achievements = UserAchievementSerializer(many=True, read_only=True, source='user.achievements')
    daily_quests = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        # O campo 'foto' será serializado como uma URL completa.
        fields = ('birth_date', 'educational_level', 'profession', 'focus', 'foto', 'gamification', 'achievements', 'daily_quests', 'blocos_completos', 'study_plan')

    def get_foto(self, obj):
        if obj.foto:
            return f"data:image/png;base64,{base64.b64encode(obj.foto).decode('utf-8')}"
        return None

    def get_daily_quests(self, obj):
        # obj is UserProfile instance, so obj.user is the User instance
        user = obj.user
        today = timezone.now().date()
        quests = Quest.objects.filter(type='daily')
        user_quests = []
        for quest in quests:
            user_quest, created = UserQuest.objects.get_or_create(user=user, quest=quest, quest_date=today)
            user_quests.append(user_quest)
        serializer = UserQuestSerializer(user_quests, many=True)
        return serializer.data


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer para exibir os detalhes do usuário, incluindo o perfil aninhado."""
    profile = UserProfileDetailSerializer(read_only=True)
    performance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'profile', 'performance')

    def get_performance(self, obj):
        performance_data = []
        areas = AreaBNCC.objects.prefetch_related('subjects').all()
        for area in areas:
            area_data = {
                'area_name': area.name,
                'subjects': []
            }
            for subject in area.subjects.all():
                performance, created = UserPerformance.objects.get_or_create(user=obj, subject=subject)
                subject_data = {
                    'subject_name': subject.name,
                    'correct_answers': performance.correct_answers,
                    'incorrect_answers': performance.incorrect_answers,
                }
                area_data['subjects'].append(subject_data)
            performance_data.append(area_data)
        return performance_data

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ('date', 'type')