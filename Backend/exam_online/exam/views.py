from rest_framework import viewsets, response, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.core.mail import send_mail
from django.conf import settings

from .models import Choice, Quiz, Question, Attempt
from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    AttemptSerializer,
    LoginSerializer,
    UserRegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)


# Create your views here.

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.prefetch_related("questions").all()
    serializer_class = QuizSerializer


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.prefetch_related("choices").all()
    serializer_class = QuestionSerializer


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.prefetch_related("attempts").all()
    serializer_class = AttemptSerializer

class RegisterView(APIView):
    """POST /auth/register/ - Tạo tài khoản mới."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return response.Response(
                {
                    "message": "Đăng ký thành công!",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /auth/login/ - Đăng nhập, trả về token."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            token, _ = Token.objects.get_or_create(user=user)
            return response.Response(
                {
                    "message": "Đăng nhập thành công!",
                    "token": token.key,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """POST /auth/change-password/ - Đổi mật khẩu (yêu cầu đăng nhập)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return response.Response(
                {"message": "Đổi mật khẩu thành công!"},
                status=status.HTTP_200_OK,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """POST /auth/forgot-password/ - Bước 1: Yêu cầu reset mật khẩu, gửi email."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if serializer.is_valid():
            reset_token = serializer.save()
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
            reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"

            # Gửi email (Console backend sẽ in ra terminal khi dev)
            send_mail(
                subject="[Exam Online] Yêu cầu đặt lại mật khẩu",
                message=(
                    f"Xin chào {reset_token.user.username},\n\n"
                    f"Chúng tôi nhận được yêu cầu đặt lại mật khẩu của bạn.\n"
                    f"Click vào link bên dưới để đặt lại mật khẩu (hết hạn sau 30 phút):\n\n"
                    f"{reset_link}\n\n"
                    f"Nếu bạn không yêu cầu điều này, hãy bỏ qua email này."
                ),
                from_email="noreply@exam-online.com",
                recipient_list=[reset_token.user.email],
                fail_silently=False,
            )
            return response.Response(
                {"message": "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư."},
                status=status.HTTP_200_OK,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """POST /auth/reset-password/ - Bước 3+4: Xác thực token, đặt mật khẩu mới."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return response.Response(
                {"message": "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."},
                status=status.HTTP_200_OK,
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
