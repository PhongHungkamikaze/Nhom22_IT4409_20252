from django.contrib import admin
from .models import Quiz, User, Question, Choice, Attempt, Answer, Subject


# Register your models here.
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["id", "title"]


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    pass


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    pass


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    pass


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    pass


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    pass
