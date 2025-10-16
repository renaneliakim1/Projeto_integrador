from django.urls import path
from .views import CreateUserView, UserProfileView, UpdatePerformanceView, ActivityLogView, AddXpView, CompleteQuestView, hello_world

urlpatterns = [
    path("hello/", hello_world, name="hello"),
    path("users/register/", CreateUserView.as_view(), name="register"),
    path("users/me/", UserProfileView.as_view(), name="user-detail"),
    path('performance/update/', UpdatePerformanceView.as_view(), name='update-performance'),
    path('activity-log/', ActivityLogView.as_view(), name='activity-log'),
    path('study/gamification/add-xp/', AddXpView.as_view(), name='add-xp'),
    path('study/my-daily-quests/<str:quest_id>/complete/', CompleteQuestView.as_view(), name='complete-quest'),
]
