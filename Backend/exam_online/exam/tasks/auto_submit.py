from ..models import Attempt, StatusChoices
from .calculate_score import calculate_attempt_score
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
        attempt.score = calculate_attempt_score(attempt)
        attempt.status = StatusChoices.Completed

    Attempt.objects.bulk_update(
        attempts,
        ["score", "status"],
    )