from rest_framework import viewsets, permissions, filters
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Subject
from ..serializers import SubjectSerializer
from ..filters import SubjectFilter

@extend_schema(tags=["Subjects: Subject"])
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    search_fields = ["name"]
    ordering_fields = ["id", "name"]
    ordering = ["name"]
    filterset_class = SubjectFilter

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
