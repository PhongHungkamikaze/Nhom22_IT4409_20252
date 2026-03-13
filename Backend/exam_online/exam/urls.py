from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuestionViewSet,
    RegisterView,
    LoginView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
)

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet, basename="quizs")
router.register(r"questions", QuestionViewSet, basename="questions")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
