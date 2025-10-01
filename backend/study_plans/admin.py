from django.contrib import admin
from .models import Achievement, DailyQuest, QuizResult

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'description']
    search_fields = ['id', 'name']

@admin.register(DailyQuest)
class DailyQuestAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'xp_reward']
    search_fields = ['id', 'description']

@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'subject', 'area', 'correct_answers', 'wrong_answers', 'quiz_date']
    list_filter = ['subject', 'area', 'quiz_date']
    search_fields = ['user__email', 'subject']