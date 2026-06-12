# exam/tests/notification/test_notification_api.py
"""
Unit tests cho Notification API.

Endpoints được kiểm thử:
  GET    /api/notification/                      → danh sách thông báo
  GET    /api/notification/<id>/                 → chi tiết thông báo
  DELETE /api/notification/<id>/                 → xóa mềm
  POST   /api/notification/mark-as-read/         → đánh dấu đã đọc (bulk)
  POST   /api/notification/mark-as-deleted/      → đánh dấu đã xóa (bulk)
  GET    /api/notification/unread-count/         → đếm thông báo chưa đọc

Chạy: pytest exam/tests/notification/ -v
"""

import pytest
from django.utils import timezone
from exam.models import Notification, NotificationType, User, UserRole


BASE_URL = "/api/notification/"


# ===========================================================================
# Fixtures cục bộ
# ===========================================================================


@pytest.fixture
def other_user_2(db):
    return User.objects.create_user(
        username="anotheruser",
        email="another2@example.com",
        password="Pass123!",
        role=UserRole.Student,
    )


@pytest.fixture
def notification(db, regular_user):
    """Thông báo chưa đọc gửi cho regular_user."""
    return Notification.objects.create(
        recipient=regular_user,
        title="Test Notification",
        content="This is a test notification",
        type=NotificationType.GENERIC,
    )


@pytest.fixture
def read_notification(db, regular_user):
    """Thông báo đã đọc gửi cho regular_user."""
    return Notification.objects.create(
        recipient=regular_user,
        title="Read Notification",
        content="Already read",
        type=NotificationType.GENERIC,
        read_at=timezone.now(),
    )


@pytest.fixture
def other_notification(db, other_user):
    """Thông báo của một user khác."""
    return Notification.objects.create(
        recipient=other_user,
        title="Other User Notification",
        content="Not for regular_user",
        type=NotificationType.GENERIC,
    )


# ===========================================================================
# List
# ===========================================================================


@pytest.mark.django_db
class TestNotificationList:
    """Test GET /api/notification/ — danh sách thông báo."""

    def test_unauthenticated_returns_401(self, api_client):
        """Chưa đăng nhập không được xem thông báo."""
        response = api_client.get(BASE_URL)
        assert response.status_code == 401

    def test_authenticated_returns_200(self, auth_client):
        """User đã đăng nhập nhận HTTP 200."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200

    def test_user_only_sees_own_notifications(
        self, auth_client, notification, other_notification
    ):
        """User chỉ thấy thông báo của chính mình, không thấy của người khác."""
        response = auth_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [n["id"] for n in response.data["results"]]
        assert notification.id in ids
        assert other_notification.id not in ids

    def test_list_returns_paginated_response(self, auth_client, notification):
        """Response có cấu trúc phân trang chuẩn."""
        response = auth_client.get(BASE_URL)
        assert "results" in response.data
        assert "count" in response.data

    def test_deleted_notification_not_in_list(self, auth_client, notification):
        """Thông báo đã xóa mềm (deleted_at != None) không xuất hiện."""
        notification.deleted_at = timezone.now()
        notification.save()
        response = auth_client.get(BASE_URL)
        ids = [n["id"] for n in response.data["results"]]
        assert notification.id not in ids


# ===========================================================================
# Retrieve
# ===========================================================================


@pytest.mark.django_db
class TestNotificationRetrieve:
    """Test GET /api/notification/<id>/ — chi tiết thông báo."""

    def test_retrieve_own_notification_returns_200(
        self, auth_client, notification
    ):
        """Lấy thông báo của chính mình → 200."""
        response = auth_client.get(f"{BASE_URL}{notification.id}/")
        assert response.status_code == 200
        assert response.data["id"] == notification.id
        assert response.data["title"] == notification.title

    def test_retrieve_other_user_notification_returns_404(
        self, auth_client, other_notification
    ):
        """Không thể xem thông báo của người khác (queryset scope) → 404."""
        response = auth_client.get(f"{BASE_URL}{other_notification.id}/")
        assert response.status_code == 404

    def test_retrieve_nonexistent_returns_404(self, auth_client):
        """ID không tồn tại → 404."""
        response = auth_client.get(f"{BASE_URL}99999/")
        assert response.status_code == 404


# ===========================================================================
# Destroy (soft delete)
# ===========================================================================


@pytest.mark.django_db
class TestNotificationDestroy:
    """Test DELETE /api/notification/<id>/ — xóa mềm thông báo."""

    def test_delete_own_notification_returns_204(self, auth_client, notification):
        """Xóa thông báo của chính mình → 204."""
        response = auth_client.delete(f"{BASE_URL}{notification.id}/")
        assert response.status_code == 204

    def test_notification_soft_deleted_after_destroy(
        self, auth_client, notification
    ):
        """Sau khi xóa, deleted_at được set (soft delete, không xóa khỏi DB)."""
        auth_client.delete(f"{BASE_URL}{notification.id}/")
        notification.refresh_from_db()
        assert notification.deleted_at is not None

    def test_notification_not_in_list_after_delete(
        self, auth_client, notification
    ):
        """Sau khi xóa mềm, thông báo không còn hiện trong danh sách."""
        auth_client.delete(f"{BASE_URL}{notification.id}/")
        response = auth_client.get(BASE_URL)
        ids = [n["id"] for n in response.data["results"]]
        assert notification.id not in ids

    def test_delete_other_user_notification_returns_404(
        self, auth_client, other_notification
    ):
        """Không thể xóa thông báo của người khác."""
        response = auth_client.delete(f"{BASE_URL}{other_notification.id}/")
        assert response.status_code == 404

    def test_unauthenticated_delete_returns_401(self, api_client, notification):
        """Chưa xác thực → 401."""
        response = api_client.delete(f"{BASE_URL}{notification.id}/")
        assert response.status_code == 401


# ===========================================================================
# Mark as Read
# ===========================================================================


@pytest.mark.django_db
class TestMarkAsRead:
    """Test POST /api/notification/mark-as-read/ — đánh dấu đã đọc (bulk)."""

    def test_mark_single_notification_as_read(self, auth_client, notification):
        """Đánh dấu đọc 1 thông báo → updated=1."""
        payload = {"ids": [notification.id]}
        response = auth_client.post(
            f"{BASE_URL}mark-as-read/", data=payload, format="json"
        )
        assert response.status_code == 200
        assert response.data["updated"] == 1
        notification.refresh_from_db()
        assert notification.read_at is not None

    def test_mark_already_read_notification_updates_0(
        self, auth_client, read_notification
    ):
        """Thông báo đã đọc → updated=0 (không cập nhật lại)."""
        payload = {"ids": [read_notification.id]}
        response = auth_client.post(
            f"{BASE_URL}mark-as-read/", data=payload, format="json"
        )
        assert response.status_code == 200
        assert response.data["updated"] == 0

    def test_mark_empty_ids_returns_0(self, auth_client):
        """Danh sách rỗng → updated=0."""
        payload = {"ids": []}
        response = auth_client.post(
            f"{BASE_URL}mark-as-read/", data=payload, format="json"
        )
        assert response.status_code == 200
        assert response.data["updated"] == 0

    def test_cannot_mark_others_notifications_as_read(
        self, auth_client, other_notification
    ):
        """Không thể đánh dấu đọc thông báo của người khác."""
        payload = {"ids": [other_notification.id]}
        response = auth_client.post(
            f"{BASE_URL}mark-as-read/", data=payload, format="json"
        )
        assert response.status_code == 200
        # queryset đã scope theo user nên updated = 0
        assert response.data["updated"] == 0

    def test_unauthenticated_returns_401(self, api_client, notification):
        """Chưa xác thực → 401."""
        payload = {"ids": [notification.id]}
        response = api_client.post(
            f"{BASE_URL}mark-as-read/", data=payload, format="json"
        )
        assert response.status_code == 401


# ===========================================================================
# Mark as Deleted (bulk)
# ===========================================================================


@pytest.mark.django_db
class TestMarkAsDeleted:
    """Test POST /api/notification/mark-as-deleted/ — xóa mềm hàng loạt."""

    def test_mark_multiple_as_deleted(self, auth_client, regular_user):
        """Đánh dấu xóa nhiều thông báo → updated = số lượng tương ứng."""
        n1 = Notification.objects.create(
            recipient=regular_user, title="N1", type=NotificationType.GENERIC
        )
        n2 = Notification.objects.create(
            recipient=regular_user, title="N2", type=NotificationType.GENERIC
        )
        payload = {"ids": [n1.id, n2.id]}
        response = auth_client.post(
            f"{BASE_URL}mark-as-deleted/", data=payload, format="json"
        )
        assert response.status_code == 200
        assert response.data["updated"] == 2

    def test_mark_empty_ids_returns_0(self, auth_client):
        """Danh sách rỗng → updated=0."""
        payload = {"ids": []}
        response = auth_client.post(
            f"{BASE_URL}mark-as-deleted/", data=payload, format="json"
        )
        assert response.status_code == 200
        assert response.data["updated"] == 0


# ===========================================================================
# Unread Count
# ===========================================================================


@pytest.mark.django_db
class TestUnreadCount:
    """Test GET /api/notification/unread-count/ — đếm thông báo chưa đọc."""

    def test_unread_count_correct(
        self, auth_client, notification, read_notification
    ):
        """Chỉ đếm thông báo chưa đọc (read_at is None)."""
        response = auth_client.get(f"{BASE_URL}unread-count/")
        assert response.status_code == 200
        assert response.data["count"] == 1  # chỉ `notification` chưa đọc

    def test_unread_count_zero_when_all_read(self, auth_client, read_notification):
        """Khi tất cả đã đọc → count = 0."""
        response = auth_client.get(f"{BASE_URL}unread-count/")
        assert response.status_code == 200
        assert response.data["count"] == 0

    def test_unread_count_unauthenticated_returns_401(self, api_client):
        """Chưa xác thực → 401."""
        response = api_client.get(f"{BASE_URL}unread-count/")
        assert response.status_code == 401

    def test_unread_count_ignores_other_users_notifications(
        self, auth_client, other_notification
    ):
        """Không đếm thông báo của người khác."""
        response = auth_client.get(f"{BASE_URL}unread-count/")
        assert response.status_code == 200
        assert response.data["count"] == 0  # other_notification không phải của regular_user
