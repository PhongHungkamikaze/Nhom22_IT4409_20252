import logging

from celery import shared_task
from django.utils import timezone

from ..models import Quiz

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=2)
def auto_submit_all_expired_quizzes(self):
    now = timezone.now()
    expired_quizzes = Quiz.objects.filter(
        end_time__isnull=False,
        end_time__lte=now,
        is_published=True,
    )

    from .auto_submit import auto_submit_quiz

    total_queued = 0
    for quiz in expired_quizzes:
        try:
            count = auto_submit_quiz(quiz.id)
            total_queued += count
        except Exception:
            logger.exception("Failed to auto-submit quiz %s", quiz.id)

    logger.info("Auto-submit check complete: queued %s attempts", total_queued)
    return total_queued
