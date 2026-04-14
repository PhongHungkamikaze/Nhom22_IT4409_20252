# exam_online/exam/tests/search/test_search_api.py
"""
Unit tests cho Search API.

Endpoint được kiểm thử:
  GET /api/search/?q=<từ_khóa>           → tìm tất cả (quiz + file + user nếu admin)
  GET /api/search/?q=<từ_khóa>&type=quiz → chỉ tìm quiz
  GET /api/search/?q=<từ_khóa>&type=file → chỉ tìm file
  GET /api/search/?q=<từ_khóa>&type=user → chỉ tìm user (chỉ admin)

Chạy: pytest exam/tests/search/ -v
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from exam.models import FileSet


BASE_URL = "/api/search/"


# ===========================================================================
# Authentication
# ===========================================================================


@pytest.mark.django_db
class TestSearchAuthentication:
    """Kiểm tra xác thực khi gọi API search."""

    def test_unauthenticated_returns_401(self, api_client):
        """User chưa đăng nhập nhận HTTP 401."""
        response = api_client.get(BASE_URL, {"q": "test"})
        assert response.status_code == 401

    def test_authenticated_returns_200(self, auth_client):
        """User đã đăng nhập nhận HTTP 200."""
        response = auth_client.get(BASE_URL, {"q": "anything"})
        assert response.status_code == 200


# ===========================================================================
# Validation
# ===========================================================================


@pytest.mark.django_db
class TestSearchValidation:
    """Kiểm tra validation tham số đầu vào."""

    def test_missing_q_returns_400(self, auth_client):
        """Thiếu tham số `q` trả về HTTP 400."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 400
        assert "detail" in response.data

    def test_empty_q_returns_400(self, auth_client):
        """Tham số `q` là chuỗi rỗng trả về HTTP 400."""
        response = auth_client.get(BASE_URL, {"q": ""})
        assert response.status_code == 400


# ===========================================================================
# Search Quiz
# ===========================================================================


@pytest.mark.django_db
class TestSearchQuiz:
    """Kiểm tra tìm kiếm trong model Quiz."""

    def test_search_quiz_by_title(self, auth_client, quiz):
        """Tìm thấy Quiz theo tiêu đề."""
        response = auth_client.get(BASE_URL, {"q": "Sample"})
        assert response.status_code == 200
        assert "quizzes" in response.data["results"]
        titles = [q["title"] for q in response.data["results"]["quizzes"]]
        assert "Sample Quiz" in titles

    def test_search_quiz_by_description(self, auth_client, quiz):
        """Tìm thấy Quiz theo mô tả."""
        response = auth_client.get(BASE_URL, {"q": "testing purposes"})
        assert response.status_code == 200
        assert len(response.data["results"]["quizzes"]) >= 1

    def test_search_quiz_case_insensitive(self, auth_client, quiz):
        """Tìm kiếm không phân biệt chữ hoa/thường."""
        response = auth_client.get(BASE_URL, {"q": "SAMPLE quiz"})
        assert response.status_code == 200
        assert len(response.data["results"]["quizzes"]) >= 1

    def test_search_quiz_no_match_returns_empty(self, auth_client):
        """Không tìm thấy kết quả trả về mảng rỗng, không phải lỗi."""
        response = auth_client.get(BASE_URL, {"q": "xxxxxxnotexistxxxxxx"})
        assert response.status_code == 200
        assert response.data["results"]["quizzes"] == []
        assert response.data["total"] == 0

    def test_type_filter_quiz_returns_only_quiz(self, auth_client, quiz):
        """Dùng ?type=quiz chỉ trả về kết quả quiz, không có files."""
        response = auth_client.get(BASE_URL, {"q": "Sample", "type": "quiz"})
        assert response.status_code == 200
        assert "quizzes" in response.data["results"]
        assert "files" not in response.data["results"]


# ===========================================================================
# Search FileSet
# ===========================================================================


@pytest.mark.django_db
class TestSearchFileSet:
    """Kiểm tra tìm kiếm trong model FileSet."""

    def test_search_file_by_name(self, auth_client, fileset):
        """Tìm thấy FileSet theo tên."""
        response = auth_client.get(BASE_URL, {"q": "Existing"})
        assert response.status_code == 200
        assert "files" in response.data["results"]
        names = [f["name"] for f in response.data["results"]["files"]]
        assert "Existing Document" in names

    def test_user_cannot_see_other_users_files(self, auth_client, other_user):
        """User thường chỉ tìm thấy file của chính họ."""
        other_file = SimpleUploadedFile(
            "secret.txt", b"secret", content_type="text/plain"
        )
        FileSet.objects.create(
            name="Secret Document", file=other_file, uploaded_by=other_user
        )

        response = auth_client.get(BASE_URL, {"q": "Secret"})
        assert response.status_code == 200
        names = [f["name"] for f in response.data["results"].get("files", [])]
        assert "Secret Document" not in names

    def test_admin_can_see_all_files(self, admin_client, fileset, other_user):
        """Admin có thể tìm thấy file của tất cả người dùng."""
        other_file = SimpleUploadedFile(
            "admin_visible.txt", b"x", content_type="text/plain"
        )
        FileSet.objects.create(
            name="Admin Visible File", file=other_file, uploaded_by=other_user
        )
        response = admin_client.get(BASE_URL, {"q": "Admin Visible"})
        assert response.status_code == 200
        names = [f["name"] for f in response.data["results"].get("files", [])]
        assert "Admin Visible File" in names

    def test_type_filter_file_returns_only_files(self, auth_client, fileset):
        """Dùng ?type=file chỉ trả về files, không có quizzes."""
        response = auth_client.get(BASE_URL, {"q": "Existing", "type": "file"})
        assert response.status_code == 200
        assert "files" in response.data["results"]
        assert "quizzes" not in response.data["results"]


# ===========================================================================
# Search User (admin only)
# ===========================================================================


@pytest.mark.django_db
class TestSearchUser:
    """Kiểm tra tìm kiếm trong model User (chỉ admin)."""

    def test_admin_can_search_users(self, admin_client, regular_user):
        """Admin tìm thấy user theo username."""
        response = admin_client.get(BASE_URL, {"q": "testuser", "type": "user"})
        assert response.status_code == 200
        assert "users" in response.data["results"]
        usernames = [u["username"] for u in response.data["results"]["users"]]
        assert "testuser" in usernames

    def test_regular_user_cannot_see_user_results(self, auth_client, admin_user):
        """User thường không thấy kết quả tìm kiếm user dù dùng ?type=user."""
        response = auth_client.get(BASE_URL, {"q": "admin", "type": "user"})
        assert response.status_code == 200
        assert "users" not in response.data["results"]


# ===========================================================================
# Response Structure
# ===========================================================================


@pytest.mark.django_db
class TestSearchResponseStructure:
    """Kiểm tra cấu trúc JSON của response."""

    def test_response_has_required_keys(self, auth_client, quiz):
        """Response luôn có các key: query, results, total."""
        response = auth_client.get(BASE_URL, {"q": "sample"})
        assert "query" in response.data
        assert "results" in response.data
        assert "total" in response.data

    def test_query_field_echoes_input(self, auth_client):
        """Trường `query` phản chiếu lại từ khóa tìm kiếm."""
        response = auth_client.get(BASE_URL, {"q": "my_keyword"})
        assert response.data["query"] == "my_keyword"

    def test_total_is_sum_of_all_results(self, auth_client, quiz, fileset):
        """Trường `total` là tổng số kết quả từ tất cả các category."""
        response = auth_client.get(BASE_URL, {"q": "sample"})
        results = response.data["results"]
        expected_total = sum(len(v) for v in results.values())
        assert response.data["total"] == expected_total
