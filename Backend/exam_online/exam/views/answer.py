from ..models import Answer
from ..serializers import AnswerSerializers
from ..filters import AnswerFilter
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all().select_related("attempt", "question").prefetch_related("selected_choices")
    serializer_class = AnswerSerializers

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ['question__content', 'attempt__user__username']

    @property
    def filterset_class(self):
        return AnswerFilter
