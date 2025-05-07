import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";

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
      const res = await api.get(`/api/communities/slug/${slug}/`)
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
    api.delete(`/api/posts/${postId}/`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== postId)))
      .catch(err => console.error(err));
  };

  if (loading) return <p>Loading...</p>;
  if (!community) return <p>Community not found</p>;

  return (
    <div className="community-page" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Navbar />
  
      <h1>{community.name}</h1>
      <p>{community.description}</p>
      <p><strong>Members:</strong> {community.member_count}</p>
  
      {/* ✅ Show New Post Button & Form if user is a member */}
      {community.is_member && (
        <>
          <button onClick={() => setShowPostForm(true)} style={{ marginBottom: '10px' }}>
            + New Post
          </button>
  
          {showPostForm && (
            <PostForm
              onSubmit={handleCreatePost}
              onCancel={() => setShowPostForm(false)}
              categories={["Academic", "Social", "Sports", "Clubs"]}
              defaultCommunity={community.slug} // assuming your backend handles slugs
            />
          )}
        </>
      )}
  
      <h2>Community Feed</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            className="post-card"
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px'
            }}
          >
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              By {post.author} on {new Date(post.created_at).toLocaleString()}
            </p>
            {community.user_role === 'admin' && (
              <button onClick={() => handleDeletePost(post.id)}>Delete</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CommunityPage;