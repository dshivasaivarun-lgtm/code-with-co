// client/src/components/Chat/UserList.jsx
import React from 'react';
import { Crown, Circle } from 'lucide-react';
import './UserList.css';

const UserList = ({ users, currentUserId, roomCreator }) => {
  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Active Users ({users.length})</h3>
      </div>

      <div className="user-list-content">
        {users.map((user) => {
          const isCurrentUser = user.userId === currentUserId;
          const isCreator = user.userId === roomCreator;

          return (
            <div key={user.userId} className="user-list-item">
              <div className="user-info">
                <div className="user-avatar-wrapper">
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="user-avatar"
                  />
                  <Circle 
                    size={10} 
                    className="user-status-indicator online"
                    fill="currentColor"
                  />
                </div>

                <div className="user-details">
                  <span className="user-name">
                    {user.username}
                    {isCurrentUser && <span className="you-badge">You</span>}
                  </span>
                  {isCreator && (
                    <span className="creator-badge">
                      <Crown size={12} />
                      Creator
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;