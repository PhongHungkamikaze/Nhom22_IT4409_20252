import logging

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class ExamConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "exam"

    def ready(self):
        try:
            import exam.signals  # noqa: F401
            logger.info("✅ exam.signals loaded successfully")
        except Exception as e:
            logger.error("❌ Failed to load exam.signals: %s", e)
