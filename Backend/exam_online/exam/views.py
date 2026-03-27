from django.core.mail import send_mail
from .models import Answer, Quiz, Question, Attempt, User
from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    AttemptSerializer,
    ChangePasswordSerializer,
    ResetPasswordSerializer,
    ResetPasswordConfirmSerializer,
    UserRegisterSerializer,
    UserSerializer,
    AnswerSerializers,
)
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework_simplejwt.views import TokenBlacklistView, TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from rest_framework import permissions, status, views, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .calculate_score import calculate_score
# Create your views here.


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all().prefetch_related("answers")
    serializer_class = AttemptSerializer

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        attempt = self.get_object()
        attempt.score = calculate_score(attempt)
        attempt.status = "completed"
        attempt.save()
        return Response({"score": attempt.score})


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializers


class RegisterView(views.APIView):
    """POST /auth/register/ - Tạo tài khoản mới."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Register success!",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(TokenObtainPairView):
    pass


class LogoutView(TokenBlacklistView):
    pass


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.set_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response(
                {"detail": "Password updated successfully."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data.get("username")
            user = User.objects.get(username=username)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            # In a real app, send a link to the frontend. Here we just log/send email.
            send_mail(
                "Password Reset",
                f"Use this UID: {uid} and Token: {token} to reset your password.",
                "noreply@compliance.com",
                [user.email],
                fail_silently=False,
            )
            return Response(
                {"detail": "Password reset email sent."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if serializer.is_valid():
            uid = serializer.validated_data.get("uid")
            token = serializer.validated_data.get("token")
            try:
                uid_decoded = urlsafe_base64_decode(uid).decode()
                user = User.objects.get(pk=uid_decoded)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                user = None

            if user is not None and default_token_generator.check_token(user, token):
                user.set_password(serializer.validated_data.get("new_password"))
                user.save()
                return Response(
                    {"detail": "Password has been reset."}, status=status.HTTP_200_OK
                )
            return Response(
                {"detail": "Invalid token or UID."}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
