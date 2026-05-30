from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from ..models import (
    ClassGroup, ClassGroupMembership, ClassQuizAssignment,
    UserRole,
)
from ..serializers import (
    ClassGroupSerializer,
    ClassGroupDetailSerializer,
    AddStudentSerializer,
    ClassQuizAssignmentSerializer,
    AssignQuizSerializer,
)
from ..filters import ClassGroupFilter
from ..views.base import BaseViewSet
from exam.permissions import (
    IsAdminUser,
    IsTeacherUser,
    IsStudentUser,
)


@extend_schema(tags=["Class Group"])
class ClassGroupViewSet(BaseViewSet):
    queryset = ClassGroup.objects.all()
    serializer_class = ClassGroupSerializer
    search_fields = ["name", "description"]
    ordering_fields = ["id", "name", "created_at"]
    ordering = ["-created_at"]
    filterset_class = ClassGroupFilter

    permission_classes_by_action = {
        "list": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "retrieve": [IsTeacherUser | IsAdminUser | IsStudentUser],
        "create": [IsTeacherUser | IsAdminUser],
        "update": [IsTeacherUser | IsAdminUser],
        "partial_update": [IsTeacherUser | IsAdminUser],
        "destroy": [IsTeacherUser | IsAdminUser],
        "members": [IsTeacherUser | IsAdminUser],
        "add_student": [IsTeacherUser | IsAdminUser],
        "remove_student": [IsTeacherUser | IsAdminUser],
        "assign_quiz": [IsTeacherUser | IsAdminUser],
        "assigned_quizzes": [IsTeacherUser | IsAdminUser | IsStudentUser],
    }
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == "members":
            return ClassGroupDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.Admin:
            return ClassGroup.objects.all()
        elif user.role == UserRole.Teacher:
            return ClassGroup.objects.filter(created_by=user)
        elif user.role == UserRole.Student:
            return ClassGroup.objects.filter(memberships__student=user)
        return ClassGroup.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @extend_schema(
        description="Get class group details with member list",
        responses={200: ClassGroupDetailSerializer},
    )
    @action(detail=True, methods=["get"], url_path="members")
    def members(self, request, pk=None):
        class_group = self.get_object()
        serializer = ClassGroupDetailSerializer(class_group)
        return Response(serializer.data)

    @extend_schema(
        description="Add a student to the class group",
        request=AddStudentSerializer,
        responses={201: None},
    )
    @action(detail=True, methods=["post"], url_path="add-student")
    def add_student(self, request, pk=None):
        class_group = self.get_object()
        serializer = AddStudentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.validated_data["student_id"]

        _, created = ClassGroupMembership.objects.get_or_create(
            class_group=class_group, student=student
        )
        if created:
            return Response(
                {"message": f"Added {student.username} to {class_group.name}"},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"message": f"{student.username} is already in {class_group.name}"},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        description="Remove a student from the class group",
        request={"application/json": {"schema": {"properties": {"student_id": {"type": "integer"}}}}},
    )
    @action(detail=True, methods=["post"], url_path="remove-student")
    def remove_student(self, request, pk=None):
        class_group = self.get_object()
        student_id = request.data.get("student_id")
        if not student_id:
            return Response(
                {"error": "student_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deleted, _ = ClassGroupMembership.objects.filter(
            class_group=class_group, student_id=student_id
        ).delete()
        if deleted:
            return Response({"message": "Student removed"})
        return Response(
            {"error": "Student not found in class"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @extend_schema(
        description="Assign a quiz to the class group",
        request=AssignQuizSerializer,
        responses={201: None},
    )
    @action(detail=True, methods=["post"], url_path="assign-quiz")
    def assign_quiz(self, request, pk=None):
        class_group = self.get_object()
        serializer = AssignQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quiz = serializer.validated_data["quiz_id"]

        if quiz.author != request.user and request.user.role != UserRole.Admin:
            return Response(
                {"error": "You can only assign your own quizzes"},
                status=status.HTTP_403_FORBIDDEN,
            )

        _, created = ClassQuizAssignment.objects.get_or_create(
            class_group=class_group,
            quiz=quiz,
            defaults={
                "assigned_by": request.user,
                "due_date": serializer.validated_data.get("due_date"),
            },
        )
        if created:
            return Response(
                {"message": f"Quiz '{quiz.title}' assigned to {class_group.name}"},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"message": "Quiz already assigned to this class"},
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        description="List all quizzes assigned to this class group",
        responses={200: ClassQuizAssignmentSerializer(many=True)},
    )
    @action(detail=True, methods=["get"], url_path="assigned-quizzes")
    def assigned_quizzes(self, request, pk=None):
        class_group = self.get_object()
        assignments = ClassQuizAssignment.objects.filter(
            class_group=class_group
        ).select_related("quiz", "assigned_by")
        serializer = ClassQuizAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
