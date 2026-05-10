from ..models import Attempt, StatusChoices
from celery import shared_task

def calculate_attempt_score(attempt):
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

    return (
        0
        if total_questions == 0
        else round((correct_count / total_questions) * 100, 2)
    )

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

    attempt.score = calculate_attempt_score(attempt)
    attempt.status = StatusChoices.Completed
    attempt.save(update_fields=["score", "status"])