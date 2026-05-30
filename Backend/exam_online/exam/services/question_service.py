import pandas as pd
from django.db import transaction

from ..models import Question, Choice


class QuestionService:
    MAX_CHOICES = 10

    @staticmethod
    def _parse_choices_from_row(row):
        choices = []
        for i in range(1, QuestionService.MAX_CHOICES + 1):
            choice_text = row.get(f"choice{i}")
            if pd.isna(choice_text) or str(choice_text).strip() == "":
                continue

            value = str(row.get(f"is_correct{i}", "")).strip().lower()
            is_correct = value in ["true", "1", "yes", "y"]
            choices.append(
                Choice(
                    content=str(choice_text).strip(),
                    is_correct=is_correct,
                )
            )
        return choices

    @staticmethod
    @transaction.atomic
    def bulk_import_from_file(file, subject, author):
        if file.name.endswith(".csv"):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        created_count = 0
        errors = []
        questions_to_create = []

        for index, row in df.iterrows():
            try:
                content = str(row.get("content", "")).strip()
                q_type = str(row.get("type", "single")).strip().lower()

                if not content:
                    continue

                question = Question(
                    content=content,
                    type=q_type,
                    subject=subject,
                    author=author,
                )
                questions_to_create.append(question)
                created_count += 1
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")

        if questions_to_create:
            Question.objects.bulk_create(questions_to_create)

        for question, (_, row) in zip(questions_to_create, df.iterrows()):
            try:
                choices = QuestionService._parse_choices_from_row(row)
                for choice in choices:
                    choice.question = question
                if choices:
                    Choice.objects.bulk_create(choices)
            except Exception as e:
                errors.append(f"Row choices: {str(e)}")

        return {
            "message": f"Successfully imported {created_count} questions",
            "errors": errors,
        }

    @staticmethod
    @transaction.atomic
    def create_from_ai_data(questions_data, q_type, subject, author):
        questions_to_create = []
        choices_to_create = []

        for q_data in questions_data:
            question = Question(
                content=q_data.get("content", "").strip(),
                type=q_type,
                subject=subject,
                author=author,
            )
            questions_to_create.append(question)

        if questions_to_create:
            Question.objects.bulk_create(questions_to_create)

        for question, q_data in zip(questions_to_create, questions_data):
            for choice_data in q_data.get("choices", []):
                choices_to_create.append(
                    Choice(
                        question=question,
                        content=choice_data.get("content", "").strip(),
                        is_correct=bool(choice_data.get("is_correct", False)),
                    )
                )

        if choices_to_create:
            Choice.objects.bulk_create(choices_to_create)

        return questions_to_create
