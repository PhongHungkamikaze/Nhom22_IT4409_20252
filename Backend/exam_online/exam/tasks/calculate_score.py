import logging

from celery import shared_task

from ..models import Attempt, StatusChoices
from ..services.scoring_service import ScoringService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def calculate_score(self, attempt_id):
    try:
        attempt = (
            Attempt.objects.select_related("quiz")
            .prefetch_related(
                "answers__question__choices",
                "answers__selected_choices",
            )
            .get(id=attempt_id)
        )
    except Attempt.DoesNotExist:
        logger.warning("Attempt %s not found for scoring", attempt_id)
        return

    try:
        attempt.score = ScoringService.calculate_attempt_score(attempt)
        if attempt.status == StatusChoices.Processing:
            attempt.status = StatusChoices.Completed
        attempt.save(update_fields=["score", "status"])
        logger.info(
            "Scored attempt %s: score=%s, status=%s",
            attempt_id, attempt.score, attempt.status,
        )
    except Exception as e:
        logger.exception("Failed to score attempt %s", attempt_id)
        raise self.retry(exc=e)
