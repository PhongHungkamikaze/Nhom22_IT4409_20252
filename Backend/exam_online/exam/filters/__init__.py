from django_filters import BaseInFilter, NumberFilter


class NumberInFilter(BaseInFilter, NumberFilter):
    pass


from .quiz import QuizFilter  # noqa: E402
from .question import QuestionFilter  # noqa: E402
from .attempt import AttemptFilter  # noqa: E402
from .answer import AnswerFilter  # noqa: E402
from .notification import NotificationFilter  # noqa: E402
from .user import UserFilter  # noqa: E402
from .subject import SubjectFilter  # noqa: E402

__all__ = [
    "NumberInFilter",
    "QuizFilter",
    "QuestionFilter",
    "AttemptFilter",
    "AnswerFilter",
    "NotificationFilter",
    "UserFilter",
    "SubjectFilter",
]
