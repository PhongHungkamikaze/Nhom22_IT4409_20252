from ..models import Attempt
from ..serializers import (
    AttemptSerializer,
)
from rest_framework import viewsets, response
from rest_framework.decorators import action
from ..calculate_score import calculate_score

class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all().prefetch_related("answers")
    serializer_class = AttemptSerializer

    @action(detail=True, methods=["post"], url_path="submit")
    def submit(self, request, pk=None):
        attempt = self.get_object()
        attempt.score = calculate_score(attempt)
        attempt.status = "completed"
        attempt.save()
        return response.Response({"score": attempt.score})