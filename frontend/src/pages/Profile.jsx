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
    bio: "",
    course: "",
    year: "",
    interests: "",
    achievements: ""
  });
  const [userCommunities, setUserCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch current user data first to determine if we're viewing our own profile
        let currentUsername = "";
        try {
          const currentUserRes = await api.get("/api/profile/");
          currentUsername = currentUserRes.data.username;
          setIsCurrentUser(!username || currentUsername === username);
        } catch (authError) {
          console.error("Error fetching current user:", authError);
          setIsCurrentUser(false);
        }

        // Fetch profile data
        const endpoint = username ? `/api/profiles/${username}/` : '/api/profile/';
        const profileRes = await api.get(endpoint);
        setProfile(profileRes.data);
        setFormData({
          bio: profileRes.data.bio || "",
          course: profileRes.data.course || "",
          year: profileRes.data.year || "",
          interests: profileRes.data.interests || "",
          achievements: profileRes.data.achievements || ""
        });

        // Determine which username to use for fetching related data
        const targetUsername = username || currentUsername;

        // Fetch user's created communities if this is the current user
        if (isCurrentUser) {
          const createdRes = await api.get(`/api/communities/?created_by=${targetUsername}`);
          setUserCommunities(createdRes.data);
        }

        // Fetch user's joined communities
        const joinedRes = await api.get(`/api/communities/?membership=joined&user=${targetUsername}`);
        setJoinedCommunities(joinedRes.data);

        // Fetch user's posts
        const postsRes = await api.get(`/api/notes/?author=${targetUsername}`);
        setUserPosts(postsRes.data);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.detail || err.message || 'Error loading profile');
        if (err.response?.status === 404) {
          navigate("/profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate, isCurrentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (formData.year && (isNaN(formData.year) || formData.year < 1 || formData.year > 6)) {
        alert("Please enter a valid year (1-6)");
        return;
      }
      
      await api.patch("/api/profile/", formData);
      setIsEditing(false);
      // Refresh the profile data
      const res = await api.get("/api/profile/");
      setProfile(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!profile) return <div className="loading-spinner">Loading...</div>;

  // Check if profile is incomplete (all fields are null)
  const isProfileIncomplete = !profile.bio && !profile.course && !profile.year && 
                            !profile.interests && !profile.achievements;

  return (
    <div className="main-content">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>Welcome, {profile.username}!</h1>
          {isCurrentUser && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="edit-profile-btn"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        {isCurrentUser && isProfileIncomplete && !isEditing && (
          <div className="empty-state">
            <h3>Your profile is incomplete</h3>
            <p>Please complete your profile to share more about yourself with the community.</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-profile-btn"
            >
              Complete Profile
            </button>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength="500"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="form-group">
              <label>Course:</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                maxLength="100"
                placeholder="What are you studying?"
              />
            </div>
            <div className="form-group">
              <label>Year:</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1"
                max="6"
                placeholder="Current year of study (1-6)"
              />
            </div>
            <div className="form-group">
              <label>Interests:</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                maxLength="300"
                placeholder="Your hobbies and interests..."
              />
            </div>
            <div className="form-group">
              <label>Achievements:</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                maxLength="300"
                placeholder="Any notable achievements..."
              />
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        ) : (
          !isProfileIncomplete && (
            <div className="profile-info">
              {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
              {profile.course && <p><strong>Course:</strong> {profile.course}</p>}
              {profile.year && <p><strong>Year:</strong> {profile.year}</p>}
              {profile.interests && <p><strong>Interests:</strong> {profile.interests}</p>}
              {profile.achievements && <p><strong>Achievements:</strong> {profile.achievements}</p>}
            </div>
          )
        )}

        {/* Rest of the component remains the same */}
        {isCurrentUser && userCommunities.length > 0 && (
          <div className="profile-section">
            <h2>My Communities</h2>
            <div className="communities-grid">
              {userCommunities.map(community => (
                <CommunityCard 
                  key={community.id}
                  community={community}
                  showDelete={true}
                />
              ))}
            </div>
          </div>
        )}

        {joinedCommunities.length > 0 && (
          <div className="profile-section">
            <h2>Joined Communities</h2>
            <div className="communities-grid">
              {joinedCommunities.map(community => (
                <CommunityCard 
                  key={community.id}
                  community={community}
                />
              ))}
            </div>
          </div>
        )}

        {userPosts.length > 0 && (
          <div className="profile-section">
            <h2>Recent Posts</h2>
            <div className="posts-list">
              {userPosts.slice(0, 5).map(post => (
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