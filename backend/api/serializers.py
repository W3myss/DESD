from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import Profile
from .models import Community
from .models import Membership
from .models import Event
from .models import FriendRequest
from .models import Tag


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
    community = serializers.SlugRelatedField(
        slug_field='slug',
        queryset=Community.objects.all()
    )
    
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
        fields = [
            'id', 'username', 'university_email', 'address', 'dob', 
            'course', 'interests', 'bio', 'achievements', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']


class CommunitySerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    tags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    is_global_admin = serializers.SerializerMethodField()
    
    class Meta:
        model = Community
        fields = ['id', 'name', 'slug', 'description', 'category', 'created_by', 'created_at', 
                 'member_count', 'is_member', 'user_role','tags', 'is_global_admin']   
        read_only_fields = ['id', 'created_by', 'created_at']
    

    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(user=request.user).exists()
        return False
    
    def get_is_global_admin(self, obj):
        request = self.context.get('request')
        return request.user.is_superuser if request and request.user else False
    
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
    tags = serializers.ListField(
        child=serializers.CharField(), required=False
    )

    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'category', 'tags']
        read_only_fields = ['id']

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        community = Community.objects.create(
            created_by=self.context['request'].user,
            **validated_data
        )

        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            community.tags.add(tag)

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
        fields = ['id', 'title', 'description', 'date', 'time', 'event_type', 'created_by']
        read_only_fields = ['id', 'created_by']

class FriendRequestSerializer(serializers.ModelSerializer):
    sender = serializers.ReadOnlyField(source='sender.username')
    receiver = serializers.ReadOnlyField(source='receiver.username')

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender', 'receiver', 'status', 'created_at']