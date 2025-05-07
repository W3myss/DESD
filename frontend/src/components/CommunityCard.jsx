import { Link } from "react-router-dom";

function CommunityCard({ community, onJoin, onLeave, onDelete }) {
  const handleAction = () => {
    if (community.is_member) {
      onLeave(community.id);
    } else {
      onJoin(community.id);
    }
  };

  return (
    <div className="community-card">
      <div className="community-header">
        <h3>
          <Link to={`/communities/${community.id}`}>{community.name}</Link>
        </h3>
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
            onClick={() => onDelete(community.id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default CommunityCard;