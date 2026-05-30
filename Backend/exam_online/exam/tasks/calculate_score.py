from ..models import Attempt, StatusChoices
from ..services.scoring_service import ScoringService
from celery import shared_task

@shared_task
def calculate_score(attempt_id):
    attempt = (
        Attempt.objects.select_related("quiz")
        .prefetch_related(
            "answers__question__choices",
            "answers__selected_choices",
        )
        .get(id=attempt_id)
    )

    attempt.score = ScoringService.calculate_attempt_score(attempt)
    if attempt.status == StatusChoices.Processing:
        attempt.status = StatusChoices.Completed
    attempt.save(update_fields=["score", "status"])