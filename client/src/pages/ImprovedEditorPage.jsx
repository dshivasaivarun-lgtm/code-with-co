// client/src/pages/ImprovedEditorPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../services/api';
import CodeEditor from '../components/Editor/CodeEditor';
import ChatBox from '../components/Chat/ChatBox';
import UserList from '../components/Chat/UserList';
import RoomSettings from '../components/Room/RoomSetting';
import {
  Play,
  Save,
  Copy,
  Download,
  Code2,
  Moon,
  Sun,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Menu,
  Users,
  MessageSquare
} from 'lucide-react';
import './EditorPage.css';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' }
];

const ImprovedEditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  // Room state
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  
  // Users and messages
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // UI state
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const cleanup = initializeSocket();
    
    // Keyboard shortcuts
    const handleKeyboard = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => {
      window.removeEventListener('keydown', handleKeyboard);
      cleanup();
    };
  }, [roomId, token]);

  const initializeSocket = () => {
    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      forceNew: true
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.emit('join-room', { roomId });

    socket.on('room-joined', async ({ room, activeUsers }) => {
      console.log('Room data from socket:', room);
      
      // Fetch full room data with populated fields
      try {
        const response = await API.get(`/rooms/${roomId}`);
        const fullRoomData = response.data.data;
        console.log('Full room data from API:', fullRoomData);
        setRoom(fullRoomData);
      } catch (error) {
        console.error('Error fetching full room data:', error);
        setRoom(room);
      }
      
      setCode(room.currentCode || '');
      setLanguage(room.language);
      setActiveUsers(activeUsers);
      setLoading(false);
      toast.success(`Joined ${room.name}`);
    });

    socket.on('user-joined', ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
      toast(`${username} joined`, { icon: '👋' });
    });

    socket.on('user-left', ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
      toast(`${username} left`, { icon: '👋' });
    });

    socket.on('code-update', ({ code: newCode }) => {
      setCode(newCode);
    });

    socket.on('language-updated', ({ language: newLang, username }) => {
      setLanguage(newLang);
      toast(`${username} changed language to ${newLang}`);
    });

    socket.on('new-message', (message) => {
      setMessages((prev) => {
        // Check if message already exists to prevent duplicates
        const exists = prev.some(msg => msg._id === message._id);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    });

    socket.on('user-typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    socket.on('error', ({ message }) => {
      toast.error(message);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
    };
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit('code-change', { roomId, code: value });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit('language-change', { roomId, language: newLanguage });
    }
  };

  const handleSendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { roomId, message });
      socketRef.current.emit('typing-stop', { roomId });
    }
  };

  const handleSaveCode = async () => {
    setIsSaving(true);
    try {
      await API.post('/code/save', {
        roomId,
        content: code,
        language,
        description: 'Manual save'
      });
      toast.success('Code saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    toast('Code execution coming soon!', { icon: '⚡' });
    setOutput(`// Code execution feature will be implemented\n// Language: ${language}\n// Lines: ${code.split('\n').length}`);
    setTimeout(() => setIsRunning(false), 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-with-co-${roomId}.${language}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const handleUpdateRoom = async (formData) => {
    try {
      console.log('Updating room with data:', formData);
      const response = await API.put(`/rooms/${roomId}`, formData);
      console.log('Update response:', response.data);
      setRoom(prev => ({ ...prev, ...formData }));
      setShowSettings(false);
      toast.success('Room updated successfully!');
    } catch (error) {
      console.error('Update room error:', error);
      toast.error(error.response?.data?.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm('Are you sure you want to delete this room? This cannot be undone.')) {
      try {
        await API.delete(`/rooms/${roomId}`);
        toast.success('Room deleted');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      navigate('/dashboard');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading room...</p>
      </div>
    );
  }

  const isCreator = room?.createdBy?._id === user?._id;

  return (
    <div className="editor-page">
      {/* Header */}
      <header className="editor-header">
        <div className="header-left">
          <Code2 size={24} className="logo-icon" />
          <h2>{room?.name}</h2>
          <span className="room-id">#{roomId}</span>
          <span className="room-creator" style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
            Created by: {room?.createdBy?.username}
            {isCreator && <span style={{ color: '#4CAF50', marginLeft: '5px' }}>(You)</span>}
          </span>
        </div>

        <div className="header-center">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="language-selector"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <div className="theme-toggle">
            <button
              onClick={() => setTheme('vs-dark')}
              className={`theme-btn ${theme === 'vs-dark' ? 'active' : ''}`}
            >
              <Moon size={18} />
            </button>
            <button
              onClick={() => setTheme('vs-light')}
              className={`theme-btn ${theme === 'vs-light' ? 'active' : ''}`}
            >
              <Sun size={18} />
            </button>
          </div>
        </div>

        <div className="header-right">
          <button onClick={handleRunCode} className="btn btn-primary" disabled={isRunning}>
            <Play size={18} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button onClick={handleSaveCode} className="btn btn-secondary" disabled={isSaving}>
            <Save size={18} />
          </button>
          <button onClick={handleCopyCode} className="btn btn-secondary">
            <Copy size={18} />
          </button>
          <button onClick={handleDownloadCode} className="btn btn-secondary">
            <Download size={18} />
          </button>
          <button onClick={() => setShowSettings(true)} className="btn btn-secondary">
            <Settings size={18} />
          </button>
          <button onClick={toggleFullscreen} className="btn btn-secondary">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={handleLeaveRoom} className="btn btn-danger">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editor-content">
        {/* Users Sidebar */}
        {showUsers && (
          <aside 
            className="users-sidebar"
            style={{ 
              width: '280px',
              height: 'calc(100vh - 60px)',
              backgroundColor: '#1e1e1e',
              borderRight: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              left: '0',
              top: '60px',
              zIndex: 1000
            }}
          >
            <UserList
              users={activeUsers}
              currentUserId={user?._id}
              roomCreator={room?.createdBy?._id}
            />
          </aside>
        )}

        {/* Editor */}
        <main 
          className="editor-main"
          style={{
            marginLeft: showUsers ? '280px' : '0',
            marginRight: showChat ? '280px' : '0',
            transition: 'margin 0.3s ease'
          }}
        >
          <div className="editor-container">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={language}
              theme={theme}
            />
          </div>

          {output && (
            <div className="output-section">
              <div className="output-header">
                <h4>Output</h4>
                <button onClick={() => setOutput('')} className="close-btn">×</button>
              </div>
              <pre className="output-content">{output}</pre>
            </div>
          )}
        </main>

        {/* Chat Sidebar */}
        {showChat && (
          <aside 
            className="chat-sidebar"
            style={{ 
              width: '280px',
              height: 'calc(100vh - 60px)',
              backgroundColor: '#1e1e1e',
              borderLeft: '1px solid #333',
              display: 'flex',
              flexDirection: 'column',
              position: 'fixed',
              right: '0',
              top: '60px',
              zIndex: 1000
            }}
          >
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
              isTyping={isTyping}
            />
          </aside>
        )}
      </div>

      {/* Collapsible Sidebar */}
      <div 
        className={`collapsible-sidebar ${showSidebar ? 'open' : 'closed'}`}
        style={{
          position: 'fixed',
          left: showSidebar ? '0' : '-240px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          transition: 'left 0.3s ease'
        }}
      >
        {/* Toggle Button */}
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? 'Close sidebar' : 'Open sidebar'}
          style={{
            position: 'absolute',
            right: '-48px',
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--primary, #667eea)',
            color: 'white',
            border: 'none',
            borderRadius: '0 50% 50% 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 0 12px rgba(0, 0, 0, 0.3)',
            zIndex: 2001
          }}
        >
          <Menu size={20} />
        </button>

        {/* Sidebar Content */}
        <div 
          className="sidebar-content"
          style={{
            width: '240px',
            backgroundColor: '#1e1e1e',
            border: '1px solid #333',
            borderRadius: '0 8px 8px 0',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
            padding: '20px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              <Users size={16} />
              Users Panel
            </h3>
            <div className="sidebar-buttons">
              <button
                onClick={() => setShowUsers(!showUsers)}
                className={`sidebar-btn ${showUsers ? 'active' : ''}`}
                title={showUsers ? 'Hide users' : 'Show users'}
              >
                <Users size={18} />
                {showUsers ? 'Hide Users' : 'Show Users'}
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-section-title">
              <MessageSquare size={16} />
              Chat Panel
            </h3>
            <div className="sidebar-buttons">
              <button
                onClick={() => setShowChat(!showChat)}
                className={`sidebar-btn ${showChat ? 'active' : ''}`}
                title={showChat ? 'Hide chat' : 'Show chat'}
              >
                <MessageSquare size={18} />
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <RoomSettings
          room={room}
          onUpdate={handleUpdateRoom}
          onDelete={handleDeleteRoom}
          onClose={() => setShowSettings(false)}
          isCreator={isCreator}
        />
      )}
    </div>
  );
};

export default ImprovedEditorPage;