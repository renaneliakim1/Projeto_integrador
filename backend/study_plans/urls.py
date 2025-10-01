from django.urls import path
from .views import (
    AchievementListView,
    UserAchievementListView,
    DailyQuestListView,
    UserDailyQuestListView,
    QuizResultCreateView
)

urlpatterns = [
    path('achievements/', AchievementListView.as_view(), name='achievement-list'),
    path('my-achievements/', UserAchievementListView.as_view(), name='user-achievement-list'),
    path('daily-quests/', DailyQuestListView.as_view(), name='daily-quest-list'),
    path('my-daily-quests/', UserDailyQuestListView.as_view(), name='user-daily-quest-list'),
    path('quiz-results/', QuizResultCreateView.as_view(), name='quiz-result-create'),
]
