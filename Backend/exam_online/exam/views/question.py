from exam.permissions import IsAdminUser, IsTeacherUser, IsOwnerTeacher
from rest_framework import status, response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema
from ..models import Question, Subject
from ..serializers import QuestionSerializer, BulkImportSerializer, QuestionAISerializer
from ..filters import QuestionFilter
from ..views.base import BaseViewSet
from ..services.ai_service import AIService
from ..services.question_service import QuestionService


@extend_schema(tags=["Question"])
class QuestionViewSet(BaseViewSet):
    queryset = Question.objects.all().prefetch_related("quizzes", "choices")
    serializer_class = QuestionSerializer
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser],
        "retrieve": [IsTeacherUser | IsAdminUser],
        "create": [IsTeacherUser],
        "update": [IsTeacherUser, IsOwnerTeacher],
        "partial_update": [IsTeacherUser, IsOwnerTeacher],
        "destroy": [IsTeacherUser | IsAdminUser],
        "bulk_import": [IsTeacherUser],
        "generate_ai": [IsTeacherUser],
    }
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "bulk_import":
            return BulkImportSerializer
        if self.action == "generate_ai":
            return QuestionAISerializer
        return super().get_serializer_class()

    search_fields = ["content"]
    ordering_fields = ["id", "type"]
    ordering = ["id"]
    filterset_class = QuestionFilter

    @extend_schema(
        operation_id="bulk_import_questions",
        request={
            "multipart/form-data": BulkImportSerializer,
        },
        responses={
            201: {
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                    },
                    "errors": {
                        "type": "array",
                        "items": {
                            "type": "string",
                        },
                    },
                },
            }
        },
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="bulk-import",
        parser_classes=[MultiPartParser, FormParser],
    )
    def bulk_import(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data["file"]
        subject_id = serializer.validated_data["subject_id"]

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return response.Response(
                {"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND
            )

        result = QuestionService.bulk_import_from_file(file, subject, request.user)
        return response.Response(result, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="generate-ai")
    def generate_ai(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content_source = serializer.validated_data["content"]
        num_questions = serializer.validated_data["count"]
        q_type = serializer.validated_data["type"]
        subject_id = serializer.validated_data.get("subject_id")

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return response.Response(
                {"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            questions_data = AIService.generate_questions(
                content_source, num_questions, q_type
            )
            created_questions = QuestionService.create_from_ai_data(
                questions_data, q_type, subject, request.user
            )
            res_serializer = QuestionSerializer(created_questions, many=True)
            return response.Response(
                res_serializer.data, status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return response.Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception:
            return response.Response(
                {"error": "Failed to generate questions"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
