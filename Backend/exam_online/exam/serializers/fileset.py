# exam_online/exam/serializers/fileset.py

from rest_framework import serializers
from ..models import FileSet


class FileSetSerializer(serializers.ModelSerializer):
    """
    Serializer cho model FileSet.

    - `uploaded_by` được tự động gán từ request.user (read-only).
    - `file_url` cung cấp URL tuyệt đối để client tải file về.
    """

    # Trường ảo trả về URL đầy đủ của file (không bao gồm trong input)
    file_url = serializers.SerializerMethodField(read_only=True)

    # Hiển thị username thay vì ID khi đọc
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FileSet
        fields = ["id", "name", "file", "file_url", "uploaded_by", "created_at"]
        read_only_fields = ["id", "uploaded_by", "created_at", "file_url"]
        extra_kwargs = {
            # Trường `file` là write-only khi tạo; client đọc qua `file_url`
            "file": {"write_only": True},
        }

    def get_file_url(self, obj):
        """Trả về URL tuyệt đối của file dựa trên request context."""
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def create(self, validated_data):
        # Gán người upload từ request.user được truyền qua context
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)
