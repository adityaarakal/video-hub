import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import MobileMenu from './MobileMenu';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import api from '../services/api';
import './Header.css';
import { Menu, X, Search, Mic, Plus, Bell, User, Play, ChevronDown, LogOut, Clock, Keyboard, Shield } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();
  const { info } = useToast();
  const [searchQuery, setSearchQuery] = useState(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      return params.get('q') || '';
    }
    return '';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Search autocomplete/suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await api.search(searchQuery.trim(), 'all', 5);
          const suggestions = [];
          
          if (results.videos) {
            suggestions.push(...results.videos.slice(0, 3).map(v => ({
              type: 'video',
              title: v.title,
              id: v.id,
              channel: v.channelName
            })));
          }
          
          if (results.channels) {
            suggestions.push(...results.channels.slice(0, 2).map(c => ({
              type: 'channel',
              title: c.name,
              id: c.id
            })));
          }
          
          setSearchSuggestions(suggestions);
          setShowSearchSuggestions(true);
        } catch (error) {
          console.error('Search suggestions error:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
        setShowSearchSuggestions(false);
      }
    };

    const handleShowShortcuts = () => {
      setShowKeyboardShortcuts(true);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('showKeyboardShortcuts', handleShowShortcuts);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('showKeyboardShortcuts', handleShowShortcuts);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchSuggestions(false);
  };

  const handleVoiceSearch = () => {
    info('Voice search feature - Click allow to enable microphone', 4000);
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'video') {
      navigate(`/watch?v=${suggestion.id}`);
    }
    setShowSearchSuggestions(false);
    setSearchQuery('');
  };

  return (
    <>
      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      <KeyboardShortcutsHelp isOpen={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
      <header className="header">
        <div className="header-container">
          <div className="header-start">
            <button className="icon-button" aria-label="Menu" onClick={() => setShowMobileMenu(true)}>
              <Menu size={24} />
            </button>
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <div className="logo-icon">
              <Play size={24} fill="currentColor" />
            </div>
            <span className="logo-text">VideoHub</span>
          </a>
        </div>
        
        <div className="header-center">
          <div className="search-wrapper" ref={searchInputRef}>
            <form className="search-form" onSubmit={handleSearch}>
              <input 
                ref={searchInputRef}
                type="text" 
                className="search-input" 
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 2 && setShowSearchSuggestions(true)}
              />
              {searchQuery && (
                <button type="button" className="search-clear" aria-label="Clear" onClick={handleClearSearch}>
                  <X size={20} />
                </button>
              )}
              <button type="submit" className="search-button" aria-label="Search">
                {isSearching ? (
                  <div className="search-spinner"></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </form>
            {showSearchSuggestions && searchSuggestions.length > 0 && (
              <div className="search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={16} />
                    <div className="suggestion-content">
                      <div className="suggestion-title">{suggestion.title}</div>
                      {suggestion.channel && (
                        <div className="suggestion-meta">{suggestion.channel}</div>
                      )}
                      <div className="suggestion-type">{suggestion.type}</div>
                    </div>
                  </div>
                ))}
                <div className="search-suggestion-footer">
                  Press Enter to search for "{searchQuery}"
                </div>
              </div>
            )}
          </div>
          <button className="voice-search-button" aria-label="Search with your voice" onClick={handleVoiceSearch}>
            <Mic size={20} />
          </button>
        </div>
        
        <div className="header-end">
          <button 
            className="icon-button" 
            aria-label="Keyboard Shortcuts" 
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={20} />
          </button>
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
                    {user?.avatar ? (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14 }}>
                        {user.avatar}
                      </div>
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="profile-menu-info">
                    <div className="profile-menu-name">{user?.username || 'Guest'}</div>
                    <div className="profile-menu-email">{user?.email || 'Not signed in'}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Your Channel</button>
                <button className="dropdown-item">Studio</button>
                <button className="dropdown-item">Settings</button>
                {user && user.role === 'admin' && (
                  <>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item" 
                      onClick={() => { navigate('/admin'); setShowProfileMenu(false); }}
                    >
                      <Shield size={18} />
                      <span>Admin Panel</span>
                    </button>
                  </>
                )}
                <div className="dropdown-divider"></div>
                {user ? (
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => { navigate('/login'); setShowProfileMenu(false); }}>
                      Sign in
                    </button>
                    <button className="dropdown-item" onClick={() => { navigate('/register'); setShowProfileMenu(false); }}>
                      Sign up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </header>
    </>
  );
};

export default Header;

