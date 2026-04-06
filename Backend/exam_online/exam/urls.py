from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuizViewSet,
    QuestionViewSet,
    AttemptViewSet,
    RegisterView,
    AnswerViewSet,
    LoginView,
    ChangePasswordView,
    ResetPasswordView,
    ResetPasswordConfirmView,
    FileSetViewSet,
    SearchView,
)

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet)
router.register(r"questions", QuestionViewSet)
router.register(r"attempts", AttemptViewSet)
router.register(r"answers", AnswerViewSet)
router.register(r"filesets", FileSetViewSet, basename="fileset")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("auth/forgot-password/", ResetPasswordView.as_view(), name="forgot-password"),
    path(
        "auth/reset-password/",
        ResetPasswordConfirmView.as_view(),
        name="reset-password",
    ),
    path("search/", SearchView.as_view(), name="search"),
]
