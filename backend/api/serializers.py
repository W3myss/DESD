from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import Profile
from .models import Community
from .models import Membership
from .models import Event


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

class CommunitySerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'category', 'created_by', 'created_at', 
                 'member_count', 'is_member', 'user_role']
        read_only_fields = ['id', 'created_by', 'created_at']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user).exists()
        return False
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = obj.members.filter(user=request.user).first()
            return membership.role if membership else None
        return None

class MembershipSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    community = serializers.ReadOnlyField(source='community.name')
    
    class Meta:
        model = Membership
        fields = ['id', 'user', 'community', 'role', 'joined_at']
        read_only_fields = ['id', 'user', 'community', 'joined_at']

class CreateCommunitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'category']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        community = Community.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )
        # Make creator an admin
        Membership.objects.create(
            user=self.context['request'].user,
            community=community,
            role='admin'
        )
        return community

from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'location', 'virtual_link', 'event_type', 'created_at', 'created_by']
        read_only_fields = ['created_by']