from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from exam.permissions import PermissionMixin


class BaseViewSet(PermissionMixin, viewsets.ModelViewSet):
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    ordering = ["id"]
