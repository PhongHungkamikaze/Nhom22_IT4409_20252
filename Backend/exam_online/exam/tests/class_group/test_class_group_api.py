# exam/tests/class_group/test_class_group_api.py
"""
Unit tests cho ClassGroup API.

Endpoints được kiểm thử:
  GET    /api/class-groups/                          → danh sách lớp học
  POST   /api/class-groups/                          → tạo lớp học
  GET    /api/class-groups/<id>/                     → chi tiết lớp học
  PATCH  /api/class-groups/<id>/                     → cập nhật lớp học
  DELETE /api/class-groups/<id>/                     → xóa lớp học
  GET    /api/class-groups/<id>/members/             → danh sách thành viên
  POST   /api/class-groups/<id>/add-student/         → thêm sinh viên
  POST   /api/class-groups/<id>/remove-student/      → xóa sinh viên
  POST   /api/class-groups/<id>/assign-quiz/         → giao quiz cho lớp
  GET    /api/class-groups/<id>/assigned-quizzes/    → danh sách quiz được giao

Chạy: pytest exam/tests/class_group/ -v
"""

import pytest
from exam.models import (
    ClassGroup,
    ClassGroupMembership,
    ClassQuizAssignment,
    Quiz,
    Subject,
    User,
    UserRole,
)


BASE_URL = "/api/class-groups/"


# ===========================================================================
# Fixtures cục bộ
# ===========================================================================


@pytest.fixture
def teacher_user(db):
    return User.objects.create_user(
        username="teacher_cg",
        email="teacher_cg@example.com",
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
    return Subject.objects.create(name="Physics")


@pytest.fixture
def class_group(db, teacher_user, subject):
    """Class group được tạo bởi teacher."""
    return ClassGroup.objects.create(
        name="Class Group A",
        description="Test class group",
        subject=subject,
        created_by=teacher_user,
    )


@pytest.fixture
def published_quiz(db, teacher_user, subject):
    """Quiz đã published do teacher tạo."""
    return Quiz.objects.create(
        title="Class Quiz",
        author=teacher_user,
        subject=subject,
        is_published=True,
        max_attempts=2,
    )


@pytest.fixture
def student_user(db):
    """Student user để test thêm vào lớp."""
    return User.objects.create_user(
        username="student_cg",
        email="student_cg@example.com",
        password="StudentPass123!",
        role=UserRole.Student,
    )


@pytest.fixture
def student_in_class(db, class_group, student_user):
    """Student đã được thêm vào class_group."""
    return ClassGroupMembership.objects.create(
        class_group=class_group, student=student_user
    )


# ===========================================================================
# List
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupList:
    """Test GET /api/class-groups/ — danh sách lớp học."""

    def test_unauthenticated_returns_401(self, api_client):
        """Chưa đăng nhập → 401."""
        response = api_client.get(BASE_URL)
        assert response.status_code == 401

    def test_teacher_sees_own_class_groups(self, teacher_client, class_group):
        """Teacher thấy lớp học do mình tạo."""
        response = teacher_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [cg["id"] for cg in response.data["results"]]
        assert class_group.id in ids

    def test_admin_sees_all_class_groups(self, admin_client, class_group):
        """Admin thấy tất cả lớp học."""
        response = admin_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [cg["id"] for cg in response.data["results"]]
        assert class_group.id in ids

    def test_student_sees_enrolled_class_groups(
        self, db, student_user, class_group, student_in_class
    ):
        """Student chỉ thấy lớp mà mình đã được thêm vào."""
        from rest_framework.test import APIClient

        student_client = APIClient()
        student_client.force_authenticate(user=student_user)
        response = student_client.get(BASE_URL)
        assert response.status_code == 200
        ids = [cg["id"] for cg in response.data["results"]]
        assert class_group.id in ids

    def test_list_returns_paginated_response(self, teacher_client):
        """Response có cấu trúc phân trang chuẩn."""
        response = teacher_client.get(BASE_URL)
        assert "results" in response.data
        assert "count" in response.data


# ===========================================================================
# Create
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupCreate:
    """Test POST /api/class-groups/ — tạo lớp học mới."""

    def test_teacher_can_create_class_group(self, teacher_client, subject):
        """Teacher tạo lớp học thành công → 201."""
        payload = {
            "name": "New Class Group",
            "description": "Created by teacher",
            "subject": subject.id,
        }
        response = teacher_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 201
        assert response.data["name"] == "New Class Group"

    def test_created_by_auto_set_to_current_user(self, teacher_client, teacher_user, subject):
        """created_by tự động gán bằng user hiện tại."""
        payload = {"name": "Auto Owner Class", "subject": subject.id}
        response = teacher_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 201
        created_group = ClassGroup.objects.get(id=response.data["id"])
        assert created_group.created_by == teacher_user

    def test_missing_name_returns_400(self, teacher_client, subject):
        """Thiếu trường name → 400."""
        payload = {"description": "No name", "subject": subject.id}
        response = teacher_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 400
        assert "name" in response.data

    def test_student_cannot_create_class_group(self, auth_client, subject):
        """Student không có quyền tạo lớp học → 403."""
        payload = {"name": "Student Class", "subject": subject.id}
        response = auth_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 403

    def test_unauthenticated_returns_401(self, api_client, subject):
        """Chưa xác thực → 401."""
        payload = {"name": "Unauth Class"}
        response = api_client.post(BASE_URL, data=payload, format="json")
        assert response.status_code == 401


# ===========================================================================
# Retrieve
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupRetrieve:
    """Test GET /api/class-groups/<id>/ — chi tiết lớp học."""

    def test_retrieve_existing_class_group_returns_200(
        self, teacher_client, class_group
    ):
        """Lấy lớp học tồn tại → 200 với dữ liệu đúng."""
        response = teacher_client.get(f"{BASE_URL}{class_group.id}/")
        assert response.status_code == 200
        assert response.data["id"] == class_group.id
        assert response.data["name"] == class_group.name

    def test_retrieve_nonexistent_returns_404(self, teacher_client):
        """ID không tồn tại → 404."""
        response = teacher_client.get(f"{BASE_URL}99999/")
        assert response.status_code == 404


# ===========================================================================
# Update
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupUpdate:
    """Test PATCH /api/class-groups/<id>/ — cập nhật lớp học."""

    def test_teacher_can_update_own_class_group(
        self, teacher_client, class_group
    ):
        """Teacher cập nhật lớp do mình tạo → 200."""
        response = teacher_client.patch(
            f"{BASE_URL}{class_group.id}/",
            data={"name": "Updated Class Name"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["name"] == "Updated Class Name"

    def test_student_cannot_update_class_group(self, auth_client, class_group):
        """Student không thể cập nhật lớp học → 403."""
        response = auth_client.patch(
            f"{BASE_URL}{class_group.id}/",
            data={"name": "Hacked"},
            format="json",
        )
        assert response.status_code == 403


# ===========================================================================
# Delete
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupDelete:
    """Test DELETE /api/class-groups/<id>/ — xóa lớp học."""

    def test_teacher_can_delete_own_class_group(
        self, teacher_client, class_group
    ):
        """Teacher xóa lớp do mình tạo → 204."""
        response = teacher_client.delete(f"{BASE_URL}{class_group.id}/")
        assert response.status_code == 204

    def test_class_group_no_longer_exists_after_delete(
        self, teacher_client, class_group
    ):
        """Sau khi xóa, lớp không còn trong DB."""
        teacher_client.delete(f"{BASE_URL}{class_group.id}/")
        assert not ClassGroup.objects.filter(id=class_group.id).exists()

    def test_unauthenticated_returns_401(self, api_client, class_group):
        """Chưa xác thực → 401."""
        response = api_client.delete(f"{BASE_URL}{class_group.id}/")
        assert response.status_code == 401


# ===========================================================================
# Members
# ===========================================================================


@pytest.mark.django_db
class TestClassGroupMembers:
    """Test GET /api/class-groups/<id>/members/ — danh sách thành viên."""

    def test_get_members_returns_200(
        self, teacher_client, class_group, student_in_class
    ):
        """Teacher xem thành viên → 200."""
        response = teacher_client.get(f"{BASE_URL}{class_group.id}/members/")
        assert response.status_code == 200

    def test_members_list_contains_enrolled_student(
        self, teacher_client, class_group, student_in_class, student_user
    ):
        """Danh sách thành viên chứa student đã được thêm."""
        response = teacher_client.get(f"{BASE_URL}{class_group.id}/members/")
        assert response.status_code == 200
        member_ids = [m["id"] for m in response.data.get("members", [])]
        assert student_user.id in member_ids


# ===========================================================================
# Add Student
# ===========================================================================


@pytest.mark.django_db
class TestAddStudent:
    """Test POST /api/class-groups/<id>/add-student/ — thêm sinh viên."""

    def test_add_student_success(
        self, teacher_client, class_group, student_user
    ):
        """Teacher thêm student vào lớp → 201."""
        payload = {"student_ids": [student_user.id]}
        url = f"{BASE_URL}{class_group.id}/add-student/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 201
        assert "added" in response.data

    def test_add_already_enrolled_student_returns_200(
        self, teacher_client, class_group, student_user, student_in_class
    ):
        """Thêm student đã có trong lớp → 200 với already_in."""
        payload = {"student_ids": [student_user.id]}
        url = f"{BASE_URL}{class_group.id}/add-student/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 200
        assert "already_in" in response.data

    def test_add_student_creates_membership(
        self, teacher_client, class_group, student_user
    ):
        """Sau khi thêm, ClassGroupMembership được tạo."""
        payload = {"student_ids": [student_user.id]}
        url = f"{BASE_URL}{class_group.id}/add-student/"
        teacher_client.post(url, data=payload, format="json")
        assert ClassGroupMembership.objects.filter(
            class_group=class_group, student=student_user
        ).exists()

    def test_student_cannot_add_student(
        self, auth_client, class_group, other_user
    ):
        """Student không có quyền thêm thành viên → 403."""
        payload = {"student_ids": [other_user.id]}
        url = f"{BASE_URL}{class_group.id}/add-student/"
        response = auth_client.post(url, data=payload, format="json")
        assert response.status_code == 403


# ===========================================================================
# Remove Student
# ===========================================================================


@pytest.mark.django_db
class TestRemoveStudent:
    """Test POST /api/class-groups/<id>/remove-student/ — xóa sinh viên."""

    def test_remove_enrolled_student_returns_200(
        self, teacher_client, class_group, student_user, student_in_class
    ):
        """Teacher xóa student đã có trong lớp → 200."""
        payload = {"student_id": student_user.id}
        url = f"{BASE_URL}{class_group.id}/remove-student/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 200
        assert not ClassGroupMembership.objects.filter(
            class_group=class_group, student=student_user
        ).exists()

    def test_remove_non_enrolled_student_returns_404(
        self, teacher_client, class_group, student_user
    ):
        """Xóa student không có trong lớp → 404."""
        payload = {"student_id": student_user.id}
        url = f"{BASE_URL}{class_group.id}/remove-student/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 404

    def test_remove_without_student_id_returns_400(
        self, teacher_client, class_group
    ):
        """Thiếu student_id → 400."""
        url = f"{BASE_URL}{class_group.id}/remove-student/"
        response = teacher_client.post(url, data={}, format="json")
        assert response.status_code == 400


# ===========================================================================
# Assign Quiz
# ===========================================================================


@pytest.mark.django_db
class TestAssignQuiz:
    """Test POST /api/class-groups/<id>/assign-quiz/ — giao quiz cho lớp."""

    def test_assign_quiz_success(
        self, teacher_client, class_group, published_quiz
    ):
        """Teacher giao quiz của mình cho lớp → 201."""
        payload = {"quiz_id": published_quiz.id}
        url = f"{BASE_URL}{class_group.id}/assign-quiz/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 201
        assert ClassQuizAssignment.objects.filter(
            class_group=class_group, quiz=published_quiz
        ).exists()

    def test_assign_quiz_already_assigned_returns_200(
        self, teacher_client, class_group, published_quiz, teacher_user
    ):
        """Giao quiz đã được giao → 200 (không tạo duplicate)."""
        ClassQuizAssignment.objects.create(
            class_group=class_group,
            quiz=published_quiz,
            assigned_by=teacher_user,
        )
        payload = {"quiz_id": published_quiz.id}
        url = f"{BASE_URL}{class_group.id}/assign-quiz/"
        response = teacher_client.post(url, data=payload, format="json")
        assert response.status_code == 200

    def test_student_cannot_assign_quiz(
        self, auth_client, class_group, published_quiz
    ):
        """Student không có quyền giao quiz → 403."""
        payload = {"quiz_id": published_quiz.id}
        url = f"{BASE_URL}{class_group.id}/assign-quiz/"
        response = auth_client.post(url, data=payload, format="json")
        assert response.status_code == 403


# ===========================================================================
# Assigned Quizzes
# ===========================================================================


@pytest.mark.django_db
class TestAssignedQuizzes:
    """Test GET /api/class-groups/<id>/assigned-quizzes/ — danh sách quiz đã giao."""

    def test_get_assigned_quizzes_returns_200(
        self, teacher_client, class_group, published_quiz, teacher_user
    ):
        """Lấy danh sách quiz đã giao → 200."""
        ClassQuizAssignment.objects.create(
            class_group=class_group,
            quiz=published_quiz,
            assigned_by=teacher_user,
        )
        url = f"{BASE_URL}{class_group.id}/assigned-quizzes/"
        response = teacher_client.get(url)
        assert response.status_code == 200
        assert len(response.data) >= 1

    def test_assigned_quizzes_empty_when_none_assigned(
        self, teacher_client, class_group
    ):
        """Lớp không có quiz nào được giao → danh sách rỗng."""
        url = f"{BASE_URL}{class_group.id}/assigned-quizzes/"
        response = teacher_client.get(url)
        assert response.status_code == 200
        assert response.data == []

    def test_unpublished_quiz_not_in_assigned_list(
        self, teacher_client, class_group, teacher_user, subject
    ):
        """Quiz chưa published không xuất hiện trong danh sách quiz được giao."""
        unpublished_quiz = Quiz.objects.create(
            title="Unpublished Quiz",
            author=teacher_user,
            subject=subject,
            is_published=False,
        )
        ClassQuizAssignment.objects.create(
            class_group=class_group,
            quiz=unpublished_quiz,
            assigned_by=teacher_user,
        )
        url = f"{BASE_URL}{class_group.id}/assigned-quizzes/"
        response = teacher_client.get(url)
        assert response.status_code == 200
        quiz_ids = [a["quiz"]["id"] for a in response.data]
        assert unpublished_quiz.id not in quiz_ids
