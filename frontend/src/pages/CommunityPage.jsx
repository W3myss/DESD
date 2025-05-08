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
    } catch (err) {
      console.error("Error fetching community:", err);
    } finally {
      setLoading(false);
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
            {(community.user_role === 'admin' || community.is_global_admin) && (
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