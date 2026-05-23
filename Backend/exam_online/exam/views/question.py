from exam.permissions import PermissionMixin, IsAdminUser, IsTeacherUser, IsOwnerTeacher
import pandas as pd
import google.generativeai as genai
from django.conf import settings
from rest_framework import viewsets, filters, status, response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from ..models import Question, Choice, Subject, User, UserRole
from ..serializers import QuestionSerializer, BulkImportSerializer, QuestionAISerializer
from ..filters import QuestionFilter
from ..tasks.create_notifications import create_notifications
import json
import re


@extend_schema(tags=["Question"])
class QuestionViewSet(PermissionMixin, viewsets.ModelViewSet):
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

    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
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
            if file.name.endswith(".csv"):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            created_count = 0
            errors = []

            with transaction.atomic():
                for index, row in df.iterrows():
                    try:
                        content = str(row.get("content", "")).strip()
                        q_type = str(row.get("type", "single")).strip().lower()

                        if not content:
                            continue

                        question = Question.objects.create(
                            content=content,
                            type=q_type,
                            subject=subject,
                            author=request.user,
                        )

                        for i in range(1, 11):
                            choice_text = row.get(f"choice{i}")
                            if pd.isna(choice_text) or str(choice_text).strip() == "":
                                continue

                            value = str(row.get(f"is_correct{i}", "")).strip().lower()

                            is_correct = value in [
                                "true",
                                "1",
                                "yes",
                                "y",
                            ]
                            Choice.objects.create(
                                question=question,
                                content=str(choice_text).strip(),
                                is_correct=is_correct,
                            )
                        created_count += 1
                    except Exception as e:
                        errors.append(f"Row {index + 2}: {str(e)}")

            return response.Response(
                {
                    "message": f"Successfully imported {created_count} questions",
                    "errors": errors,
                },
                status=status.HTTP_201_CREATED,
            )

        except Subject.DoesNotExist:
            return response.Response(
                {"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return response.Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"], url_path="generate-ai")
    def generate_ai(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        content_source = serializer.validated_data["content"]
        num_questions = serializer.validated_data["count"]
        q_type = serializer.validated_data["type"]
        subject_id = serializer.validated_data.get("subject_id")

        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            return response.Response(
                {"error": "Gemini API Key not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            subject = Subject.objects.get(id=subject_id)
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")

            prompt = f"""
            Dựa trên lĩnh vực sau sau, hãy tạo {num_questions} câu hỏi trắc nghiệm {q_type} choice.
            Yêu cầu mỗi câu hỏi có 4 lựa chọn, trong đó có đúng 1 đáp án chính xác (nếu là single) hoặc ít nhất 1 (nếu là multiple).
            Trả về kết quả dưới dạng mảng JSON thuần túy, KHÔNG có markdown, KHÔNG có văn bản giải thích.
            Cấu trúc JSON:
            [
              {{"content": "Câu hỏi...", "choices": [{{"content": "Đáp án 1", "is_correct": true}}, {{"content": "Đáp án 2", "is_correct": false}}]}}
            ]
            Văn bản nguồn:
            {content_source}
            """

            response_ai = model.generate_content(prompt)
            text = response_ai.text
            json_match = re.search(r"\[.*\]", text, re.DOTALL)
            if json_match:
                questions_data = json.loads(json_match.group())
            else:
                questions_data = json.loads(text)

            created_questions = []
            with transaction.atomic():
                for q_data in questions_data:
                    question = Question.objects.create(
                        content=q_data.get("content", "").strip(),
                        type=q_type,
                        subject=subject,
                        author=request.user,
                    )
                    for choice_data in q_data.get("choices", []):
                        Choice.objects.create(
                            question=question,
                            content=choice_data.get("content", "").strip(),
                            is_correct=bool(choice_data.get("is_correct", False)),
                        )
                    created_questions.append(question)

            res_serializer = QuestionSerializer(created_questions, many=True)
            return response.Response(
                res_serializer.data, status=status.HTTP_201_CREATED
            )

        except Subject.DoesNotExist:
            return response.Response(
                {"error": "Subject not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return response.Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
