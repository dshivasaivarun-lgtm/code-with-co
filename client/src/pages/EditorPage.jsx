// client/src/pages/EditorPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Play,
  Save,
  Copy,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Download,
  Upload,
  Code2,
  Moon,
  Sun
} from 'lucide-react';
import API from '../services/api';
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

const THEMES = [
  { value: 'vs-dark', label: 'Dark', icon: Moon },
  { value: 'vs-light', label: 'Light', icon: Sun }
];

const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const editorRef = useRef(null);
  const socketRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('// Start coding together!\n');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [showUsers, setShowUsers] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      auth: { token }
    });

    const socket = socketRef.current;

    // Join room
    socket.emit('join-room', { roomId });

    // Room joined successfully
    socket.on('room-joined', ({ room, activeUsers }) => {
      setRoom(room);
      setCode(room.currentCode || '// Start coding together!\n');
      setLanguage(room.language);
      setActiveUsers(activeUsers);
      toast.success(`Joined ${room.name}`);
    });

    // User joined
    socket.on('user-joined', ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
      toast(`${username} joined the room`, { icon: '👋' });
    });

    // User left
    socket.on('user-left', ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
      toast(`${username} left the room`, { icon: '👋' });
    });

    // Code update from other users
    socket.on('code-update', ({ code: newCode, username }) => {
      setCode(newCode);
      console.log(`Code updated by ${username}`);
    });

    // Language changed
    socket.on('language-updated', ({ language: newLang, username }) => {
      setLanguage(newLang);
      toast(`${username} changed language to ${newLang}`);
    });

    // New chat message
    socket.on('new-message', (message) => {
      console.log('Received new message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // User typing
    socket.on('user-typing', ({ username }) => {
      // Handle typing indicator (optional)
    });

    // Error handling
    socket.on('error', ({ message }) => {
      toast.error(message);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave-room', { roomId });
      socket.disconnect();
    };
  }, [roomId, token]);

  const handleEditorChange = (value) => {
    setCode(value);
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        roomId,
        code: value
      });
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit('language-change', {
        roomId,
        language: newLanguage
      });
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme === 'vs-dark' ? 'Dark' : 'Light'}`);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    toast('Code execution coming soon!', { icon: '⚡' });
    setOutput('// Code execution feature will be implemented\n// For now, this is a placeholder');
    setTimeout(() => setIsRunning(false), 1000);
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code-with-co-${roomId}.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code downloaded!');
  };

  const handleSendMessage = (message) => {
    if (message && message.trim() && socketRef.current) {
      console.log('Sending message:', { roomId, message: message.trim() });
      socketRef.current.emit('send-message', {
        roomId,
        message: message.trim()
      });
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      navigate('/dashboard');
    }
  };

  if (!room) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="editor-page">
      {/* Header */}
      <header className="editor-header">
        <div className="header-left">
          <Code2 size={24} className="logo-icon" />
          <h2>{room.name}</h2>
          <span className="room-id">#{roomId}</span>
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
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleThemeChange(t.value)}
                className={`theme-btn ${theme === t.value ? 'active' : ''}`}
                title={t.label}
              >
                <t.icon size={18} />
              </button>
            ))}
          </div>
        </div>

        <div className="header-right">
          <button onClick={handleRunCode} className="btn btn-primary" disabled={isRunning}>
            <Play size={18} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button onClick={handleSaveCode} className="btn btn-secondary" disabled={isSaving}>
            <Save size={18} />
            Save
          </button>
          <button onClick={handleCopyCode} className="btn btn-secondary">
            <Copy size={18} />
          </button>
          <button onClick={handleDownloadCode} className="btn btn-secondary">
            <Download size={18} />
          </button>
          <button onClick={handleLeaveRoom} className="btn btn-danger">
            <LogOut size={18} />
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="editor-content">
        {/* Sidebar - Active Users */}
        {showUsers && (
          <aside className="users-sidebar">
            <div className="sidebar-header">
              <Users size={20} />
              <h3>Active Users ({activeUsers.length})</h3>
              <button onClick={() => setShowUsers(false)} className="close-btn">×</button>
            </div>
            <div className="users-list">
              {activeUsers.map((u) => (
                <div key={u.userId} className="user-item">
                  <img src={u.avatar} alt={u.username} className="user-avatar" />
                  <span>{u.username}</span>
                  {u.userId === user.id && <span className="badge">You</span>}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Editor Area */}
        <main className="editor-main">
          <div className="editor-container">
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={theme}
              onChange={handleEditorChange}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: true
              }}
            />
          </div>

          {/* Output Section */}
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
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <MessageSquare size={20} />
              <h3>Chat</h3>
              <button onClick={() => setShowChat(false)} className="close-btn">×</button>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <p className="no-messages">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.user._id === user.id ? 'own-message' : ''}`}
                  >
                    <img src={msg.user.avatar} alt={msg.user.username} className="msg-avatar" />
                    <div className="message-content">
                      <div className="message-header">
                        <span className="username">{msg.user.username}</span>
                        <span className="timestamp">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(newMessage);
              setNewMessage('');
            }} className="message-input-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Toggle buttons for hidden sidebars */}
      <div className="sidebar-toggles">
        {!showUsers && (
          <button onClick={() => setShowUsers(true)} className="toggle-btn" title="Show Users">
            <Users size={20} />
          </button>
        )}
        {!showChat && (
          <button onClick={() => setShowChat(true)} className="toggle-btn" title="Show Chat">
            <MessageSquare size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorPage;