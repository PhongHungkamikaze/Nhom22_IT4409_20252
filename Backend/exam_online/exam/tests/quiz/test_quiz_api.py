# exam_online/exam/tests/quiz/test_quiz_api.py
"""
Unit tests cho Quiz API.

Endpoints được kiểm thử:
  GET    /api/quizzes/                    → danh sách quiz
  POST   /api/quizzes/                    → tạo quiz mới
  GET    /api/quizzes/<id>/               → chi tiết quiz
  PUT    /api/quizzes/<id>/               → cập nhật quiz
  DELETE /api/quizzes/<id>/              → xóa quiz
  GET    /api/quizzes/<id>/questions/    → danh sách câu hỏi trong quiz
  POST   /api/quizzes/<id>/start/        → bắt đầu làm bài

Chạy: pytest exam/tests/quiz/ -v
"""

import pytest


BASE_URL = "/api/quizzes/"


# ===========================================================================
# List
# ===========================================================================


@pytest.mark.django_db
class TestQuizList:
    """Test GET /api/quizzes/ — danh sách tất cả quiz."""

    def test_list_returns_200(self, auth_client):
        """User đã đăng nhập nhận HTTP 200."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200

    def test_list_unauthenticated_returns_200_or_401(self, api_client):
        """
        Tuỳ cấu hình permission: nếu AllowAny → 200, nếu IsAuthenticated → 401.
        Kiểm tra server không crash (không phải 500).
        """
        response = api_client.get(BASE_URL)
        assert response.status_code in (200, 401)

    def test_list_contains_created_quiz(self, auth_client, quiz):
        """Danh sách chứa quiz vừa tạo."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200
        titles = [q["title"] for q in response.data["results"]]
        assert "Sample Quiz" in titles

    def test_list_returns_paginated_response(self, auth_client):
        """Response có cấu trúc phân trang chuẩn."""
        response = auth_client.get(BASE_URL)
        assert "results" in response.data
        assert "count" in response.data


# ===========================================================================
# Create
# ===========================================================================


@pytest.mark.django_db
class TestQuizCreate:
    """Test POST /api/quizzes/ — tạo quiz mới."""

    def test_create_quiz_returns_201(self, auth_client, regular_user):
        """Tạo quiz hợp lệ trả về HTTP 201."""
        payload = {
            "title": "New Quiz",
            "description": "A brand new quiz",
            "author": regular_user.id,
            "time_limit": 60,
        }
        response = auth_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 201
        assert response.data["title"] == "New Quiz"

    def test_create_quiz_missing_title_returns_400(self, auth_client, regular_user):
        """Thiếu trường title trả về HTTP 400."""
        payload = {
            "description": "No title",
            "author": regular_user.id,
        }
        response = auth_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 400
        assert "title" in response.data

    def test_create_quiz_unauthenticated_returns_401(self, api_client, regular_user):
        """User chưa đăng nhập không thể tạo quiz."""
        payload = {
            "title": "Unauthorized Quiz",
            "author": regular_user.id,
        }
        response = api_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 401


# ===========================================================================
# Retrieve
# ===========================================================================


@pytest.mark.django_db
class TestQuizRetrieve:
    """Test GET /api/quizzes/<id>/ — lấy chi tiết một quiz."""

    def test_retrieve_existing_quiz_returns_200(self, auth_client, quiz):
        """Lấy quiz tồn tại trả về HTTP 200 với đúng dữ liệu."""
        response = auth_client.get(f"{BASE_URL}{quiz.id}/")
        assert response.status_code == 200
        assert response.data["id"] == quiz.id
        assert response.data["title"] == quiz.title

    def test_retrieve_nonexistent_quiz_returns_404(self, auth_client):
        """Quiz không tồn tại trả về HTTP 404."""
        response = auth_client.get(f"{BASE_URL}99999/")
        assert response.status_code == 404


# ===========================================================================
# Update
# ===========================================================================


@pytest.mark.django_db
class TestQuizUpdate:
    """Test PATCH /api/quizzes/<id>/ — cập nhật thông tin quiz."""

    def test_patch_title_returns_200(self, auth_client, quiz):
        """Đổi title quiz thành công."""
        response = auth_client.patch(
            f"{BASE_URL}{quiz.id}/",
            data={"title": "Updated Title"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["title"] == "Updated Title"

    def test_patch_time_limit_returns_200(self, auth_client, quiz):
        """Đổi time_limit thành công."""
        response = auth_client.patch(
            f"{BASE_URL}{quiz.id}/",
            data={"time_limit": 90},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["time_limit"] == 90

    def test_patch_unauthenticated_returns_401(self, api_client, quiz):
        """User chưa đăng nhập không thể cập nhật quiz."""
        response = api_client.patch(
            f"{BASE_URL}{quiz.id}/",
            data={"title": "Hacked"},
            format="json",
        )
        assert response.status_code == 401


# ===========================================================================
# Delete
# ===========================================================================


@pytest.mark.django_db
class TestQuizDelete:
    """Test DELETE /api/quizzes/<id>/ — xóa quiz."""

    def test_delete_quiz_returns_204(self, auth_client, quiz):
        """Xóa quiz thành công trả về HTTP 204."""
        response = auth_client.delete(f"{BASE_URL}{quiz.id}/")
        assert response.status_code == 204

    def test_quiz_no_longer_exists_after_delete(self, auth_client, quiz):
        """Sau khi xóa, quiz không còn tồn tại trong DB."""
        auth_client.delete(f"{BASE_URL}{quiz.id}/")
        response = auth_client.get(f"{BASE_URL}{quiz.id}/")
        assert response.status_code == 404

    def test_delete_unauthenticated_returns_401(self, api_client, quiz):
        """User chưa đăng nhập không thể xóa quiz."""
        response = api_client.delete(f"{BASE_URL}{quiz.id}/")
        assert response.status_code == 401


# ===========================================================================
# Custom Actions
# ===========================================================================


@pytest.mark.django_db
class TestQuizActions:
    """Test custom actions: questions và start."""

    def test_get_questions_returns_200(self, auth_client, quiz):
        """GET /api/quizzes/<id>/questions/ trả về HTTP 200."""
        response = auth_client.get(f"{BASE_URL}{quiz.id}/questions/")
        assert response.status_code == 200
        assert isinstance(response.data, list)

    def test_start_quiz_returns_201(self, auth_client, quiz):
        """POST /api/quizzes/<id>/start/ tạo Attempt mới, trả về HTTP 201."""
        response = auth_client.post(f"{BASE_URL}{quiz.id}/start/")
        assert response.status_code == 201
        assert "attempt" in response.data

    def test_start_quiz_twice_returns_existing_attempt(self, auth_client, quiz):
        """Bắt đầu quiz đang làm dở → trả về attempt hiện có (HTTP 200)."""
        auth_client.post(f"{BASE_URL}{quiz.id}/start/")
        response = auth_client.post(f"{BASE_URL}{quiz.id}/start/")
        assert response.status_code == 200
        assert "attempt" in response.data
