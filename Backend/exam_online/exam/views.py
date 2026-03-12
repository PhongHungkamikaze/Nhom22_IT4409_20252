from rest_framework import viewsets, response
from .models import Choice, Quiz, Question, Attempt
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from .serializers import (
    QuizSerializer,
    QuestionSerializer,
    AttemptSerializer,
    LoginSerializer,
    UserRegisterSerializer,
    UserSerializer,
)

from rest_framework import viewsets, response, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
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
