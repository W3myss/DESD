import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";
import "../styles/CommunityPage.css"; // Create this file if it doesn't exist

function CommunityPage() {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchCommunityDetails();
  }, [slug]);


  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/communities/slug/${slug}/`);
      setCommunity(res.data);
      const postsRes = await api.get(`/api/communities/slug/${slug}/posts/`);
      setPosts(postsRes.data);
  
      // Use res.data.id directly here instead of community.id
      fetchCommunityMembers(res.data.id);
    } catch (err) {
      console.error("Error fetching community:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityMembers = async (communityId) => {
    try {
      const res = await api.get(`/api/communities/${communityId}/members/`);
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const promoteToModerator = async (membershipId) => {
    try {
      await api.patch(`/api/memberships/${membershipId}/`, { role: 'moderator' });
      fetchCommunityMembers(community.id); // Refresh after promotion
    } catch (err) {
      console.error("Failed to promote member:", err);
      alert("Failed to promote member.");
    }
  };

  const handleCreatePost = (postData) => {
    api.post("/api/notes/", postData)
      .then(res => {
        setPosts(prev => [res.data, ...prev]);
        setShowPostForm(false);
      })
      .catch(err => {
        console.error("Post creation failed:", err);
        alert("Failed to create post.");
      });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    api.delete(`/api/notes/delete/${postId}/`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== postId)))
      .catch(err => console.error(err));
  };

  if (loading) return <p>Loading...</p>;
  if (!community) return <p>Community not found</p>;

  return (
    <div className="community-page-container">
      <Navbar />
  
      <div className="community-header">
        <h1>{community.name}</h1>
        <p className="community-description">{community.description}</p>
        <p><strong>Members:</strong> {community.member_count}</p>
      </div>
  
      {community.tags && community.tags.length > 0 && (
        <div className="community-tags" style={{ marginTop: '10px', marginBottom: '20px' }}>
          <strong>Tags:</strong>
          {community.tags.map((tag, index) => (
            <span key={index} style={{
              display: 'inline-block',
              backgroundColor: '#eee',
              padding: '4px 8px',
              borderRadius: '12px',
              margin: '0 5px',
              fontSize: '0.8em'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
  
      {community.is_member && (
        <div className="post-actions">
          <button className="create-post-btn" onClick={() => setShowPostForm(true)}>
            + New Post
          </button>
          {showPostForm && (
            <PostForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowPostForm(false)}
              categories={["Academic", "Social", "Sports", "Clubs"]}
              defaultCommunity={community.slug}
            />
          )}
        </div>
      )}
  
      {(community.user_role === 'admin' || community.is_global_admin) && (
        <div className="member-list" style={{ marginTop: '2rem' }}>
          <h3>Community Members</h3>
          {members.length === 0 ? (
            <p>No members yet.</p>
          ) : (
            members.map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0'
                }}
              >
                <span>{member.user} — <strong>{member.role}</strong></span>
                {member.role !== 'moderator' && (
                  <button
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.9em',
                      backgroundColor: '#e0e0e0',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                    onClick={() => promoteToModerator(member.id)}
                  >
                    Make Moderator
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
  
      <h2 className="feed-heading">Community Feed</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            {(community.user_role === 'admin' || community.is_global_admin || community.user_role === 'moderator') && (
              <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
} 

export default CommunityPage;