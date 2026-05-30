from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from exam.models import ClassGroup, ClassGroupMembership, ClassQuizAssignment
from exam.serializers.user import UserSerializer


class ClassGroupSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = ClassGroup
        fields = [
            "id", "name", "description", "subject",
            "created_by", "member_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    @extend_schema_field(serializers.IntegerField())
    def get_member_count(self, obj):
        return obj.memberships.count()


class ClassGroupDetailSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    members = serializers.SerializerMethodField()

    class Meta:
        model = ClassGroup
        fields = [
            "id", "name", "description", "subject",
            "created_by", "members",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    @extend_schema_field(UserSerializer(many=True))
    def get_members(self, obj):
        students = [m.student for m in obj.memberships.select_related("student")]
        return UserSerializer(students, many=True).data


class ClassGroupMembershipSerializer(serializers.ModelSerializer):
    student_username = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = ClassGroupMembership
        fields = ["id", "class_group", "student", "student_username", "created_at"]
        read_only_fields = ["created_at"]


class AddStudentSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()

    def validate_student_id(self, value):
        from exam.models import User
        try:
            user = User.objects.get(id=value, role="student")
        except User.DoesNotExist:
            raise serializers.ValidationError("Student not found")
        return user


class ClassQuizAssignmentSerializer(serializers.ModelSerializer):
    class_group_name = serializers.CharField(source="class_group.name", read_only=True)
    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    assigned_by_username = serializers.CharField(source="assigned_by.username", read_only=True)

    class Meta:
        model = ClassQuizAssignment
        fields = [
            "id", "class_group", "class_group_name",
            "quiz", "quiz_title",
            "assigned_by", "assigned_by_username",
            "due_date", "created_at",
        ]
        read_only_fields = ["assigned_by", "created_at"]


class AssignQuizSerializer(serializers.Serializer):
    quiz_id = serializers.IntegerField()
    due_date = serializers.DateTimeField(required=False, allow_null=True)

    def validate_quiz_id(self, value):
        from exam.models import Quiz
        try:
            quiz = Quiz.objects.get(id=value)
        except Quiz.DoesNotExist:
            raise serializers.ValidationError("Quiz not found")
        return quiz
