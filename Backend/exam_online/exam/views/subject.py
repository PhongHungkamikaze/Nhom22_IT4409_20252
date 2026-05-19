from rest_framework import viewsets, permissions
from drf_spectacular.utils import extend_schema
from ..models import Subject
from ..serializers import SubjectSerializer


@extend_schema(tags=["Subjects: Subject"])
class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by("name")
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
