from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, mixins, permissions, response, status, viewsets
from rest_framework.decorators import action

from ..filters import NotificationFilter
from ..models import Notification
from ..serializers import (
    MarkBulkSerializer,
    NotificationListSerializer,
    NotificationSerializer,
)


@extend_schema(tags=["Notifications: Notification"])
class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    ordering_fields = ["id", "created_at", "read_at"]
    ordering = ["-created_at"]
    search_fields = ["title", "content"]

    @property
    def filterset_class(self):
        return NotificationFilter

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def get_serializer_class(self):
        if self.action == "list":
            return NotificationListSerializer
        if self.action in ("mark_as_read", "mark_as_deleted"):
            return MarkBulkSerializer
        return NotificationSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.deleted_at = timezone.now()
        instance.save(update_fields=["deleted_at"])
        return response.Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(responses={200: None})
    @action(detail=False, methods=["post"], url_path="mark-as-read")
    def mark_as_read(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data.get("ids") or []
        if not ids:
            return response.Response({"updated": 0})
        updated = (
            self.get_queryset()
            .filter(id__in=ids, read_at__isnull=True)
            .update(read_at=timezone.now())
        )
        return response.Response({"updated": updated})

    @extend_schema(responses={200: None})
    @action(detail=False, methods=["post"], url_path="mark-as-deleted")
    def mark_as_deleted(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data.get("ids") or []
        if not ids:
            return response.Response({"updated": 0})
        updated = (
            self.get_queryset().filter(id__in=ids).update(deleted_at=timezone.now())
        )
        return response.Response({"updated": updated})

    @extend_schema(responses={200: None})
    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(read_at__isnull=True).count()
        return response.Response({"count": count})
