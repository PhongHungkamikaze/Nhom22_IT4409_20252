from django.contrib import admin
from .models import Quiz, User, Question, Choice, Attempt, Answer


# Register your models here.
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    pass


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
