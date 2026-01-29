// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Code2,
  Users,
  Clock,
  Search,
  LogOut,
  User,
  Globe,
  Lock,
  Filter,
  RefreshCw
} from 'lucide-react';
import './Dashboard.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create room form
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    language: 'javascript',
    isPublic: true,
    password: '',
    maxParticipants: 10
  });

  // Join room form
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [selectedLanguage]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedLanguage) params.language = selectedLanguage;

      const res = await API.get('/rooms', { params });
      setRooms(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/rooms', newRoom);
      toast.success('Room created successfully!');
      setShowCreateModal(false);
      navigate(`/room/${res.data.data.roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (roomId, password = '') => {
    try {
      await API.post(`/rooms/${roomId}/join`, { password });
      navigate(`/room/${roomId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join room');
    }
  };

  const handleQuickJoin = async (e) => {
    e.preventDefault();
    if (joinRoomId.trim()) {
      await handleJoinRoom(joinRoomId, joinPassword);
      setShowJoinModal(false);
      setJoinRoomId('');
      setJoinPassword('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLanguageIcon = (lang) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '🔧',
      typescript: '🔷',
      html: '🌐',
      css: '🎨'
    };
    return icons[lang] || '💻';
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <Code2 size={32} className="logo-icon" />
          <h1>Code with Co</h1>
        </div>

        <div className="header-right">
          <div className="user-menu">
            <img src={user?.avatar} alt={user?.username} className="user-avatar" />
            <span>{user?.username}</span>
            <button onClick={handleLogout} className="btn-icon" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Actions Bar */}
        <div className="actions-bar">
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={20} />
            Create Room
          </button>
          <button onClick={() => setShowJoinModal(true)} className="btn btn-secondary">
            <Users size={20} />
            Join Room
          </button>
          <button onClick={fetchRooms} className="btn btn-secondary">
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-bar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchRooms()}
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-filter"
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <button onClick={fetchRooms} className="btn btn-secondary">
            <Filter size={20} />
            Apply
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="rooms-section">
          <h2>Available Rooms</h2>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="empty-state">
              <Code2 size={64} />
              <h3>No rooms found</h3>
              <p>Create a new room or try a different search</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                Create Your First Room
              </button>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map((room) => (
                <div key={room._id} className="room-card">
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    <span className="language-badge">
                      {getLanguageIcon(room.language)} {room.language}
                    </span>
                  </div>

                  <p className="room-description">
                    {room.description || 'No description provided'}
                  </p>

                  <div className="room-meta">
                    <span className="meta-item">
                      <Users size={16} />
                      {room.participants.length}/{room.maxParticipants}
                    </span>
                    <span className="meta-item">
                      {room.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                      {room.isPublic ? 'Public' : 'Private'}
                    </span>
                    <span className="meta-item">
                      <Clock size={16} />
                      {new Date(room.lastActivityAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="room-footer">
                    <div className="room-creator">
                      <img
                        src={room.createdBy.avatar}
                        alt={room.createdBy.username}
                        className="creator-avatar"
                      />
                      <span>by {room.createdBy.username}</span>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomId)}
                      className="btn btn-primary btn-sm"
                      disabled={room.participants.length >= room.maxParticipants}
                    >
                      {room.participants.length >= room.maxParticipants ? 'Full' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Room</h2>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleCreateRoom} className="modal-form">
              <div className="form-group">
                <label>Room Name *</label>
                <input
                  type="text"
                  placeholder="Enter room name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What's this room about?"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Language *</label>
                  <select
                    value={newRoom.language}
                    onChange={(e) => setNewRoom({ ...newRoom, language: e.target.value })}
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
                  <label>Max Participants</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={newRoom.maxParticipants}
                    onChange={(e) => setNewRoom({ ...newRoom, maxParticipants: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newRoom.isPublic}
                    onChange={(e) => setNewRoom({ ...newRoom, isPublic: e.target.checked })}
                  />
                  <span>Public Room</span>
                </label>
              </div>

              {!newRoom.isPublic && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Set room password"
                    value={newRoom.password}
                    onChange={(e) => setNewRoom({ ...newRoom, password: e.target.value })}
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Room</h2>
              <button onClick={() => setShowJoinModal(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleQuickJoin} className="modal-form">
              <div className="form-group">
                <label>Room ID *</label>
                <input
                  type="text"
                  placeholder="Enter room ID"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password (if private)</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowJoinModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Join Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;