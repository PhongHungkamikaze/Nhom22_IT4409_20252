# exam/tests/search/test_search_api.py
"""
Unit tests cho tính năng Search/Filter trên các API.

Kiểm thử khả năng tìm kiếm và lọc dữ liệu:
  - GET /api/quizzes/?search=   → search quiz theo title/description
  - GET /api/questions/?search= → search câu hỏi theo content
  - GET /api/attempts/?ordering= → sort theo các trường
  - GET /api/notification/?search= → search thông báo

Chạy: pytest exam/tests/search/ -v
"""

import pytest
from exam.models import (
    Quiz,
    Question,
    Attempt,
    Notification,
    Subject,
    User,
    UserRole,
    NotificationType,
    StatusChoices,
)


# ===========================================================================
# Fixtures cục bộ
# ===========================================================================


@pytest.fixture
def teacher_user(db):
    return User.objects.create_user(
        username="search_teacher",
        email="search_teacher@example.com",
        password="TeachPass123!",
        role=UserRole.Teacher,
    )


@pytest.fixture
def teacher_client(teacher_user):
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=teacher_user)
    return client


@pytest.fixture
def subject(db):
    return Subject.objects.create(name="Search Subject")


@pytest.fixture
def quiz_alpha(db, teacher_user, subject):
    return Quiz.objects.create(
        title="Alpha Quiz", description="First quiz",
        author=teacher_user, subject=subject, is_published=True,
    )


@pytest.fixture
def quiz_beta(db, teacher_user, subject):
    return Quiz.objects.create(
        title="Beta Exam", description="Second quiz",
        author=teacher_user, subject=subject, is_published=True,
    )


# ===========================================================================
# Quiz Search & Filter
# ===========================================================================


@pytest.mark.django_db
class TestQuizSearch:
    """Test tìm kiếm và lọc quiz."""

    def test_search_by_title_returns_matching_quiz(
        self, teacher_client, quiz_alpha, quiz_beta
    ):
        """Tìm quiz theo keyword trong title."""
        response = teacher_client.get("/api/quizzes/?search=Alpha")
        assert response.status_code == 200
        titles = [q["title"] for q in response.data["results"]]
        assert "Alpha Quiz" in titles
        assert "Beta Exam" not in titles

    def test_search_with_no_match_returns_empty(
        self, teacher_client, quiz_alpha, quiz_beta
    ):
        """Từ khóa không khớp → kết quả rỗng."""
        response = teacher_client.get("/api/quizzes/?search=NonExistentXYZ999")
        assert response.status_code == 200
        assert response.data["count"] == 0

    def test_search_is_case_insensitive(
        self, teacher_client, quiz_alpha
    ):
        """Tìm kiếm không phân biệt hoa thường."""
        response = teacher_client.get("/api/quizzes/?search=alpha")
        assert response.status_code == 200
        titles = [q["title"] for q in response.data["results"]]
        assert "Alpha Quiz" in titles

    def test_ordering_by_title_ascending(
        self, teacher_client, quiz_alpha, quiz_beta
    ):
        """Sắp xếp theo title tăng dần."""
        response = teacher_client.get("/api/quizzes/?ordering=title")
        assert response.status_code == 200
        titles = [q["title"] for q in response.data["results"]]
        assert titles == sorted(titles)

    def test_ordering_by_title_descending(
        self, teacher_client, quiz_alpha, quiz_beta
    ):
        """Sắp xếp theo title giảm dần."""
        response = teacher_client.get("/api/quizzes/?ordering=-title")
        assert response.status_code == 200
        titles = [q["title"] for q in response.data["results"]]
        assert titles == sorted(titles, reverse=True)


# ===========================================================================
# Question Search
# ===========================================================================


@pytest.mark.django_db
class TestQuestionSearch:
    """Test tìm kiếm câu hỏi."""

    def test_search_question_by_content(self, teacher_client, teacher_user, subject):
        """Teacher tìm câu hỏi theo nội dung."""
        Question.objects.create(
            content="What is Python?",
            type="single",
            author=teacher_user,
            subject=subject,
        )
        Question.objects.create(
            content="What is Java?",
            type="single",
            author=teacher_user,
            subject=subject,
        )
        response = teacher_client.get("/api/questions/?search=Python")
        assert response.status_code == 200
        contents = [q["content"] for q in response.data["results"]]
        assert any("Python" in c for c in contents)
        assert not any("Java" in c and "Python" not in c for c in contents)

    def test_question_filter_by_type(self, teacher_client, teacher_user, subject):
        """Lọc câu hỏi theo type (single/multiple)."""
        Question.objects.create(
            content="Single Q", type="single", author=teacher_user, subject=subject
        )
        Question.objects.create(
            content="Multiple Q", type="multiple", author=teacher_user, subject=subject
        )
        response = teacher_client.get("/api/questions/?type=single")
        assert response.status_code == 200
        types = [q["type"] for q in response.data["results"]]
        assert all(t == "single" for t in types)


# ===========================================================================
# Attempt Ordering
# ===========================================================================


@pytest.mark.django_db
class TestAttemptOrdering:
    """Test sắp xếp attempt."""

    def test_ordering_by_score_descending(
        self, auth_client, regular_user, quiz_alpha
    ):
        """Sắp xếp attempt theo điểm giảm dần."""
        Attempt.objects.create(
            user=regular_user, quiz=quiz_alpha,
            status=StatusChoices.Completed, score=8.5
        )
        Attempt.objects.create(
            user=regular_user, quiz=quiz_alpha,
            status=StatusChoices.Completed, score=5.0
        )
        response = auth_client.get("/api/attempts/?ordering=-score")
        assert response.status_code == 200
        scores = [a["score"] for a in response.data["results"]]
        assert scores == sorted(scores, reverse=True)


# ===========================================================================
# Notification Search
# ===========================================================================


@pytest.mark.django_db
class TestNotificationSearch:
    """Test tìm kiếm thông báo."""

    def test_search_notification_by_title(self, auth_client, regular_user):
        """Tìm thông báo theo title."""
        Notification.objects.create(
            recipient=regular_user,
            title="Exam Violation Alert",
            type=NotificationType.EXAM_VIOLATION,
        )
        Notification.objects.create(
            recipient=regular_user,
            title="Quiz Published",
            type=NotificationType.QUIZ_PUBLISHED,
        )
        response = auth_client.get("/api/notification/?search=Violation")
        assert response.status_code == 200
        titles = [n["title"] for n in response.data["results"]]
        assert "Exam Violation Alert" in titles
        assert "Quiz Published" not in titles

    def test_search_returns_empty_for_no_match(self, auth_client, regular_user):
        """Không có kết quả khớp → danh sách rỗng."""
        Notification.objects.create(
            recipient=regular_user,
            title="Some Notification",
            type=NotificationType.GENERIC,
        )
        response = auth_client.get("/api/notification/?search=ZZZNotFound999")
        assert response.status_code == 200
        assert response.data["count"] == 0
