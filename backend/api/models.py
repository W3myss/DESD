from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('social', 'Social'),
        ('sports', 'Sports'),
        ('clubs', 'Clubs'),
    ]
    
    COMMUNITY_CHOICES = [
        ('cs101', 'CS101'),
        ('drama_club', 'Drama Club'),
        ('football_team', 'Football Team'),
        ('debate_society', 'Debate Society'),
    ]
    
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='academic')
    community = models.CharField(max_length=20, choices=COMMUNITY_CHOICES, default='cs101')

    def __str__(self):
        return self.title
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    bio = models.TextField(blank=True, null=True)
    course = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    interests = models.TextField(blank=True, null=True)
    achievements = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"