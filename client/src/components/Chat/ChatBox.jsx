// client/src/components/Chat/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, ArrowRight, ChevronRight } from 'lucide-react';
import './ChatBox.css';

const ChatBox = ({ messages, onSendMessage, currentUser, isTyping }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨', '🚀', '💻', '🐛', '✅'];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-box">
      {/* Messages Area */}
      <div className="chat-messages">

        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>💬 No messages yet</p>
            <span>Start the conversation!</span>
          </div>
        ) : (
          <div>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.user?._id === currentUser?.id;
              
              return (
                <div
                  key={`${msg._id}-${index}`}
                  className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}
                  style={{ marginBottom: '10px', padding: '8px', border: '1px solid #ddd' }}
                >
                  <div className="message-content-wrapper">
                    <span className="message-username" style={{ fontWeight: 'bold', fontSize: '12px' }}>
                      {msg.user?.username || 'Unknown'}
                    </span>
                    
                    <div className="message-bubble" style={{ marginTop: '4px' }}>
                      <p style={{ margin: 0 }}>{msg.message}</p>
                    </div>
                    
                    <span className="message-time" style={{ fontSize: '10px', color: '#666' }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="emoji-btn"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="chat-input-area">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="icon-btn"
          title="Emojis"
        >
          <Smile size={20} />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          maxLength={1000}
        />

        <button
          type="submit"
          className="send-btn"
          disabled={!message.trim()}
          title="Send message"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
          }}
        >
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'white' 
          }}>
            &gt;
          </span>
        </button>
      </form>
    </div>
  );
};

export default ChatBox;