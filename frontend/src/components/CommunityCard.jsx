import { Link } from "react-router-dom";




function CommunityCard({ community, onJoin, onLeave, onDelete }) {
  console.log("SLUG IS:", community.slug);
  const handleAction = (e) => {
    e.stopPropagation(); // Prevents <Link> from firing
    if (community.is_member) {
      onLeave(community.id);
    } else {
      onJoin(community.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevents <Link> from firing
    onDelete(community.id);
  };

  return (
    <Link
      to={`/communities/${community.slug}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        backgroundColor: "#f9f9f9",
        border: "2px solid red",
        padding: "10px",
        marginBottom: "10px"
      }}
  onClick={() => console.log("Link click triggered!")}
>
      <div className="community-card">
        <div className="community-header">
          <h3>{community.name}</h3>
          <span className="community-category">{community.category}</span>
        </div>
        
        <p className="community-description">{community.description}</p>
        
        <div className="community-meta">
          <span>Created by: {community.created_by}</span>
          <span>Members: {community.member_count}</span>
        </div>
        
        <div className="community-actions">
          <button 
            className={`action-btn ${community.is_member ? 'leave' : 'join'}`}
            onClick={handleAction}
          >
            {community.is_member ? 'Leave' : 'Join'}
          </button>
          
          {community.user_role === 'admin' && (
            <button 
              className="action-btn delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CommunityCard;