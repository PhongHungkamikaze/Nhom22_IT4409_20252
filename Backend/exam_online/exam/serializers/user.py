from rest_framework import serializers
from ..models import User, UserRole
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "role", "password"]
        extra_kwargs = {"password": {"write_only": True}}


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.Student)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer để thêm thông tin user vào response khi login"""

    def validate(self, attrs):
        # Gọi hàm validate của class cha để lấy tokens
        data = super().validate(attrs)

        # Thêm thông tin user vào response
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "role": self.user.role,  # Thông tin role mới (student/teacher/admin)
        }

        return data
