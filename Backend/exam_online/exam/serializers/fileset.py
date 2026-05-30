from rest_framework import serializers
from exam.models import FileSet


class FileSetSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = FileSet
        fields = ["id", "name", "file", "subject", "uploaded_by", "created_at", "updated_at"]
        read_only_fields = ["uploaded_by", "created_at", "updated_at"]


class FileSetCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = FileSet
        fields = ["name", "file", "subject"]
