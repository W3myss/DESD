import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Profile.css";
import Navbar from "../components/Navbar";
import Note from "../components/Note";
import CommunityCard from "../components/CommunityCard";

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    university_email: "",
    address: "",
    dob: "",
    course: "",
    interests: "",
    bio: "",
    achievements: ""
  });
  const [userCommunities, setUserCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user data first
        let currentUsername = "";
        try {
          const currentUserRes = await api.get("/api/profile/");
          currentUsername = currentUserRes.data.username;
          setIsCurrentUser(!username || currentUsername === username);
        } catch (authError) {
          setIsCurrentUser(false);
        }

        const endpoint = username ? `/api/profiles/${username}/` : "/api/profile/";
        const profileRes = await api.get(endpoint);
        setProfile(profileRes.data);
        setProfilePicPreview(profileRes.data.profile_pic || null);
        setFormData({
          university_email: profileRes.data.university_email || "",
          address: profileRes.data.address || "",
          dob: profileRes.data.dob || "",
          course: profileRes.data.course || "",
          interests: profileRes.data.interests || "",
          bio: profileRes.data.bio || "",
          achievements: profileRes.data.achievements || ""
        });

        const targetUsername = username || profileRes.data.username;

        // Fetch user's created communities if this is the current user
        if (!username || currentUsername === username) {
          const createdRes = await api.get(`/api/communities/?created_by=${targetUsername}`);
          setUserCommunities(createdRes.data);
        }

        // Fetch ALL joined communities for the profile being viewed
        const joinedRes = await api.get(`/api/communities/?membership=joined&user=${targetUsername}`);
        setJoinedCommunities(joinedRes.data);

        // Fetch user's posts
        const postsRes = await api.get(`/api/notes/?author=${targetUsername}`);
        setUserPosts(postsRes.data);

        if (isCurrentUser) {
          const requestsRes = await api.get("/api/friend-requests/");
          setFriendRequests(requestsRes.data);
        }

        const friendsRes = await api.get(`/api/friends/?user=${targetUsername}`);
        setFriends(friendsRes.data);

      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Error loading profile");
        if (err.response?.status === 404) {
          navigate("/profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate, isCurrentUser]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Only append profile pic if it exists (now optional)
      if (profilePic) {
        formDataToSend.append('profile_pic', profilePic);
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      await api.patch("/api/profile/", formDataToSend, config);
      setIsEditing(false);
      const res = await api.get("/api/profile/");
      setProfile(res.data);
      setProfilePicPreview(res.data.profile_pic || null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRespondToRequest = async (id, action) => {
    try {
      await api.patch(`/api/friend-requests/${id}/`, { action });
      setFriendRequests((prev) => prev.filter((req) => req.id !== id));
      if (action === "accept") {
        const friendsRes = await api.get(`/api/friends/?user=${username || profile.username}`);
        setFriends(friendsRes.data);
      }
    } catch (err) {
      console.error("Error responding to friend request:", err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      await api.delete(`/api/friends/${friendId}/remove/`);
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      alert("Friend removed successfully.");
    } catch (err) {
      console.error("Error removing friend:", err);
      alert("Failed to remove friend.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!profile) return <div className="loading-spinner">Loading...</div>;

  const isProfileIncomplete = !profile.university_email && !profile.address && 
    !profile.dob && !profile.course && !profile.interests;

  return (
    <div className="main-content">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-pic-container">
            {profilePicPreview ? (
              <img 
                src={profilePicPreview} 
                alt="Profile" 
                className="profile-pic"
              />
            ) : (
              <div className="profile-pic-placeholder">
                {profile?.username?.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <div className="profile-pic-actions">
                <label className="upload-btn">
                  {profilePicPreview ? "Change Photo" : "Add Photo"}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePicChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {profilePicPreview && (
                  <button 
                    type="button" 
                    className="remove-btn"
                    onClick={handleRemoveProfilePic}
                  >
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="profile-header-right">
            <h1>{profile?.username}'s Profile</h1>
            {isCurrentUser && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="edit-profile-btn"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>
        </div>

        {isCurrentUser && isProfileIncomplete && !isEditing && (
          <div className="empty-state">
            <h3>Your profile is incomplete</h3>
            <p>Please complete your profile to share more about yourself with the community.</p>
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
              Complete Profile
            </button>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>University Email:</label>
              <input
                type="email"
                name="university_email"
                value={formData.university_email}
                onChange={handleChange}
                placeholder="Your university email address"
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your current address"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth:</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Course:</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="What are you studying?"
              />
            </div>
            <div className="form-group">
              <label>Interests:</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Your hobbies and interests..."
              />
            </div>
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="form-group">
              <label>Achievements:</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                placeholder="Any notable achievements..."
              />
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
        ) : (
          !isProfileIncomplete && (
            <div className="profile-info">
              {profile.university_email && (
                <p>
                  <strong>University Email:</strong> {profile.university_email}
                </p>
              )}
              {profile.address && (
                <p>
                  <strong>Address:</strong> {profile.address}
                </p>
              )}
              {profile.dob && (
                <p>
                  <strong>Date of Birth:</strong> {new Date(profile.dob).toLocaleDateString()}
                </p>
              )}
              {profile.course && (
                <p>
                  <strong>Course:</strong> {profile.course}
                </p>
              )}
              {profile.interests && (
                <p>
                  <strong>Interests:</strong> {profile.interests}
                </p>
              )}
              {profile.bio && (
                <p>
                  <strong>Bio:</strong> {profile.bio}
                </p>
              )}
              {profile.achievements && (
                <p>
                  <strong>Achievements:</strong> {profile.achievements}
                </p>
              )}
            </div>
          )
        )}

        {isCurrentUser && friendRequests.length > 0 && (
          <div className="profile-section">
            <h2>Friend Requests</h2>
            {friendRequests.map((req) => (
              <div key={req.id} className="friend-request">
                <p>{req.sender} sent you a friend request.</p>
                <button onClick={() => handleRespondToRequest(req.id, "accept")}>Accept</button>
                <button onClick={() => handleRespondToRequest(req.id, "decline")}>Decline</button>
              </div>
            ))}
          </div>
        )}

        {friends.length > 0 && (
          <div className="profile-section">
            <h2>Friends</h2>
            <ul>
              {friends.map((friend) => (
                <li key={friend.id}>
                  {friend.username}
                  {isCurrentUser && (
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="remove-friend-btn"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}


        {joinedCommunities.length > 0 && (
          <div className="profile-section">
            <h2>{isCurrentUser ? "Your Communities" : `${profile.username}'s Communities`}</h2>
            <div className="communities-grid">
              {joinedCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>
        )}

        {userPosts.length > 0 && (
          <div className="profile-section">
            <h2>Recent Posts</h2>
            <div className="posts-list">
              {userPosts.slice(0, 5).map((post) => (
                <Note key={post.id} note={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;