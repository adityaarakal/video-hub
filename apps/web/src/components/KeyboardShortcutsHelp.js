import React, { useEffect } from 'react';
import { X, Play, Volume2, Maximize, ArrowLeft, Search } from 'lucide-react';
import './KeyboardShortcutsHelp.css';

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Space'], description: 'Play/Pause video', icon: <Play size={20} /> },
    { keys: ['←', '→'], description: 'Seek backward/forward 5 seconds', icon: <ArrowLeft size={20} /> },
    { keys: ['↑', '↓'], description: 'Increase/Decrease volume', icon: <Volume2 size={20} /> },
    { keys: ['M'], description: 'Mute/Unmute', icon: <Volume2 size={20} /> },
    { keys: ['F'], description: 'Toggle fullscreen', icon: <Maximize size={20} /> },
    { keys: ['/'], description: 'Focus search bar', icon: <Search size={20} /> },
    { keys: ['Esc'], description: 'Close modals/menus', icon: <X size={20} /> },
  ];

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <div className="shortcut-icon">{shortcut.icon}</div>
              <div className="shortcut-description">{shortcut.description}</div>
              <div className="shortcut-keys">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex} className="key-badge">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          <p>Press <kbd>Esc</kbd> or click outside to close</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;

