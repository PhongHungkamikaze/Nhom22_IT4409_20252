from rest_framework import serializers
from ..models import User


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không đúng.")
        return value

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_username(self, value):
        try:
            self._user = User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Người dùng không tồn tại.")
        return value

    def save(self):
        self._user.set_password(self.validated_data["new_password"])
        self._user.save()
        return self._user
