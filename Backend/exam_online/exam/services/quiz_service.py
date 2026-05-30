from django.db.models import Q, Count

from ..models import Attempt, StatusChoices


class QuizService:
    @staticmethod
    def get_visible_quizzes(user):
        from ..models import Quiz, UserRole

        if user.role == UserRole.Student:
            return Quiz.objects.filter(is_published=True)
        return Quiz.objects.all()

    @staticmethod
    def get_user_attempts_for_quiz(user, quiz):
        return Attempt.objects.filter(user=user, quiz=quiz)

    @staticmethod
    def check_max_attempts(user, quiz):
        count = Attempt.objects.filter(
            user=user, quiz=quiz
        ).aggregate(
            total=Count("id", filter=Q(
                status__in=[StatusChoices.Processing, StatusChoices.Completed]
            ))
        )["total"]
        return count >= quiz.max_attempts

    @staticmethod
    def get_ongoing_attempt(user, quiz):
        return Attempt.objects.filter(
            user=user, quiz=quiz, status=StatusChoices.Ongoing
        ).first()
