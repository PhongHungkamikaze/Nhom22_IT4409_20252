from ..models import Answer
from ..serializers import AnswerSerializers
from ..filters import AnswerFilter
from rest_framework import viewsets


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all().select_related("attempt", "question").prefetch_related("selected_choices")
    serializer_class = AnswerSerializers

    @property
    def filterset_class(self):
        return AnswerFilter
