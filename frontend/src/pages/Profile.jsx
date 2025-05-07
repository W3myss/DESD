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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching profile for username:', username);
        
        const endpoint = username ? `/api/profiles/${username}/` : '/api/profile/';
        const res = await api.get(endpoint);
        
        console.log('API response:', res.data);
        setProfile(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Error loading profile');
      } finally {
        console.log('Finished loading');
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Fetch profile data
      const profileRes = await api.get(`/api/profiles/${username}/`);
      setProfile(profileRes.data);
      setFormData(profileRes.data);
      
      // Check if this is the current user's profile
      const currentUserRes = await api.get("/api/auth/user/");
      setIsCurrentUser(currentUserRes.data.username === username);
      
      // Fetch user's created communities
      const createdRes = await api.get(`/api/communities/?created_by=${username}`);
      setUserCommunities(createdRes.data);
      
      // Fetch user's joined communities
      const joinedRes = await api.get(`/api/communities/?membership=joined&user=${username}`);
      setJoinedCommunities(joinedRes.data);
      
      // Fetch user's posts
      const postsRes = await api.get(`/api/notes/?author=${username}`);
      setUserPosts(postsRes.data);
    } catch (err) {
      console.error(err);
      navigate("/profile"); // Redirect to own profile if not found
    }
  };

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
      fetchProfile(); // Refresh data
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

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>Error: {error}</div>; // Show error state

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="main-content">
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h1>{username}'s Profile</h1>
          {isCurrentUser && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="edit-profile-btn"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                maxLength="500"
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
              />
            </div>
            <div className="form-group">
              <label>Interests:</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                maxLength="300"
              />
            </div>
            <div className="form-group">
              <label>Achievements:</label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                maxLength="300"
              />
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        ) : (
          <div className="profile-info">
            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
            {profile.course && <p><strong>Course:</strong> {profile.course}</p>}
            {profile.year && <p><strong>Year:</strong> {profile.year}</p>}
            {profile.interests && <p><strong>Interests:</strong> {profile.interests}</p>}
            {profile.achievements && <p><strong>Achievements:</strong> {profile.achievements}</p>}
          </div>
        )}

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