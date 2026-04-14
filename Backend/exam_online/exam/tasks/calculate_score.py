import logging
from celery import shared_task
from ..models import Attempt, StatusChoices

logger = logging.getLogger(__name__)


@shared_task()
def calculate_score(id):
    try:
        logger.info(f"Start scoring attempt {id}")

        attempt = (
            Attempt.objects.select_related("user", "quiz")
            .prefetch_related("answers__question__choices", "answers__selected_choices")
            .get(id=id)
        )

        total_questions = attempt.quiz.questions.count()
        answers = attempt.answers.all()
        correct_count = 0

        for answer in answers:
            correct_choices = {
                c.id for c in answer.question.choices.all() if c.is_correct
            }
            selected_choices = {c.id for c in answer.selected_choices.all()}

            if correct_choices == selected_choices:
                correct_count += 1

        score = (
            0
            if total_questions == 0
            else round((correct_count / total_questions) * 100, 2)
        )

        attempt.score = score
        attempt.status = StatusChoices.Completed
        attempt.save()

        logger.info(f"Finished scoring attempt {id} with score {score}")

    except Exception as e:
        logger.error(f"Error in calculate_score: {str(e)}")
        raise
