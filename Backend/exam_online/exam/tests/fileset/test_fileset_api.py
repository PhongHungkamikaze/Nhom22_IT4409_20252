# exam_online/exam/tests/fileset/test_fileset_api.py
"""
Unit tests cho FileSet API.

Endpoints được kiểm thử:
  GET    /api/filesets/        → list
  POST   /api/filesets/        → create (upload)
  GET    /api/filesets/<id>/   → retrieve
  PATCH  /api/filesets/<id>/   → partial_update
  DELETE /api/filesets/<id>/   → destroy

Chạy: pytest exam/tests/fileset/ -v
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile


BASE_URL = "/api/filesets/"


# ===========================================================================
# List (GET /api/filesets/)
# ===========================================================================


@pytest.mark.django_db
class TestFileSetList:
    """Test GET /api/filesets/ — danh sách file của user hiện tại."""

    def test_unauthenticated_returns_401(self, api_client):
        """Người dùng chưa đăng nhập không được xem danh sách."""
        response = api_client.get(BASE_URL)
        assert response.status_code == 401

    def test_authenticated_returns_200(self, auth_client):
        """User đã đăng nhập nhận HTTP 200."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200

    def test_user_only_sees_own_files(self, auth_client, fileset, other_user):
        """User chỉ nhìn thấy file của chính họ, không thấy file người khác."""
        other_file = SimpleUploadedFile("other.txt", b"other", content_type="text/plain")
        from exam.models import FileSet

        FileSet.objects.create(name="Other File", file=other_file, uploaded_by=other_user)

        response = auth_client.get(BASE_URL)
        assert response.status_code == 200
        names = [item["name"] for item in response.data["results"]]
        assert "Existing Document" in names
        assert "Other File" not in names

    def test_admin_can_see_all_files(self, admin_client, fileset, other_user):
        """Admin dùng ?all=true xem được tất cả file."""
        other_file = SimpleUploadedFile("admin_test.txt", b"x", content_type="text/plain")
        from exam.models import FileSet

        FileSet.objects.create(name="Another File", file=other_file, uploaded_by=other_user)

        response = admin_client.get(BASE_URL + "?all=true")
        assert response.status_code == 200
        assert response.data["count"] >= 2

    def test_list_returns_paginated_response(self, auth_client):
        """Danh sách trả về cấu trúc phân trang chuẩn của DRF."""
        response = auth_client.get(BASE_URL)
        assert "results" in response.data
        assert "count" in response.data


# ===========================================================================
# Create (POST /api/filesets/)
# ===========================================================================


@pytest.mark.django_db
class TestFileSetCreate:
    """Test POST /api/filesets/ — tải file lên."""

    def test_upload_file_returns_201(self, auth_client, sample_file):
        """Upload thành công trả về HTTP 201 và dữ liệu file."""
        payload = {"name": "My Report", "file": sample_file}
        response = auth_client.post(BASE_URL, data=payload, format="multipart")
        assert response.status_code == 201
        assert response.data["name"] == "My Report"
        assert "id" in response.data

    def test_upload_without_file_returns_400(self, auth_client):
        """Upload thiếu trường `file` trả về HTTP 400."""
        payload = {"name": "Missing File"}
        response = auth_client.post(BASE_URL, data=payload, format="multipart")
        assert response.status_code == 400
        assert "file" in response.data

    def test_upload_without_name_returns_400(self, auth_client, sample_file):
        """Upload thiếu trường `name` trả về HTTP 400."""
        payload = {"file": sample_file}
        response = auth_client.post(BASE_URL, data=payload, format="multipart")
        assert response.status_code == 400
        assert "name" in response.data

    def test_unauthenticated_upload_returns_401(self, api_client, sample_file):
        """User chưa đăng nhập không thể tải file lên."""
        payload = {"name": "Unauthorized", "file": sample_file}
        response = api_client.post(BASE_URL, data=payload, format="multipart")
        assert response.status_code == 401

    def test_uploaded_by_is_set_to_current_user(self, auth_client, sample_file, regular_user):
        """Trường `uploaded_by` tự động gán thành username của user hiện tại."""
        payload = {"name": "Auto Owner Test", "file": sample_file}
        response = auth_client.post(BASE_URL, data=payload, format="multipart")
        assert response.status_code == 201
        assert response.data["uploaded_by"] == str(regular_user)


# ===========================================================================
# Retrieve (GET /api/filesets/<id>/)
# ===========================================================================


@pytest.mark.django_db
class TestFileSetRetrieve:
    """Test GET /api/filesets/<id>/ — xem chi tiết một file."""

    def test_retrieve_own_file_returns_200(self, auth_client, fileset):
        """User xem được file của chính mình."""
        url = f"{BASE_URL}{fileset.id}/"
        response = auth_client.get(url)
        assert response.status_code == 200
        assert response.data["id"] == fileset.id
        assert response.data["name"] == fileset.name

    def test_retrieve_other_user_file_returns_404(self, auth_client, other_user):
        """User không thể xem file của người khác (404 vì queryset đã scope)."""
        other_file = SimpleUploadedFile("hidden.txt", b"hidden", content_type="text/plain")
        from exam.models import FileSet

        other_fileset = FileSet.objects.create(
            name="Hidden File", file=other_file, uploaded_by=other_user
        )
        response = auth_client.get(f"{BASE_URL}{other_fileset.id}/")
        assert response.status_code == 404

    def test_retrieve_nonexistent_returns_404(self, auth_client):
        """ID không tồn tại trả về HTTP 404."""
        response = auth_client.get(f"{BASE_URL}99999/")
        assert response.status_code == 404


# ===========================================================================
# Partial Update (PATCH /api/filesets/<id>/)
# ===========================================================================


@pytest.mark.django_db
class TestFileSetUpdate:
    """Test PATCH /api/filesets/<id>/ — cập nhật tên file."""

    def test_patch_name_returns_200(self, auth_client, fileset):
        """Đổi tên file thành công."""
        url = f"{BASE_URL}{fileset.id}/"
        response = auth_client.patch(url, data={"name": "Updated Name"}, format="json")
        assert response.status_code == 200
        assert response.data["name"] == "Updated Name"

    def test_patch_other_user_file_returns_404(self, auth_client, other_user):
        """Không thể sửa file của người khác."""
        other_file = SimpleUploadedFile("other_patch.txt", b"x", content_type="text/plain")
        from exam.models import FileSet

        other_fileset = FileSet.objects.create(
            name="Other Patch File", file=other_file, uploaded_by=other_user
        )
        response = auth_client.patch(
            f"{BASE_URL}{other_fileset.id}/", data={"name": "Hacked"}, format="json"
        )
        assert response.status_code == 404


# ===========================================================================
# Destroy (DELETE /api/filesets/<id>/)
# ===========================================================================


@pytest.mark.django_db
class TestFileSetDestroy:
    """Test DELETE /api/filesets/<id>/ — xóa file."""

    def test_delete_own_file_returns_204(self, auth_client, fileset):
        """Xóa file của chính mình thành công."""
        response = auth_client.delete(f"{BASE_URL}{fileset.id}/")
        assert response.status_code == 204

    def test_file_no_longer_in_list_after_delete(self, auth_client, fileset):
        """Sau khi xóa, file không còn xuất hiện trong danh sách."""
        auth_client.delete(f"{BASE_URL}{fileset.id}/")
        response = auth_client.get(BASE_URL)
        ids = [item["id"] for item in response.data["results"]]
        assert fileset.id not in ids

    def test_delete_other_user_file_returns_404(self, auth_client, other_user):
        """Không thể xóa file của người khác."""
        other_file = SimpleUploadedFile("delete_test.txt", b"x", content_type="text/plain")
        from exam.models import FileSet

        other_fileset = FileSet.objects.create(
            name="Protected File", file=other_file, uploaded_by=other_user
        )
        response = auth_client.delete(f"{BASE_URL}{other_fileset.id}/")
        assert response.status_code == 404

    def test_unauthenticated_delete_returns_401(self, api_client, fileset):
        """User chưa đăng nhập không thể xóa file."""
        response = api_client.delete(f"{BASE_URL}{fileset.id}/")
        assert response.status_code == 401
