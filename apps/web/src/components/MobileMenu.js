import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Home, Search, User, Clock, List, Settings } from 'lucide-react';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Clock, label: 'Watch Later', path: '/playlist/watch-later' },
    { icon: List, label: 'Playlists', path: '/playlists' },
    { icon: User, label: 'Subscriptions', path: '/subscriptions' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleItemClick = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-menu-overlay" onClick={onClose}>
      <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-menu-header">
          <h2>Menu</h2>
          <button className="mobile-menu-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="mobile-menu-items">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="mobile-menu-item"
                onClick={() => handleItemClick(item.path)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;

