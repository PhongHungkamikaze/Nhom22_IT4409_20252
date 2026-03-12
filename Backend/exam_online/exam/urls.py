from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuestionViewSet

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet, basename="quizs")
router.register(r"questions", QuestionViewSet, basename="questions")

urlpatterns = [
    path("", include(router.urls)),
]
