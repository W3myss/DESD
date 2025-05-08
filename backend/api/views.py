from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, views
from .serializers import UserSerializer, NoteSerializer, ProfileSerializer, CommunitySerializer, MembershipSerializer, CreateCommunitySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, Community, Membership, Profile
from rest_framework import status, filters
from rest_framework.response import Response
from django.db import models
from rest_framework.exceptions import PermissionDenied
from rest_framework import permissions
from .models import Event
from .serializers import EventSerializer
from django.http import JsonResponse
from django.db.models import Q
from .models import User
from .models import FriendRequest
from .serializers import FriendRequestSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser



class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'community']
    ordering_fields = ['created_at']

    def get_queryset(self):
        queryset = Note.objects.all()
        
        # Apply filters if provided
        category = self.request.query_params.get('category')
        community = self.request.query_params.get('community')
        
        if category:
            queryset = queryset.filter(category=category)
        if community:
            queryset = queryset.filter(community=community)
            
        # Apply ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering in self.ordering_fields:
            queryset = queryset.order_by(ordering)
            
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.all()

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.author == user:
            instance.delete()
        else:
            membership = Membership.objects.filter(user=user, community__name=instance.community).first()
            if membership and membership.role in ['moderator', 'admin']:
                instance.delete()
            else:
                raise PermissionDenied("You do not have permission to delete this post.")


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_queryset(self):
        queryset = Community.objects.annotate(
            member_count=models.Count('members')
        )
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by membership status if provided
        membership = self.request.query_params.get('membership')
        user_filter = self.request.query_params.get('user')
        
        if membership and user_filter:
            try:
                user = User.objects.get(username=user_filter)
                if membership == 'joined':
                    queryset = queryset.filter(members__user=user)
                elif membership == 'not_joined':
                    queryset = queryset.exclude(members__user=user)
            except User.DoesNotExist:
                pass
        
        return queryset

    def get_object(self):
        if 'username' in self.kwargs:
            username = self.kwargs['username']
            return get_object_or_404(Profile, user__username=username)
        else:
            profile, created = Profile.objects.get_or_create(user=self.request.user)
            return profile

    def perform_update(self, serializer):
        # Handle file deletion if needed
        if 'profile_pic' in self.request.data and self.request.data['profile_pic'] == 'null':
            instance = self.get_object()
            if instance.profile_pic:
                instance.profile_pic.delete()
        serializer.save()
    
class CommunityListCreate(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category', 'tags__name']
    ordering_fields = ['name', 'created_at', 'member_count']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateCommunitySerializer
        return CommunitySerializer
    
    def get_queryset(self):
        queryset = Community.objects.annotate(
            member_count=models.Count('members')
        )
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by membership status if provided
        membership = self.request.query_params.get('membership')
        user_filter = self.request.query_params.get('user')
        
        if membership and user_filter:
            try:
                user = User.objects.get(username=user_filter)
                if membership == 'joined':
                    queryset = queryset.filter(members__user=user)
                elif membership == 'not_joined':
                    queryset = queryset.exclude(members__user=user)
            except User.DoesNotExist:
                pass
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Return the full community data including calculated fields
        community = Community.objects.get(id=serializer.data['id'])
        response_serializer = CommunitySerializer(community, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CommunityDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_destroy(self, instance):
        user = self.request.user
        is_admin_member = instance.members.filter(user=user, role='admin').exists()
    
        if not is_admin_member and not user.is_superuser:
            raise PermissionDenied("Only community admins or global admins can delete the community.")

        instance.delete()

class MembershipView(generics.CreateAPIView, generics.DestroyAPIView):
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Membership.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        try:
            community = Community.objects.get(id=kwargs.get('pk'))
        except Community.DoesNotExist:
            return Response(
                {"detail": "Community not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already a member
        if Membership.objects.filter(user=request.user, community=community).exists():
            return Response(
                {"detail": "You are already a member of this community."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create membership with default 'member' role
        membership = Membership.objects.create(
            user=request.user,
            community=community,
            role='member'
        )
        
        # Return the updated community data
        community_serializer = CommunitySerializer(community, context={'request': request})
        return Response(community_serializer.data, status=status.HTTP_201_CREATED)

    
    def destroy(self, request, *args, **kwargs):
        community_id = kwargs.get('pk')
        try:
            membership = Membership.objects.get(
                user=request.user,
                community_id=community_id
            )
        except Membership.DoesNotExist:
            return Response(
                {"detail": "You are not a member of this community."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent admins from leaving (must transfer admin first)
        if membership.role == 'admin':
            other_admins = Membership.objects.filter(
                community=membership.community,
                role='admin'
            ).exclude(user=request.user).exists()
            if not other_admins:
                return Response(
                    {"detail": "You are the only admin. Assign another admin before leaving."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
        
class CommunityDetailBySlug(generics.RetrieveAPIView):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    lookup_field = 'slug'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CommunityPostsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        community = get_object_or_404(Community, slug=slug)
        notes = Note.objects.filter(community=community)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def perform_destroy(self, instance):
        if instance.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to delete this event.")
        instance.delete()

from django.http import JsonResponse
from django.db.models import Q
from .models import Profile  # Use Profile instead of User

def search_students(request):
    course = request.GET.get('course', '')
    year = request.GET.get('year', '')  # Keep this if you added the year field
    interests = request.GET.get('interests', '')

    filters = Q()
    if course:
        filters &= Q(course__icontains=course)
    if year:  # Adjust this if using a different field
        filters &= Q(year__icontains=year)
    if interests:
        filters &= Q(interests__icontains=interests)

    try:
        students = Profile.objects.filter(filters).select_related('user')
        student_data = [
            {
                "id": student.user.id,
                "username": student.user.username,
                "course": student.course,
                "year": student.year,  # Adjust this if using a different field
                "interests": student.interests,
            }
            for student in students
        ]
        return JsonResponse(student_data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

class FriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        receiver_id = request.data.get('receiver_id')
        try:
            receiver = User.objects.get(id=receiver_id)
            if FriendRequest.objects.filter(sender=request.user, receiver=receiver, status='pending').exists():
                return Response({"detail": "Friend request already sent."}, status=status.HTTP_400_BAD_REQUEST)
            FriendRequest.objects.create(sender=request.user, receiver=receiver)
            return Response({"detail": "Friend request sent."}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request):
        requests = FriendRequest.objects.filter(receiver=request.user, status='pending')
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def patch(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(id=pk, receiver=request.user)
            action = request.data.get('action')
            if action == 'accept':
                friend_request.status = 'accepted'
                friend_request.save()
                # Add both users to each other's friend lists (if applicable)
                return Response({"detail": "Friend request accepted."})
            elif action == 'decline':
                friend_request.delete()
                return Response({"detail": "Friend request declined."})
            else:
                return Response({"detail": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
        except FriendRequest.DoesNotExist:
            return Response({"detail": "Friend request not found."}, status=status.HTTP_404_NOT_FOUND)

class FriendsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friends = User.objects.filter(
            sent_requests__receiver=user, sent_requests__status="accepted"
        ) | User.objects.filter(
            received_requests__sender=user, received_requests__status="accepted"
        )
        friends_data = [{"id": friend.id, "username": friend.username} for friend in friends]
        return Response(friends_data)

class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            friend = User.objects.get(pk=pk)
            # Remove the friendship (both directions)
            request.user.sent_requests.filter(receiver=friend, status="accepted").delete()
            request.user.received_requests.filter(sender=friend, status="accepted").delete()
            return Response({"detail": "Friend removed successfully."}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"detail": "Friend not found."}, status=status.HTTP_404_NOT_FOUND)
        

class UpdateMembershipRoleView(APIView):
    permission_classes = [IsAdminUser]  # Only superusers can do this

    def post(self, request, *args, **kwargs):
        community_id = kwargs.get('community_id')
        username = request.data.get('username')
        new_role = request.data.get('role')

        if new_role not in ['member', 'moderator', 'admin']:
            return Response({'detail': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            community = Community.objects.get(id=community_id)
            user = User.objects.get(username=username)
            membership = Membership.objects.get(user=user, community=community)
            membership.role = new_role
            membership.save()
            return Response({'detail': f"{username}'s role updated to {new_role}"})
        except (Community.DoesNotExist, User.DoesNotExist, Membership.DoesNotExist):
            return Response({'detail': 'User or community not found'}, status=status.HTTP_404_NOT_FOUND)
        
class MembershipUpdateView(generics.UpdateAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        membership = self.get_object()
        user = self.request.user
        community = membership.community  # Ensure this is fetched

    # Check if user is a global admin
        is_global_admin = user.is_superuser

    # Check if user is admin of the same community
        is_community_admin = Membership.objects.filter(
            community=community,
            user=user,
            role='admin'
        ).exists()

        if not is_global_admin and not is_community_admin:
            raise PermissionDenied("You don't have permission to promote this member.")

        serializer.save()

        
class CommunityMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        community = get_object_or_404(Community, pk=pk)
        members = Membership.objects.filter(community=community)
        serializer = MembershipSerializer(members, many=True)
        return Response(serializer.data)