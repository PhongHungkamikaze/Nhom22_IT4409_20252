from rest_framework import serializers
from ..models import User, PasswordResetToken


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


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            self._user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại trong hệ thống.")
        return value

    def save(self):
        user = self._user
        # Xóa token cũ chưa dùng để tránh trùng lặp
        PasswordResetToken.objects.filter(user=user, is_used=False).delete()
        # Tạo token mới
        token = PasswordResetToken.objects.create(
            user=user,
            token=PasswordResetToken.generate_token(),
        )
        return token


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_token(self, value):
        try:
            reset_token = PasswordResetToken.objects.get(token=value)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Token không hợp lệ.")

        if reset_token.is_used:
            raise serializers.ValidationError("Token đã được sử dụng.")

        if reset_token.is_expired():
            raise serializers.ValidationError("Token đã hết hạn (quá 30 phút).")

        self._reset_token = reset_token
        return value

    def save(self):
        reset_token = self._reset_token
        user = reset_token.user
        user.set_password(self.validated_data["new_password"])
        user.save()
        # Vô hiệu hóa token để không dùng lại được
        reset_token.is_used = True
        reset_token.save()
        return user
