from django.urls import path
from .views import CreateUserView, UserProfileView, UpdatePerformanceView, ActivityLogView, AddXpView, CompleteQuestView, CompleteBlockView, GenerateStudyPlanView
from .views import LoseHeartView, ResetHeartsView, RefillHeartsView
from .views import StudyPlanView
from .views import DeleteAccountView, RankingView, get_user_avatar, get_hero_stats, get_public_user, get_user_basic_info
from .views import get_profile_card, public_profile_page
from .views import forgot_password, reset_password, resend_code, change_password
from .health import health_check

urlpatterns = [
    path("health/", health_check, name="health-check"),  # Health check para Render
    path("users/register/", CreateUserView.as_view(), name="register"),
    path("users/me/", UserProfileView.as_view(), name="user-detail"),
    path("users/me/basic/", get_user_basic_info, name="user-basic-info"),  # Endpoint leve
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
    path('users/<int:user_id>/card.png', get_profile_card, name='public-profile-card'),
    path('users/<int:user_id>/public/', public_profile_page, name='public-profile-page'),
    path('hero-stats/', get_hero_stats, name='hero-stats'),
    path('users/<int:user_id>/', get_public_user, name='public-user'),
    
    # Recuperação de senha com AWS Cognito
    path('auth/forgot-password/', forgot_password, name='forgot-password'),
    path('auth/reset-password/', reset_password, name='reset-password'),
    path('auth/resend-code/', resend_code, name='resend-code'),
    # Alteração de senha
    path('auth/password/change/', change_password, name='change-password'),
]