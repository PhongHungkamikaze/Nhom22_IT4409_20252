# exam/tests/attempt/test_attempt_api.py
"""
Unit tests cho Attempt API.

Endpoints được kiểm thử:
  GET    /api/attempts/                      → danh sách attempt
  GET    /api/attempts/<id>/                 → chi tiết attempt
  POST   /api/attempts/<id>/save-answer/     → lưu câu trả lời
  POST   /api/attempts/<id>/submit/          → nộp bài
  GET    /api/attempts/current/              → attempt đang diễn ra

Chạy: pytest exam/tests/attempt/ -v
"""

import pytest
from exam.models import (
    Attempt,
    Answer,
    Quiz,
    Question,
    Choice,
    Subject,
    StatusChoices,
    UserRole,
    User,
    ClassGroup,
    ClassGroupMembership,
    ClassQuizAssignment,
)


BASE_URL = "/api/attempts/"


# ===========================================================================
# Fixtures cục bộ
# ===========================================================================


@pytest.fixture
def teacher_user(db):
    """Tạo user teacher."""
    return User.objects.create_user(
        username="teacher1",
        email="teacher@example.com",
        password="TeachPass123!",
        role=UserRole.Teacher,
    )


@pytest.fixture
def teacher_client(teacher_user):
    """APIClient đã xác thực với tài khoản teacher."""
    from rest_framework.test import APIClient

    client = APIClient()
    client.force_authenticate(user=teacher_user)
    return client


@pytest.fixture
def subject(db):
    return Subject.objects.create(name="Mathematics")


@pytest.fixture
def published_quiz(db, teacher_user, subject):
    """Quiz đã publish, tác giả là teacher."""
    return Quiz.objects.create(
        title="Published Quiz",
        author=teacher_user,
        subject=subject,
        is_published=True,
        max_attempts=3,
    )


@pytest.fixture
def question_with_choices(db, teacher_user, subject):
    """Câu hỏi single-choice với 3 lựa chọn (1 đúng)."""
    q = Question.objects.create(
        content="What is 2 + 2?",
        type=Question.TypeQuestion.Single,
        author=teacher_user,
        subject=subject,
    )
    Choice.objects.create(question=q, content="3", is_correct=False)
    Choice.objects.create(question=q, content="4", is_correct=True)
    Choice.objects.create(question=q, content="5", is_correct=False)
    return q


@pytest.fixture
def ongoing_attempt(db, regular_user, published_quiz):
    """Attempt đang diễn ra (Ongoing) của regular_user."""
    return Attempt.objects.create(
        user=regular_user,
        quiz=published_quiz,
        status=StatusChoices.Ongoing,
    )


@pytest.fixture
def class_group_with_student(db, teacher_user, regular_user, published_quiz):
    """Tạo class group, thêm student và giao quiz cho lớp."""
    cg = ClassGroup.objects.create(
        name="Class A",
        created_by=teacher_user,
    )
    ClassGroupMembership.objects.create(class_group=cg, student=regular_user)
    ClassQuizAssignment.objects.create(
        class_group=cg,
        quiz=published_quiz,
        assigned_by=teacher_user,
    )
    return cg


# ===========================================================================
# List
# ===========================================================================


@pytest.mark.django_db
class TestAttemptList:
    """Test GET /api/attempts/ — danh sách attempt."""

    def test_unauthenticated_returns_401(self, api_client):
        """Chưa đăng nhập không được xem danh sách."""
        response = api_client.get(BASE_URL)
        assert response.status_code == 401

    def test_student_sees_own_attempts(self, auth_client, ongoing_attempt):
        """Student chỉ thấy attempt của chính mình."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [a["id"] for a in response.data["results"]]
        assert ongoing_attempt.id in ids

    def test_teacher_sees_attempts_of_own_quiz(self, teacher_client, ongoing_attempt):
        """Teacher chỉ thấy attempt thuộc quiz mà mình tạo."""
        response = teacher_client.get(BASE_URL)
        assert response.status_code == 200
        # published_quiz.author = teacher_user → teacher thấy attempt này
        ids = [a["id"] for a in response.data["results"]]
        assert ongoing_attempt.id in ids

    def test_admin_sees_all_attempts(self, admin_client, ongoing_attempt):
        """Admin thấy tất cả attempt."""
        response = admin_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [a["id"] for a in response.data["results"]]
        assert ongoing_attempt.id in ids

    def test_list_returns_paginated_response(self, auth_client):
        """Response có cấu trúc phân trang."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200
        assert "results" in response.data
        assert "count" in response.data


# ===========================================================================
# Retrieve
# ===========================================================================


@pytest.mark.django_db
class TestAttemptRetrieve:
    """Test GET /api/attempts/<id>/ — chi tiết attempt."""

    def test_retrieve_own_attempt_returns_200(self, auth_client, ongoing_attempt):
        """Student lấy được attempt của chính mình."""
        response = auth_client.get(f"{BASE_URL}{ongoing_attempt.id}/")
        assert response.status_code == 200
        assert response.data["id"] == ongoing_attempt.id

    def test_retrieve_nonexistent_returns_404(self, auth_client):
        """ID không tồn tại trả về 404."""
        response = auth_client.get(f"{BASE_URL}99999/")
        assert response.status_code == 404

    def test_student_cannot_retrieve_others_attempt(
        self, auth_client, teacher_user, published_quiz
    ):
        """Student không thấy attempt của người khác (queryset đã scope)."""
        other_attempt = Attempt.objects.create(
            user=teacher_user,
            quiz=published_quiz,
            status=StatusChoices.Ongoing,
        )
        response = auth_client.get(f"{BASE_URL}{other_attempt.id}/")
        assert response.status_code == 404


# ===========================================================================
# Save Answer
# ===========================================================================


@pytest.mark.django_db
class TestSaveAnswer:
    """Test POST /api/attempts/<id>/save-answer/ — lưu câu trả lời."""

    def test_save_answer_success(
        self, auth_client, ongoing_attempt, published_quiz, question_with_choices
    ):
        """Lưu câu trả lời hợp lệ trả về HTTP 200."""
        published_quiz.questions.add(question_with_choices)
        correct_choice = Choice.objects.get(
            question=question_with_choices, is_correct=True
        )
        payload = {
            "question": question_with_choices.id,
            "selected_choices": [correct_choice.id],
        }
        url = f"{BASE_URL}{ongoing_attempt.id}/save-answer/"
        response = auth_client.post(url, data=payload, format="json")
        assert response.status_code == 200
        assert response.data.get("message") == "Saved"

    def test_save_answer_on_non_ongoing_attempt_returns_400(
        self, auth_client, regular_user, published_quiz, question_with_choices
    ):
        """Lưu câu trả lời khi attempt đã nộp trả về 400."""
        published_quiz.questions.add(question_with_choices)
        submitted_attempt = Attempt.objects.create(
            user=regular_user,
            quiz=published_quiz,
            status=StatusChoices.Completed,
        )
        correct_choice = Choice.objects.get(
            question=question_with_choices, is_correct=True
        )
        payload = {
            "question": question_with_choices.id,
            "selected_choices": [correct_choice.id],
        }
        url = f"{BASE_URL}{submitted_attempt.id}/save-answer/"
        response = auth_client.post(url, data=payload, format="json")
        assert response.status_code == 400

    def test_save_answer_unauthenticated_returns_401(
        self, api_client, ongoing_attempt, question_with_choices
    ):
        """Chưa xác thực không thể lưu câu trả lời."""
        payload = {
            "question": question_with_choices.id,
            "selected_choices": [],
        }
        url = f"{BASE_URL}{ongoing_attempt.id}/save-answer/"
        response = api_client.post(url, data=payload, format="json")
        assert response.status_code == 401

    def test_save_answer_updates_existing_answer(
        self, auth_client, ongoing_attempt, published_quiz, question_with_choices
    ):
        """Lưu lại câu trả lời → cập nhật answer cũ (không tạo mới)."""
        published_quiz.questions.add(question_with_choices)
        choices = list(Choice.objects.filter(question=question_with_choices))
        url = f"{BASE_URL}{ongoing_attempt.id}/save-answer/"

        # Lần 1: chọn đáp án sai
        payload = {
            "question": question_with_choices.id,
            "selected_choices": [choices[0].id],
        }
        auth_client.post(url, data=payload, format="json")

        # Lần 2: chọn đáp án đúng
        correct_choice = Choice.objects.get(
            question=question_with_choices, is_correct=True
        )
        payload["selected_choices"] = [correct_choice.id]
        response = auth_client.post(url, data=payload, format="json")
        assert response.status_code == 200

        # Chỉ có 1 Answer record
        count = Answer.objects.filter(
            attempt=ongoing_attempt, question=question_with_choices
        ).count()
        assert count == 1


# ===========================================================================
# Submit
# ===========================================================================


@pytest.mark.django_db
class TestSubmitAttempt:
    """Test POST /api/attempts/<id>/submit/ — nộp bài."""

    def test_submit_already_submitted_returns_400(
        self, auth_client, regular_user, published_quiz
    ):
        """Nộp attempt đã submit (Processing/Completed) → HTTP 400."""
        completed_attempt = Attempt.objects.create(
            user=regular_user,
            quiz=published_quiz,
            status=StatusChoices.Completed,
        )
        url = f"{BASE_URL}{completed_attempt.id}/submit/"
        response = auth_client.post(url, data={}, format="json")
        assert response.status_code == 400

    def test_submit_unauthenticated_returns_401(self, api_client, ongoing_attempt):
        """Chưa xác thực không thể nộp bài."""
        url = f"{BASE_URL}{ongoing_attempt.id}/submit/"
        response = api_client.post(url, data={}, format="json")
        assert response.status_code == 401


# ===========================================================================
# Current
# ===========================================================================


@pytest.mark.django_db
class TestCurrentAttempt:
    """Test GET /api/attempts/current/ — attempt đang diễn ra."""

    def test_returns_ongoing_attempt(self, auth_client, ongoing_attempt):
        """Trả về attempt đang diễn ra của user hiện tại."""
        response = auth_client.get(f"{BASE_URL}current/")
        assert response.status_code == 200
        assert response.data["id"] == ongoing_attempt.id

    def test_returns_404_when_no_ongoing_attempt(self, auth_client):
        """404 khi không có attempt nào đang diễn ra."""
        response = auth_client.get(f"{BASE_URL}current/")
        assert response.status_code == 404

    def test_unauthenticated_returns_401(self, api_client):
        """Chưa xác thực → 401."""
        response = api_client.get(f"{BASE_URL}current/")
        assert response.status_code == 401
