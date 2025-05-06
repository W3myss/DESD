from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer, ProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from rest_framework import status
from rest_framework.response import Response
from .models import Profile


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
        user = self.request.user
        return Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)