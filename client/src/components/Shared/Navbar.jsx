// client/src/components/Shared/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Code2, 
  Home, 
  LogOut, 
  User, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-logo">
          <Code2 size={28} />
          <span>Code with Co</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Items */}
        <div className={`navbar-menu ${showMenu ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-item">
                <Home size={18} />
                Dashboard
              </Link>

              {/* Profile Dropdown */}
              <div className="profile-dropdown">
                <button
                  className="profile-trigger"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <img 
                    src={user?.avatar} 
                    alt={user?.username}
                    className="profile-avatar"
                  />
                  <span>{user?.username}</span>
                </button>

                {showProfileMenu && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">
                      <User size={16} />
                      Profile
                    </Link>
                    <Link to="/settings" className="dropdown-item">
                      <Settings size={16} />
                      Settings
                    </Link>
                    <div className="dropdown-divider" />
                    <button onClick={logout} className="dropdown-item logout">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;