from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from ..models import Attempt, Quiz, StatusChoices
from ..services.scoring_service import ScoringService


@shared_task
def auto_submit_all_expired_quizzes():
    now = timezone.now()
    expired_quizzes = Quiz.objects.filter(
        end_time__isnull=False,
        end_time__lte=now,
        is_published=True,
    )
    total_auto_submitted = 0
    for quiz in expired_quizzes:
        attempts = Attempt.objects.filter(
            quiz=quiz,
            status=StatusChoices.Ongoing,
        )
        for attempt in attempts:
            attempt.score = ScoringService.calculate_attempt_score(attempt)
            attempt.status = StatusChoices.Completed
        Attempt.objects.bulk_update(
            attempts,
            ["score", "status"],
        )
        total_auto_submitted += attempts.count()
    return total_auto_submitted
