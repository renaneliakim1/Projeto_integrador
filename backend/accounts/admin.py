from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserGamification, UserAchievement, UserDailyQuest

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'groups']
    search_fields = ['email', 'first_name']
    ordering = ['email']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'birth_date')}),
        ('Profile Info', {'fields': ('educational_level', 'profession', 'focus', 'photo_url', 'terms_accepted')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

@admin.register(UserGamification)
class UserGamificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp', 'streak', 'quiz_completed']
    search_fields = ['user__email']

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'unlocked_at']
    list_filter = ['achievement']
    search_fields = ['user__email', 'achievement__name']

@admin.register(UserDailyQuest)
class UserDailyQuestAdmin(admin.ModelAdmin):
    list_display = ['user', 'quest', 'quest_date', 'is_completed']
    list_filter = ['quest_date', 'is_completed']
    search_fields = ['user__email', 'quest__description']