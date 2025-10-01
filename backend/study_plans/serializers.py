from rest_framework import serializers
from .models import Achievement, DailyQuest, QuizResult
from accounts.models import UserAchievement, UserDailyQuest

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class DailyQuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyQuest
        fields = '__all__'

class QuizResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResult
        fields = ('subject', 'area', 'correct_answers', 'wrong_answers')

    def create(self, validated_data):
        # Associa o resultado ao usuário logado que fez a requisição
        user = self.context['request'].user
        quiz_result = QuizResult.objects.create(user=user, **validated_data)
        return quiz_result

class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    class Meta:
        model = UserAchievement
        fields = ('achievement', 'unlocked_at')

class UserDailyQuestSerializer(serializers.ModelSerializer):
    quest = DailyQuestSerializer(read_only=True)
    class Meta:
        model = UserDailyQuest
        fields = ('quest', 'quest_date', 'is_completed')
