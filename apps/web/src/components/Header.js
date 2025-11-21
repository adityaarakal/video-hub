import React, { useState } from 'react';
import './Header.css';
import { Menu, X, Search, Mic, Plus, Bell, User, Play, ChevronDown } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('venkateshwara suprabhatha');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // In a real app, this would navigate to search results
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleVoiceSearch = () => {
    alert('Voice search feature - Click allow to enable microphone');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-start">
          <button className="icon-button" aria-label="Menu" onClick={() => alert('Menu clicked')}>
            <Menu size={24} />
          </button>
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
            <div className="logo-icon">
              <Play size={24} fill="currentColor" />
            </div>
            <span className="logo-text">VideoHub</span>
          </a>
        </div>
        
        <div className="header-center">
          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="search-clear" aria-label="Clear" onClick={handleClearSearch}>
                <X size={20} />
              </button>
            )}
            <button type="submit" className="search-button" aria-label="Search">
              <Search size={20} />
            </button>
          </form>
          <button className="voice-search-button" aria-label="Search with your voice" onClick={handleVoiceSearch}>
            <Mic size={20} />
          </button>
        </div>
        
        <div className="header-end">
          <div className="create-menu-wrapper">
            <button 
              className="create-button"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              onBlur={() => setTimeout(() => setShowCreateMenu(false), 200)}
            >
              <Plus size={20} />
              <span>Create</span>
            </button>
            {showCreateMenu && (
              <div className="dropdown-menu create-dropdown">
                <button className="dropdown-item">
                  <Plus size={18} />
                  <span>Upload Video</span>
                </button>
                <button className="dropdown-item">
                  <Play size={18} />
                  <span>Go Live</span>
                </button>
              </div>
            )}
          </div>
          <div className="notifications-menu-wrapper">
            <button 
              className="notifications-button" 
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
            >
              <Bell size={20} />
              <span className="notification-badge">9+</span>
            </button>
            {showNotifications && (
              <div className="dropdown-menu notifications-dropdown">
                <div className="dropdown-header">Notifications</div>
                <div className="notification-item">
                  <div className="notification-content">
                    <strong>New video uploaded</strong>
                    <span className="notification-time">2 hours ago</span>
                  </div>
                </div>
                <div className="notification-item">
                  <div className="notification-content">
                    <strong>Someone liked your comment</strong>
                    <span className="notification-time">5 hours ago</span>
                  </div>
                </div>
                <button className="dropdown-footer">See all notifications</button>
              </div>
            )}
          </div>
          <div className="profile-menu-wrapper">
            <button 
              className="profile-button" 
              aria-label="Account"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
            >
              <div className="profile-avatar">
                <User size={18} />
              </div>
            </button>
            {showProfileMenu && (
              <div className="dropdown-menu profile-dropdown">
                <div className="profile-menu-header">
                  <div className="profile-menu-avatar">
                    <User size={32} />
                  </div>
                  <div className="profile-menu-info">
                    <div className="profile-menu-name">Your Account</div>
                    <div className="profile-menu-email">user@example.com</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Your Channel</button>
                <button className="dropdown-item">Studio</button>
                <button className="dropdown-item">Settings</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

