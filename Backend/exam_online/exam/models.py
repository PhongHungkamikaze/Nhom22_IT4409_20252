import uuid
from datetime import timedelta
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

from django.db.models import DateTimeField, Model


class BaseModel(Model):
    created_at = DateTimeField(auto_now_add=True, db_index=True)
    updated_at = DateTimeField(auto_now=True, db_index=True)

    class Meta:
        abstract = True


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


class Subject(BaseModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Quiz(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
    )
    subject = models.ForeignKey(Subject, on_delete=models.SET_NULL, null=True)
    time_limit = models.IntegerField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    questions = models.ManyToManyField(
        "Question",
        related_name="quizzes",
        blank=True,
    )
    max_attempts = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)


class Question(BaseModel):
    class TypeQuestion(models.TextChoices):
        Multiple = "multiple", "Multiple choice"
        Single = "single", "Single choice"

    type = models.CharField(
        max_length=20, choices=TypeQuestion.choices, default=TypeQuestion.Single
    )
    content = models.TextField()
    author = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
    )


class Choice(BaseModel):
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


class Attempt(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    status = models.CharField(
        max_length=20, choices=StatusChoices.choices, default=StatusChoices.Ready
    )
    started_at = models.DateTimeField(auto_now_add=True)


class Answer(BaseModel):
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


class NotificationType(models.TextChoices):
    GENERIC = "GENERIC", "Generic"
    # Exam related
    EXAM_VIOLATION = "EXAM_VIOLATION", "Exam Violation"
    QUIZ_PUBLISHED = "QUIZ_PUBLISHED", "Quiz Published"
    QUIZ_UPCOMING = "QUIZ_UPCOMING", "Quiz Upcoming"
    ATTEMPT_START = "ATTEMPT_START", "Attempt Started"
    ATTEMPT_SUBMITTED = "ATTEMPT_SUBMITTED", "Attempt Submitted"
    # Results
    SCORE_RELEASED = "SCORE_RELEASED", "Score Released"
    # Account & Communications
    SYSTEM_ALERT = "SYSTEM_ALERT", "System Alert"
    PASSWORD_RESET = "PASSWORD_RESET", "Password Reset"


class NotificationManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class Notification(BaseModel):
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="triggered_notifications",
        null=True,
        blank=True,
    )
    type = models.CharField(
        max_length=64,
        choices=NotificationType.choices,
        default=NotificationType.GENERIC,
        db_index=True,
    )
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    data = models.JSONField(default=dict, blank=True)

    read_at = models.DateTimeField(null=True, blank=True, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    firebase_message_id = models.CharField(max_length=255, blank=True, default="")
    delivery_error = models.TextField(blank=True, default="")

    objects = NotificationManager()
    all_objects = models.Manager()

    class Meta:
        ordering = ["-id"]
        indexes = [
            models.Index(fields=["recipient", "-id"]),
            models.Index(fields=["recipient", "read_at"]),
        ]

    @property
    def is_read(self) -> bool:
        return self.read_at is not None

    def __str__(self):
        return f"{self.recipient.username} - {self.title} ({self.type})"
