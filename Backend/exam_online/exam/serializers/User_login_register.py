from django.contrib.auth import authenticate
from rest_framework import serializers
from ..models import Question, Quiz, Choice, User


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(
        choices=User.UserRole.choices, default=User.UserRole.Player
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)  # băm password
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Tên đăng nhập hoặc mật khẩu không đúng.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "password"]
        extra_kwargs = {"password": {"write_only": True}}

