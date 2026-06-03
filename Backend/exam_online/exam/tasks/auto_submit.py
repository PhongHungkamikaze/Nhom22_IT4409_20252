import logging

from celery import shared_task

from ..models import Attempt, StatusChoices

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def auto_submit_quiz(self, quiz_id):
    attempt_ids = list(
        Attempt.objects.filter(
            quiz_id=quiz_id,
            status=StatusChoices.Ongoing,
        ).values_list("id", flat=True)
    )

    if not attempt_ids:
        logger.info("No ongoing attempts for quiz %s", quiz_id)
        return 0

    from .calculate_score import calculate_score

    for aid in attempt_ids:
        calculate_score.delay(aid)

    logger.info(
        "Auto-submit quiz %s: queued scoring for %s attempts",
        quiz_id, len(attempt_ids),
    )
    return len(attempt_ids)
