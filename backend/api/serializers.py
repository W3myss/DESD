from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author", "category", "community"]
        extra_kwargs = {
            "author": {"read_only": True},
        }

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'bio', 'course', 'year', 'interests', 'achievements', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']