import uuid
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import User, AbstractUser
from django.utils import timezone


# Create your models here.
class User(AbstractUser):
    class UserRole(models.TextChoices):
        Student = "student", "Student"
        Teacher = "teacher", "Teacher"
        Admin = "admin", "Admin"

    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.Student
    )

    def __str__(self):
        return f"{self.username} - {self.role}"


class Quiz(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    author = models.ForeignKey(User, on_delete=models.CASCADE)

    time_limit = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)

    class TypeQuestion(models.TextChoices):
        Multiple = "multiple", "Multiple choice"
        Single = "single", "Single choice"

    type = models.CharField(
        max_length=20, choices=TypeQuestion.choices, default=TypeQuestion.Single
    )

    content = models.TextField()


class Choice(models.Model):
    question = models.ForeignKey(
        Question, related_name="choices", on_delete=models.CASCADE
    )

    content = models.CharField(max_length=255)

    is_correct = models.BooleanField(default=False)

class StatusChoices(models.TextChoices):
        Ready = ("ready", "Ready")
        Ongoing = (
            "ongoing",
            "Ongoing",
        )
        Completed = "completed", "Completed"

class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    score = models.FloatField(default=0)
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.Ready
    )
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True)


class Answer(models.Model):
    attempt = models.ForeignKey(
        Attempt, related_name="answers", on_delete=models.CASCADE
    )

    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    selected_choices = models.ManyToManyField(Choice)


class PasswordResetToken(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="password_reset_tokens"
    )
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=30)

    @staticmethod
    def generate_token():
        return uuid.uuid4().hex

    def __str__(self):
        return f"Reset token for {self.user.username} (used={self.is_used})"


def fileset_upload_path(instance, filename):
    """Lưu file theo cấu trúc: uploads/<username>/<filename>"""
    return f"uploads/{instance.uploaded_by.username}/{filename}"


class FileSet(models.Model):
    """Model quản lý tập tin do người dùng tải lên."""

    name = models.CharField(max_length=255, help_text="Tên hiển thị của file")
    file = models.FileField(upload_to=fileset_upload_path, help_text="Đường dẫn lưu file")
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="filesets",
        help_text="Người tải lên",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} (by {self.uploaded_by.username})"
