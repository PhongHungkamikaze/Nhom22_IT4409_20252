from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Attempt, Quiz, StatusChoices, User


class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_quizzes = Quiz.objects.count()
        total_users = User.objects.count()
        completed_attempts = Attempt.objects.filter(
            status=StatusChoices.Completed
        ).count()

        return Response(
            {
                "total_quizzes": total_quizzes,
                "total_users": total_users,
                "completed_attempts": completed_attempts,
            },
            status=status.HTTP_200_OK,
        )
