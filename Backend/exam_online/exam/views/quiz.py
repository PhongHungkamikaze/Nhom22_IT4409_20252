from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
    IsStudentUser,
    IsOwnerTeacher,
)
from drf_spectacular.utils import extend_schema

from ..models import Quiz, StatusChoices, Attempt, Answer
from ..serializers import QuizSerializer, AttemptSerializer, QuestionSerializer
from ..views.base import BaseViewSet
from rest_framework import status, response
from rest_framework.decorators import action
from django.db.models import Avg, Max, Min, Count
from django.http import HttpResponse
import pandas as pd
from datetime import datetime
from ..filters import QuizFilter
from ..services.quiz_service import QuizService


@extend_schema(tags=["Quiz"])
class QuizViewSet(BaseViewSet):
    queryset = Quiz.objects.all().prefetch_related("questions__choices")
    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "retrieve": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "create": [IsTeacherUser],
        "start": [IsStudentUser],
        "update": [IsTeacherUser, IsOwnerTeacher],
        "partial_update": [IsTeacherUser, IsOwnerTeacher],
        "destroy": [IsTeacherUser | IsAdminUser],
        "questions": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "performance_stats": [IsTeacherUser | IsAdminUser],
        "question_analysis": [IsTeacherUser | IsAdminUser],
        "export_results": [IsTeacherUser | IsAdminUser],
    }
    permission_classes = [IsAdminUser]
    serializer_class = QuizSerializer
    search_fields = ["title", "description", "author__username", "subject__name"]
    ordering_fields = ["id", "created_at", "time_limit", "title"]
    ordering = ["-created_at"]
    filterset_class = QuizFilter

    def get_serializer_class(self):
        if self.action == "start":
            return None

        return super().get_serializer_class()

    def get_queryset(self):
        if hasattr(self.request, "user") and self.request.user.is_authenticated:
            return QuizService.get_visible_quizzes(self.request.user).prefetch_related("questions__choices")
        return Quiz.objects.none()

    @action(detail=True, methods=["get"], url_path="questions")
    def questions(self, request, pk=None):
        quiz = self.get_object()

        questions = quiz.questions.all()

        serializer = QuestionSerializer(questions, many=True)

        return response.Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        quiz = self.get_object()

        if not quiz.is_published:
            return response.Response(
                {"message": "Quiz finish"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if QuizService.check_max_attempts(request.user, quiz):
            return response.Response(
                {"message": "Max attempts"},
                status=status.HTTP_403_FORBIDDEN,
            )

        existing_attempt = QuizService.get_ongoing_attempt(request.user, quiz)
        if existing_attempt:
            serializer = AttemptSerializer(existing_attempt)
            return response.Response(
                {
                    "message": "You already have an active attempt",
                    "attempt": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        attempt = Attempt.objects.create(
            user=request.user,
            quiz=quiz,
            status=StatusChoices.Ongoing,
        )
        serializer = AttemptSerializer(attempt)
        return response.Response(
            {"message": "Start quiz successfully", "attempt": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="published")
    def published(self, request, pk=None):
        quiz = self.get_object()
        quiz.is_published = True
        quiz.save()
        return response.Response({"message": "Quiz published successfully"})

    @action(detail=True, methods=["get"], url_path="performance-stats")
    def performance_stats(self, request, pk=None):
        quiz = self.get_object()
        stats = Attempt.objects.filter(quiz=quiz, status=StatusChoices.Completed).aggregate(
            average_score=Avg("score"),
            highest_score=Max("score"),
            lowest_score=Min("score"),
            total_attempts=Count("id"),
        )
        return response.Response(
            {"quiz_id": quiz.id, "quiz_title": quiz.title, "stats": stats}
        )

    @action(detail=True, methods=["get"], url_path="question-analysis")
    def question_analysis(self, request, pk=None):
        quiz = self.get_object()
        completed_attempts = Attempt.objects.filter(quiz=quiz, status=StatusChoices.Completed)
        total_attempts = completed_attempts.count()

        if total_attempts == 0:
            return response.Response(
                {"message": "No data available for analysis."},
                status=status.HTTP_200_OK,
            )

        from collections import defaultdict
        answers = Answer.objects.filter(
            attempt__in=completed_attempts,
            question__in=quiz.questions.all(),
        ).select_related("question").prefetch_related("selected_choices")

        question_answers = defaultdict(list)
        for answer in answers:
            question_answers[answer.question_id].append(answer)

        hard_questions = []
        questions = quiz.questions.all().prefetch_related("choices")

        for question in questions:
            question_answers_list = question_answers.get(question.id, [])
            total_answers = len(question_answers_list)

            if total_answers == 0:
                continue

            correct_choice_ids = set(
                question.choices.filter(is_correct=True).values_list("id", flat=True)
            )
            wrong_count = sum(
                1 for answer in question_answers_list
                if set(answer.selected_choices.values_list("id", flat=True)) != correct_choice_ids
            )

            error_rate = (wrong_count / total_answers) * 100
            HARD_QUESTION_THRESHOLD = 70

            if error_rate > HARD_QUESTION_THRESHOLD:
                hard_questions.append(
                    {
                        "question_id": question.id,
                        "content": question.content[:100] + "...",
                        "error_rate": round(error_rate, 2),
                        "total_answers": total_answers,
                        "wrong_count": wrong_count,
                        "suggestion": "Review question content or reduce choice difficulty.",
                    }
                )

        return response.Response(
            {
                "quiz_id": quiz.id,
                "analyzed_questions_count": questions.count(),
                "hard_questions": hard_questions,
            }
        )

    @action(detail=True, methods=["get"], url_path="export-results")
    def export_results(self, request, pk=None):
        quiz = self.get_object()
        attempts = Attempt.objects.filter(
            quiz=quiz, status=StatusChoices.Completed
        ).select_related("user")

        data = []
        for index, attempt in enumerate(attempts, 1):
            data.append(
                {
                    "STT": index,
                    "Họ & Tên": attempt.user.get_full_name() or attempt.user.username,
                    "Email": attempt.user.email,
                    "Điểm Số": attempt.score,
                    "Thời gian nộp": attempt.updated_at.strftime("%H:%M:%S %d/%m/%Y"),
                }
            )

        df = pd.DataFrame(data)
        res = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        filename = f"Ket_qua_thi_{quiz.id}_{datetime.now().strftime('%Y%m%d')}.xlsx"
        res["Content-Disposition"] = f'attachment; filename="{filename}"'

        df.to_excel(res, index=False, engine="openpyxl")
        return res
