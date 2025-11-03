from django.urls import path
from .views import CreateUserView, UserProfileView, UpdatePerformanceView, ActivityLogView, AddXpView, CompleteQuestView, CompleteBlockView, GenerateStudyPlanView
from .views import LoseHeartView, ResetHeartsView, RefillHeartsView
from .views import StudyPlanView
from .views import DeleteAccountView, RankingView, get_user_avatar

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
    path('users/me/study-plan/', StudyPlanView.as_view(), name='study-plan'),
    path('users/me/generate-study-plan/', GenerateStudyPlanView.as_view(), name='generate-study-plan'),
    path('users/me/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('ranking/', RankingView.as_view(), name='ranking'),
    path('avatar/<int:user_id>/', get_user_avatar, name='user-avatar'),
]