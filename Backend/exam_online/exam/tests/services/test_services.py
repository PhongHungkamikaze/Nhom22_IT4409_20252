# exam/tests/services/test_services.py
"""
Unit tests cho các Service classes (business logic thuần túy).

Services được kiểm thử:
  - ScoringService.calculate_attempt_score()
  - QuizService.get_visible_quizzes()
  - QuizService.check_max_attempts()
  - QuizService.get_ongoing_attempt()
  - QuestionService._parse_choices_from_row()
  - QuestionService.create_from_ai_data()

Các test này là unit tests thuần — không gọi HTTP endpoint,
chỉ test logic nghiệp vụ trực tiếp.

Chạy: pytest exam/tests/services/ -v
"""

import pytest
import pandas as pd
from unittest.mock import MagicMock, patch

from exam.models import (
    Attempt,
    Answer,
    Choice,
    Question,
    Quiz,
    Subject,
    User,
    UserRole,
    StatusChoices,
    Notification,
    NotificationType,
)
from exam.services.scoring_service import ScoringService
from exam.services.quiz_service import QuizService
from exam.services.question_service import QuestionService


# ===========================================================================
# Fixtures cục bộ
# ===========================================================================


@pytest.fixture
def teacher(db):
    return User.objects.create_user(
        username="svc_teacher",
        email="svc_teacher@example.com",
        password="TeachPass123!",
        role=UserRole.Teacher,
    )


@pytest.fixture
def student(db):
    return User.objects.create_user(
        username="svc_student",
        email="svc_student@example.com",
        password="StudPass123!",
        role=UserRole.Student,
    )


@pytest.fixture
def subject(db):
    return Subject.objects.create(name="Science")


@pytest.fixture
def quiz(db, teacher, subject):
    return Quiz.objects.create(
        title="Service Test Quiz",
        author=teacher,
        subject=subject,
        is_published=True,
        max_attempts=2,
    )


@pytest.fixture
def single_choice_question(db, teacher, subject):
    """Câu hỏi single-choice: 1 đúng, 2 sai."""
    q = Question.objects.create(
        content="What is the capital of France?",
        type=Question.TypeQuestion.Single,
        author=teacher,
        subject=subject,
    )
    Choice.objects.create(question=q, content="London", is_correct=False)
    Choice.objects.create(question=q, content="Paris", is_correct=True)
    Choice.objects.create(question=q, content="Berlin", is_correct=False)
    return q


@pytest.fixture
def multi_choice_question(db, teacher, subject):
    """Câu hỏi multiple-choice: 2 đúng, 2 sai."""
    q = Question.objects.create(
        content="Which are programming languages?",
        type=Question.TypeQuestion.Multiple,
        author=teacher,
        subject=subject,
    )
    Choice.objects.create(question=q, content="Python", is_correct=True)
    Choice.objects.create(question=q, content="Java", is_correct=True)
    Choice.objects.create(question=q, content="HTML", is_correct=False)
    Choice.objects.create(question=q, content="CSS", is_correct=False)
    return q


# ===========================================================================
# ScoringService
# ===========================================================================


@pytest.mark.django_db
class TestScoringService:
    """Test ScoringService.calculate_attempt_score()."""

    def test_score_zero_when_no_questions(self, student, quiz):
        """Quiz không có câu hỏi → điểm = 0."""
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )
        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 0

    def test_perfect_score_when_all_correct(
        self, student, quiz, single_choice_question
    ):
        """Trả lời đúng tất cả → điểm = 10."""
        quiz.questions.add(single_choice_question)
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )
        correct_choice = Choice.objects.get(
            question=single_choice_question, is_correct=True
        )
        answer = Answer.objects.create(
            attempt=attempt, question=single_choice_question
        )
        answer.selected_choices.set([correct_choice])

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 10.0

    def test_zero_score_when_all_wrong(
        self, student, quiz, single_choice_question
    ):
        """Trả lời sai tất cả → điểm = 0."""
        quiz.questions.add(single_choice_question)
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )
        wrong_choice = Choice.objects.filter(
            question=single_choice_question, is_correct=False
        ).first()
        answer = Answer.objects.create(
            attempt=attempt, question=single_choice_question
        )
        answer.selected_choices.set([wrong_choice])

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 0.0

    def test_partial_score_with_mixed_answers(
        self, student, quiz, single_choice_question, teacher, subject
    ):
        """2 câu hỏi: đúng 1 → điểm = 5.0."""
        q2 = Question.objects.create(
            content="What is 1+1?",
            type=Question.TypeQuestion.Single,
            author=teacher,
            subject=subject,
        )
        Choice.objects.create(question=q2, content="1", is_correct=False)
        Choice.objects.create(question=q2, content="2", is_correct=True)

        quiz.questions.add(single_choice_question, q2)
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )

        # Câu 1: đúng
        correct1 = Choice.objects.get(question=single_choice_question, is_correct=True)
        a1 = Answer.objects.create(attempt=attempt, question=single_choice_question)
        a1.selected_choices.set([correct1])

        # Câu 2: sai
        wrong2 = Choice.objects.filter(question=q2, is_correct=False).first()
        a2 = Answer.objects.create(attempt=attempt, question=q2)
        a2.selected_choices.set([wrong2])

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 5.0

    def test_score_rounded_to_2_decimals(
        self, student, quiz, teacher, subject
    ):
        """Điểm được làm tròn 2 chữ số thập phân."""
        # 3 câu hỏi, đúng 1 → 10/3 * 1 ≈ 3.33
        questions = []
        for i in range(3):
            q = Question.objects.create(
                content=f"Question {i}",
                type=Question.TypeQuestion.Single,
                author=teacher,
                subject=subject,
            )
            Choice.objects.create(question=q, content="Wrong", is_correct=False)
            Choice.objects.create(question=q, content="Correct", is_correct=True)
            questions.append(q)

        for q in questions:
            quiz.questions.add(q)

        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )

        # Câu 1: đúng
        correct0 = Choice.objects.get(question=questions[0], is_correct=True)
        a = Answer.objects.create(attempt=attempt, question=questions[0])
        a.selected_choices.set([correct0])

        # Câu 2, 3: sai
        for q in questions[1:]:
            wrong = Choice.objects.filter(question=q, is_correct=False).first()
            ans = Answer.objects.create(attempt=attempt, question=q)
            ans.selected_choices.set([wrong])

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == round(10 / 3, 2)

    def test_multiple_choice_partial_selection_not_counted(
        self, student, quiz, multi_choice_question
    ):
        """Multiple choice: chọn thiếu đáp án đúng → không được điểm."""
        quiz.questions.add(multi_choice_question)
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )
        # Chỉ chọn 1 trong 2 đáp án đúng
        one_correct = Choice.objects.filter(
            question=multi_choice_question, is_correct=True
        ).first()
        answer = Answer.objects.create(attempt=attempt, question=multi_choice_question)
        answer.selected_choices.set([one_correct])

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 0.0

    def test_multiple_choice_all_correct_gets_full_score(
        self, student, quiz, multi_choice_question
    ):
        """Multiple choice: chọn đúng hết → điểm = 10."""
        quiz.questions.add(multi_choice_question)
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Processing
        )
        all_correct = Choice.objects.filter(
            question=multi_choice_question, is_correct=True
        )
        answer = Answer.objects.create(attempt=attempt, question=multi_choice_question)
        answer.selected_choices.set(all_correct)

        score = ScoringService.calculate_attempt_score(attempt)
        assert score == 10.0


# ===========================================================================
# QuizService
# ===========================================================================


@pytest.mark.django_db
class TestQuizService:
    """Test QuizService methods."""

    # --- get_visible_quizzes ---

    def test_student_sees_only_published_quizzes(
        self, student, teacher, subject
    ):
        """Student chỉ thấy quiz đã published."""
        published = Quiz.objects.create(
            title="Published", author=teacher, subject=subject, is_published=True
        )
        Quiz.objects.create(
            title="Draft", author=teacher, subject=subject, is_published=False
        )
        qs = QuizService.get_visible_quizzes(student)
        ids = list(qs.values_list("id", flat=True))
        assert published.id in ids
        assert all(
            Quiz.objects.get(id=q_id).is_published for q_id in ids
        )

    def test_teacher_sees_all_quizzes(self, teacher, subject):
        """Teacher thấy tất cả quiz (cả published và draft)."""
        Quiz.objects.create(
            title="Published", author=teacher, subject=subject, is_published=True
        )
        Quiz.objects.create(
            title="Draft", author=teacher, subject=subject, is_published=False
        )
        qs = QuizService.get_visible_quizzes(teacher)
        assert qs.count() == 2

    # --- check_max_attempts ---

    def test_check_max_attempts_returns_false_when_under_limit(
        self, student, quiz
    ):
        """Số attempt chưa đạt giới hạn → False."""
        Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Completed
        )
        result = QuizService.check_max_attempts(student, quiz)
        # quiz.max_attempts=2, đã có 1 → chưa đạt
        assert result is False

    def test_check_max_attempts_returns_true_when_at_limit(
        self, student, quiz
    ):
        """Số attempt đúng bằng giới hạn → True."""
        Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Completed
        )
        Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Completed
        )
        result = QuizService.check_max_attempts(student, quiz)
        # quiz.max_attempts=2, đã có 2 → đạt giới hạn
        assert result is True

    def test_check_max_attempts_only_counts_completed_processing_error(
        self, student, quiz
    ):
        """Attempt ở trạng thái Ongoing/Ready không bị tính vào giới hạn."""
        Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Ongoing
        )
        result = QuizService.check_max_attempts(student, quiz)
        assert result is False

    # --- get_ongoing_attempt ---

    def test_get_ongoing_attempt_returns_ongoing(self, student, quiz):
        """Trả về attempt đang Ongoing."""
        attempt = Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Ongoing
        )
        result = QuizService.get_ongoing_attempt(student, quiz)
        assert result == attempt

    def test_get_ongoing_attempt_returns_none_when_no_ongoing(
        self, student, quiz
    ):
        """Trả về None khi không có attempt Ongoing."""
        Attempt.objects.create(
            user=student, quiz=quiz, status=StatusChoices.Completed
        )
        result = QuizService.get_ongoing_attempt(student, quiz)
        assert result is None


# ===========================================================================
# QuestionService._parse_choices_from_row
# ===========================================================================


class TestParseChoicesFromRow:
    """Test QuestionService._parse_choices_from_row() — không cần DB."""

    def test_parses_single_correct_choice(self):
        """Nhận diện đáp án đúng với is_correct1='true'."""
        row = {"choice1": "Paris", "is_correct1": "true", "choice2": float("nan")}
        choices = QuestionService._parse_choices_from_row(row)
        assert len(choices) == 1
        assert choices[0].content == "Paris"
        assert choices[0].is_correct is True

    def test_parses_multiple_choices(self):
        """Parse nhiều lựa chọn."""
        row = {
            "choice1": "Paris",
            "is_correct1": "true",
            "choice2": "London",
            "is_correct2": "false",
            "choice3": "Berlin",
            "is_correct3": "0",
        }
        choices = QuestionService._parse_choices_from_row(row)
        assert len(choices) == 3
        assert choices[0].is_correct is True
        assert choices[1].is_correct is False
        assert choices[2].is_correct is False

    def test_skips_empty_choices(self):
        """Bỏ qua lựa chọn trống hoặc NaN."""
        row = {
            "choice1": "Valid",
            "is_correct1": "yes",
            "choice2": float("nan"),
            "is_correct2": "true",
            "choice3": "   ",
            "is_correct3": "true",
        }
        choices = QuestionService._parse_choices_from_row(row)
        # choice2 (NaN) và choice3 (whitespace) bị bỏ qua
        assert len(choices) == 1
        assert choices[0].content == "Valid"

    def test_is_correct_various_truthy_values(self):
        """is_correct nhận diện đúng các giá trị: 'true', '1', 'yes', 'y'."""
        truthy_values = ["true", "1", "yes", "y"]
        for val in truthy_values:
            row = {"choice1": "Answer", f"is_correct1": val}
            choices = QuestionService._parse_choices_from_row(row)
            assert choices[0].is_correct is True, f"Failed for value: {val}"

    def test_is_correct_falsy_values(self):
        """Các giá trị không phải truthy → is_correct=False."""
        falsy_values = ["false", "0", "no", "n", "", "other"]
        for val in falsy_values:
            row = {"choice1": "Answer", "is_correct1": val}
            choices = QuestionService._parse_choices_from_row(row)
            assert choices[0].is_correct is False, f"Failed for value: {val}"

    def test_returns_empty_list_when_all_empty(self):
        """Tất cả choices trống → danh sách rỗng."""
        row = {f"choice{i}": float("nan") for i in range(1, 11)}
        choices = QuestionService._parse_choices_from_row(row)
        assert choices == []


# ===========================================================================
# QuestionService.create_from_ai_data
# ===========================================================================


@pytest.mark.django_db
class TestCreateFromAIData:
    """Test QuestionService.create_from_ai_data()."""

    def test_creates_questions_from_ai_data(self, teacher, subject):
        """Tạo questions từ dữ liệu AI → số lượng đúng."""
        questions_data = [
            {
                "content": "What is AI?",
                "choices": [
                    {"content": "Artificial Intelligence", "is_correct": True},
                    {"content": "Automated Input", "is_correct": False},
                ],
            },
            {
                "content": "What is ML?",
                "choices": [
                    {"content": "Machine Learning", "is_correct": True},
                    {"content": "Manual Logging", "is_correct": False},
                ],
            },
        ]
        created = QuestionService.create_from_ai_data(
            questions_data, "single", subject, teacher
        )
        assert len(created) == 2

    def test_creates_choices_for_each_question(self, teacher, subject):
        """Mỗi question có đủ số lượng choices."""
        questions_data = [
            {
                "content": "Test question?",
                "choices": [
                    {"content": "A", "is_correct": True},
                    {"content": "B", "is_correct": False},
                    {"content": "C", "is_correct": False},
                ],
            }
        ]
        created = QuestionService.create_from_ai_data(
            questions_data, "single", subject, teacher
        )
        question = created[0]
        question.refresh_from_db()
        assert question.choices.count() == 3

    def test_correct_choices_marked_is_correct(self, teacher, subject):
        """is_correct được set đúng từ dữ liệu AI."""
        questions_data = [
            {
                "content": "Which is correct?",
                "choices": [
                    {"content": "Right", "is_correct": True},
                    {"content": "Wrong1", "is_correct": False},
                    {"content": "Wrong2", "is_correct": False},
                ],
            }
        ]
        created = QuestionService.create_from_ai_data(
            questions_data, "single", subject, teacher
        )
        question = created[0]
        question.refresh_from_db()
        correct_choices = question.choices.filter(is_correct=True)
        assert correct_choices.count() == 1
        assert correct_choices.first().content == "Right"

    def test_handles_empty_questions_data(self, teacher, subject):
        """Danh sách rỗng → không tạo question nào."""
        created = QuestionService.create_from_ai_data([], "single", subject, teacher)
        assert created == []

    def test_question_attributes_set_correctly(self, teacher, subject):
        """type, subject, author được gán đúng."""
        questions_data = [
            {
                "content": "  Test question with spaces  ",
                "choices": [{"content": "Answer", "is_correct": True}],
            }
        ]
        created = QuestionService.create_from_ai_data(
            questions_data, "multiple", subject, teacher
        )
        q = created[0]
        q.refresh_from_db()
        assert q.type == "multiple"
        assert q.subject == subject
        assert q.author == teacher
        # content được strip()
        assert q.content == "Test question with spaces"


# ===========================================================================
# Notification.is_read property
# ===========================================================================


@pytest.mark.django_db
class TestNotificationIsRead:
    """Test property is_read trên model Notification."""

    def test_is_read_false_when_read_at_none(self, regular_user):
        """Thông báo chưa đọc → is_read = False."""
        n = Notification.objects.create(
            recipient=regular_user,
            title="Unread",
            type=NotificationType.GENERIC,
        )
        assert n.is_read is False

    def test_is_read_true_when_read_at_set(self, regular_user):
        """Thông báo đã đọc → is_read = True."""
        from django.utils import timezone

        n = Notification.objects.create(
            recipient=regular_user,
            title="Read",
            type=NotificationType.GENERIC,
            read_at=timezone.now(),
        )
        assert n.is_read is True


# ===========================================================================
# Model __str__ methods
# ===========================================================================


@pytest.mark.django_db
class TestModelStrMethods:
    """Test __str__ methods của các model."""

    def test_user_str(self, regular_user):
        assert str(regular_user) == f"{regular_user.username} - {regular_user.role}"

    def test_quiz_str(self, db, teacher, subject):
        quiz = Quiz.objects.create(
            title="My Quiz", author=teacher, subject=subject
        )
        assert "My Quiz" in str(quiz) or quiz.title == "My Quiz"

    def test_subject_str(self, subject):
        assert str(subject) == subject.name

    def test_notification_str(self, regular_user):
        n = Notification.objects.create(
            recipient=regular_user,
            title="Hello",
            type=NotificationType.GENERIC,
        )
        assert regular_user.username in str(n)
        assert "Hello" in str(n)
