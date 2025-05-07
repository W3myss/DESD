from django.urls import path
from . import views

urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),
    path("profile/", views.ProfileView.as_view(), name="profile-current"), 
    path("profiles/<str:username>/", views.ProfileView.as_view(), name="profile-detail"),
    path("communities/", views.CommunityListCreate.as_view(), name="community-list"),
    path("communities/<int:pk>/", views.CommunityDetail.as_view(), name="community-detail"),
    path("communities/<int:pk>/join/", views.MembershipView.as_view(), name="join-community"),
    path("communities/<int:pk>/leave/", views.MembershipView.as_view(), name="leave-community"),
]
