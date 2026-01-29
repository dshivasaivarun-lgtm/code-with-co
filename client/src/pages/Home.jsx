// client/src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Users, Zap, Shield, Globe, MessageSquare } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <Code2 size={40} />,
      title: 'Real-time Collaboration',
      description: 'Code together in real-time with multiple developers simultaneously'
    },
    {
      icon: <Users size={40} />,
      title: 'Multiple Users',
      description: 'Support for up to 50 users per room with live presence indicators'
    },
    {
      icon: <Zap size={40} />,
      title: 'Instant Sync',
      description: 'Lightning-fast synchronization powered by WebSocket technology'
    },
    {
      icon: <Globe size={40} />,
      title: 'Multiple Languages',
      description: 'Support for JavaScript, Python, Java, C++, and more'
    },
    {
      icon: <MessageSquare size={40} />,
      title: 'Built-in Chat',
      description: 'Communicate with your team while coding together'
    },
    {
      icon: <Shield size={40} />,
      title: 'Secure & Private',
      description: 'Create private rooms with password protection'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <nav className="navbar">
          <div className="nav-brand">
            <Code2 size={32} />
            <span>Code with Co</span>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
        </nav>

        <div className="hero-content">
          <h1 className="hero-title">
            Code Together,
            <br />
            <span className="gradient-text">Build Better</span>
          </h1>
          <p className="hero-subtitle">
            A real-time collaborative coding platform where developers can code, 
            learn, and grow together. Join thousands of developers already collaborating.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Coding Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="code-window">
            <div className="window-header">
              <div className="window-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="window-title">collaborative-code.js</span>
            </div>
            <div className="window-content">
              <pre>{`function collaborate() {
  const developers = ["Alice", "Bob", "Charlie"];
  
  developers.forEach(dev => {
    console.log(\`\${dev} is coding...\`);
  });
  
  return "Building amazing things together!";
}

collaborate();`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose Code with Co?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">Get Started in 3 Simple Steps</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up for free in seconds</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Create or Join Room</h3>
            <p>Start a new room or join existing ones</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Start Coding</h3>
            <p>Collaborate in real-time with your team</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Start Coding Together?</h2>
        <p>Join our community of collaborative developers today</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Code2 size={24} />
            <span>Code with Co</span>
          </div>
          <p className="footer-text">
            Built with ❤️ using MERN Stack
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

