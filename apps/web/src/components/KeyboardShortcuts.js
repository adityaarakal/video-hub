import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // Space bar - Play/Pause video (when on home page)
      if (e.code === 'Space' && location.pathname === '/') {
        e.preventDefault();
        const playPauseEvent = new KeyboardEvent('keydown', {
          key: ' ',
          code: 'Space',
          bubbles: true
        });
        document.dispatchEvent(playPauseEvent);
      }

      // Forward slash - Focus search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Question mark - Show keyboard shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const event = new CustomEvent('showKeyboardShortcuts');
        document.dispatchEvent(event);
      }

      // Escape - Close modals/dropdowns
      if (e.key === 'Escape') {
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
          if (dropdown.style.display !== 'none') {
            dropdown.style.display = 'none';
          }
        });
      }

      // Arrow keys for video seeking (when on home page)
      if (location.pathname === '/') {
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const seekEvent = new CustomEvent('videoSeek', { detail: -10 });
          document.dispatchEvent(seekEvent);
        }
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const seekEvent = new CustomEvent('videoSeek', { detail: 10 });
          document.dispatchEvent(seekEvent);
        }
        if (e.key === 'ArrowUp' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const volumeEvent = new CustomEvent('volumeChange', { detail: 5 });
          document.dispatchEvent(volumeEvent);
        }
        if (e.key === 'ArrowDown' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const volumeEvent = new CustomEvent('volumeChange', { detail: -5 });
          document.dispatchEvent(volumeEvent);
        }
      }

      // M key - Mute/Unmute
      if (e.key === 'm' || e.key === 'M') {
        const muteEvent = new CustomEvent('videoMute');
        document.dispatchEvent(muteEvent);
      }

      // F key - Fullscreen
      if (e.key === 'f' || e.key === 'F') {
        const fullscreenEvent = new CustomEvent('videoFullscreen');
        document.dispatchEvent(fullscreenEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location]);

  return null;
};

export default KeyboardShortcuts;

