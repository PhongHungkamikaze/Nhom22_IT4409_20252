from ..models import Attempt, StatusChoices
from ..services.scoring_service import ScoringService
from celery import shared_task

@shared_task
def auto_submit_quiz(quiz_id):
    attempts = list(
        Attempt.objects.filter(
            quiz_id=quiz_id,
            status=StatusChoices.Ongoing,
        )
        .select_related("quiz")
        .prefetch_related(
            "answers__question__choices",
            "answers__selected_choices",
        )
    )
    for attempt in attempts:
        attempt.score = ScoringService.calculate_attempt_score(attempt)
        attempt.status = StatusChoices.Completed

    Attempt.objects.bulk_update(
        attempts,
        ["score", "status"],
    )