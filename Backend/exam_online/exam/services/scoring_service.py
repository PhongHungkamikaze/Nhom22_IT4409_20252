class ScoringService:
    MAX_SCORE = 10

    @staticmethod
    def calculate_attempt_score(attempt):
        total_questions = attempt.quiz.questions.count()
        if total_questions == 0:
            return 0

        answers = attempt.answers.all()
        correct_count = 0

        for answer in answers:
            correct_choices = {
                c.id for c in answer.question.choices.all() if c.is_correct
            }
            selected_choices = {c.id for c in answer.selected_choices.all()}

            if correct_choices == selected_choices:
                correct_count += 1

        return round((correct_count / total_questions) * ScoringService.MAX_SCORE, 2)
