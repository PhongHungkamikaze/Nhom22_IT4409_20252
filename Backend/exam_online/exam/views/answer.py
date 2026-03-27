from ..models import Answer
from ..serializers import (
    AnswerSerializers,
)
from rest_framework import viewsets
class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializers