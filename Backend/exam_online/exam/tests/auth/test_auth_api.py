# exam_online/exam/tests/auth/test_auth_api.py
"""
Unit tests cho Authentication API.

Endpoints được kiểm thử:
  POST /api/auth/register/          → đăng ký tài khoản mới
  POST /api/auth/login/             → đăng nhập, nhận JWT token
  POST /api/auth/change-password/   → đổi mật khẩu (yêu cầu đăng nhập)
  POST /api/auth/forgot-password/   → gửi email reset mật khẩu
  POST /api/auth/reset-password/    → xác nhận reset với uid + token

Chạy: pytest exam/tests/auth/ -v
"""

import pytest


REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
CHANGE_PASSWORD_URL = "/api/auth/change-password/"
FORGOT_PASSWORD_URL = "/api/auth/forgot-password/"
RESET_PASSWORD_URL = "/api/auth/reset-password/"


# ===========================================================================
# Register
# ===========================================================================


@pytest.mark.django_db
class TestRegister:
    """Test POST /api/auth/register/"""

    def test_register_success_returns_201(self, api_client):
        """Đăng ký thành công trả về HTTP 201 và thông tin user."""
        payload = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "password2": "SecurePass123!",
        }
        response = api_client.post(REGISTER_URL, data=payload, format="json")
        assert response.status_code == 201
        assert "user" in response.data
        assert response.data["user"]["username"] == "newuser"

    def test_register_duplicate_username_returns_400(self, api_client, regular_user):
        """Đăng ký với username đã tồn tại trả về HTTP 400."""
        payload = {
            "username": "testuser",  # trùng với regular_user fixture
            "email": "another@example.com",
            "password": "SecurePass123!",
            "password2": "SecurePass123!",
        }
        response = api_client.post(REGISTER_URL, data=payload, format="json")
        assert response.status_code == 400

    def test_register_password_mismatch_returns_400(self, api_client):
        """Mật khẩu không khớp trả về HTTP 400."""
        payload = {
            "username": "mismatchuser",
            "email": "mismatch@example.com",
            "password": "SecurePass123!",
            "password2": "DifferentPass456!",
        }
        response = api_client.post(REGISTER_URL, data=payload, format="json")
        assert response.status_code == 400

    def test_register_missing_fields_returns_400(self, api_client):
        """Thiếu trường bắt buộc trả về HTTP 400."""
        payload = {"username": "incomplete"}
        response = api_client.post(REGISTER_URL, data=payload, format="json")
        assert response.status_code == 400


# ===========================================================================
# Login
# ===========================================================================


@pytest.mark.django_db
class TestLogin:
    """Test POST /api/auth/login/ — nhận JWT token."""

    def test_login_valid_credentials_returns_200(self, api_client, regular_user):
        """Đăng nhập đúng thông tin trả về HTTP 200 và access + refresh token."""
        payload = {"username": "testuser", "password": "StrongPass123!"}
        response = api_client.post(LOGIN_URL, data=payload, format="json")
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password_returns_401(self, api_client, regular_user):
        """Đăng nhập sai mật khẩu trả về HTTP 401."""
        payload = {"username": "testuser", "password": "WrongPassword!"}
        response = api_client.post(LOGIN_URL, data=payload, format="json")
        assert response.status_code == 401

    def test_login_nonexistent_user_returns_401(self, api_client):
        """Đăng nhập với user không tồn tại trả về HTTP 401."""
        payload = {"username": "ghost_user", "password": "SomePass123!"}
        response = api_client.post(LOGIN_URL, data=payload, format="json")
        assert response.status_code == 401

    def test_login_missing_username_returns_400(self, api_client):
        """Thiếu username trả về HTTP 400."""
        payload = {"password": "SomePass123!"}
        response = api_client.post(LOGIN_URL, data=payload, format="json")
        assert response.status_code == 400


# ===========================================================================
# Change Password
# ===========================================================================


@pytest.mark.django_db
class TestChangePassword:
    """Test POST /api/auth/change-password/"""

    def test_change_password_success_returns_200(self, auth_client):
        """Đổi mật khẩu với thông tin đúng trả về HTTP 200."""
        payload = {
            "old_password": "StrongPass123!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        }
        response = auth_client.post(CHANGE_PASSWORD_URL, data=payload, format="json")
        assert response.status_code == 200
        assert "detail" in response.data

    def test_change_password_wrong_old_password_returns_400(self, auth_client):
        """Sai mật khẩu cũ trả về HTTP 400."""
        payload = {
            "old_password": "WrongOldPass!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        }
        response = auth_client.post(CHANGE_PASSWORD_URL, data=payload, format="json")
        assert response.status_code == 400

    def test_change_password_unauthenticated_returns_401(self, api_client):
        """User chưa đăng nhập không thể đổi mật khẩu."""
        payload = {
            "old_password": "StrongPass123!",
            "new_password": "NewSecurePass456!",
            "confirm_password": "NewSecurePass456!",
        }
        response = api_client.post(CHANGE_PASSWORD_URL, data=payload, format="json")
        assert response.status_code == 401


# ===========================================================================
# Forgot Password
# ===========================================================================


@pytest.mark.django_db
class TestForgotPassword:
    """Test POST /api/auth/forgot-password/"""

    def test_forgot_password_valid_email_returns_200(self, api_client, regular_user):
        """Email tồn tại trả về HTTP 200 (email được gửi đi)."""
        payload = {"email": "test@example.com"}
        response = api_client.post(FORGOT_PASSWORD_URL, data=payload, format="json")
        assert response.status_code == 200
        assert "detail" in response.data

    def test_forgot_password_nonexistent_email_returns_400(self, api_client):
        """Email không tồn tại trả về HTTP 400."""
        payload = {"email": "ghost@notexist.com"}
        response = api_client.post(FORGOT_PASSWORD_URL, data=payload, format="json")
        assert response.status_code in (400, 404)

    def test_forgot_password_missing_email_returns_400(self, api_client):
        """Thiếu trường email trả về HTTP 400."""
        response = api_client.post(FORGOT_PASSWORD_URL, data={}, format="json")
        assert response.status_code == 400
