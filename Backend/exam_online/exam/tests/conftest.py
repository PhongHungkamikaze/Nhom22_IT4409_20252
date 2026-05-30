# exam_online/exam/tests/conftest.py
"""
Fixtures dùng chung cho toàn bộ test suite.
Chạy với: pytest (từ thư mục exam_online/)
"""

import pytest
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from exam.models import User, UserRole, Quiz, FileSet


# ---------------------------------------------------------------------------
# Client fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def api_client():
    """DRF APIClient không có xác thực."""
    return APIClient()


@pytest.fixture
def auth_client(regular_user):
    """DRF APIClient đã được xác thực bằng JWT force_authenticate."""
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


@pytest.fixture
def admin_client(admin_user):
    """DRF APIClient đã được xác thực với tài khoản admin."""
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


# ---------------------------------------------------------------------------
# User fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def regular_user(db):
    """Tạo 1 user thông thường (student)."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="StrongPass123!",
        role=UserRole.Student,
    )


@pytest.fixture
def other_user(db):
    """User khác — dùng để test phân quyền."""
    return User.objects.create_user(
        username="otheruser",
        email="other@example.com",
        password="OtherPass123!",
        role=UserRole.Student,
    )


@pytest.fixture
def admin_user(db):
    """Tạo 1 user admin (is_staff=True)."""
    return User.objects.create_user(
        username="admin",
        email="admin@example.com",
        password="AdminPass123!",
        is_staff=True,
        role=UserRole.Admin,
    )


# ---------------------------------------------------------------------------
# Domain fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def quiz(db, regular_user):
    """Tạo 1 Quiz mẫu cho user thông thường."""
    return Quiz.objects.create(
        title="Sample Quiz",
        description="A quiz for testing purposes",
        author=regular_user,
        time_limit=30,
        is_published=True,
    )


@pytest.fixture
def sample_file():
    """Tạo 1 file mẫu để upload."""
    return SimpleUploadedFile(
        "test_document.pdf", b"dummy content", content_type="application/pdf"
    )


@pytest.fixture
def fileset(db, regular_user):
    """Tạo 1 FileSet mẫu cho user thông thường."""
    uploaded = SimpleUploadedFile(
        "existing_doc.pdf", b"existing content", content_type="application/pdf"
    )
    return FileSet.objects.create(
        name="Existing Document",
        file=uploaded,
        uploaded_by=regular_user,
    )
