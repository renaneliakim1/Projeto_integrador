from django.urls import path
from .views import CreateUserView, UserProfileView, UpdatePerformanceView, ActivityLogView, AddXpView, CompleteQuestView, CompleteBlockView
from .views import LoseHeartView, ResetHeartsView, RefillHeartsView

urlpatterns = [
    path("users/register/", CreateUserView.as_view(), name="register"),
    path("users/me/", UserProfileView.as_view(), name="user-detail"),
    path('performance/update/', UpdatePerformanceView.as_view(), name='update-performance'),
    path('activity-log/', ActivityLogView.as_view(), name='activity-log'),
    path('study/gamification/add-xp/', AddXpView.as_view(), name='add-xp'),
    path('study/my-daily-quests/<str:quest_id>/complete/', CompleteQuestView.as_view(), name='complete-quest'),
    path('study/gamification/lose-heart/', LoseHeartView.as_view(), name='lose-heart'),
    path('study/gamification/reset-hearts/', ResetHeartsView.as_view(), name='reset-hearts'),
    path('study/gamification/refill/', RefillHeartsView.as_view(), name='refill-hearts'),
    path('study/gamification/complete-block/', CompleteBlockView.as_view(), name='complete-block'),
]