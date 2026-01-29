// client/src/components/Room/RoomSettings.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Globe, 
  Lock, 
  Code, 
  Trash2,
  Save,
  X
} from 'lucide-react';
import './RoomSetting.css';

const RoomSettings = ({ room, onUpdate, onDelete, onClose, isCreator }) => {
  const [formData, setFormData] = useState({
    name: room.name,
    description: room.description || '',
    language: room.language,
    isPublic: room.isPublic,
    maxParticipants: room.maxParticipants
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(formData);
    setLoading(false);
  };

  return (
    <div className="room-settings-modal">
      <div className="room-settings-overlay" onClick={onClose} />
      
      <div className="room-settings-content">
        <div className="settings-header">
          <Settings size={24} />
          <h2>Room Settings</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* Room Info */}
          <div className="settings-section">
            <h3>Room Information</h3>
            
            <div className="form-group">
              <label>Room Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isCreator}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isCreator}
                rows={3}
                placeholder="What's this room about?"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Code size={16} />
                  Language
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  disabled={!isCreator}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <Users size={16} />
                  Max Users
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  disabled={!isCreator}
                  min="2"
                  max="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  disabled={!isCreator}
                />
                {formData.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                <span>Public Room</span>
              </label>
              <small>Public rooms are visible to everyone</small>
            </div>
          </div>

          {/* Room Stats */}
          <div className="settings-section">
            <h3>Statistics</h3>
            <div className="room-stats">
              <div className="stat-item">
                <span className="stat-label">Room ID</span>
                <span className="stat-value">{room.roomId}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Created</span>
                <span className="stat-value">
                  {new Date(room.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">
                  {room.participants.length}/{room.maxParticipants}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Activity</span>
                <span className="stat-value">
                  {new Date(room.lastActivityAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            {isCreator ? (
              <>
                <button
                  type="button"
                  onClick={onDelete}
                  className="btn btn-danger"
                >
                  <Trash2 size={16} />
                  Delete Room
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <div className="info-message">
                Only the room creator can modify settings
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomSettings;