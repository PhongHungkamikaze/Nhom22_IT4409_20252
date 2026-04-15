import uuid
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


# Create your models here.
class UserRole(models.TextChoices):
    Student = "student", "Student"
    Teacher = "teacher", "Teacher"
    Admin = "admin", "Admin"


class User(AbstractUser):
    role = models.CharField(
        max_length=20, choices=UserRole.choices, default=UserRole.Student
    )

    def __str__(self):
        return f"{self.username} - {self.role}"


class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Quiz(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    author = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True)
    time_limit = models.IntegerField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    max_attempts = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)


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
    Processing = ("processing", "Processing")
    Completed = "completed", "Completed"


class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)

    score = models.FloatField(default=0)
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.Ready
    )
    started_at = models.DateTimeField(auto_now_add=True)


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
