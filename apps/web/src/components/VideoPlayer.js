import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import { RotateCcw, Volume2, VolumeX, Settings, Maximize, Minimize, Play, Pause } from 'lucide-react';

const VideoPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(1241); // 20:41 in seconds
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [quality, setQuality] = useState('HD');
  const playerRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(50);
    } else {
      setIsMuted(true);
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isPlaying, duration, playbackSpeed]);

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="video-player-container" ref={playerRef}>
      <div className="video-player-wrapper">
        <div 
          className="video-player"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onClick={handlePlayPause}
        >
          <div className="video-placeholder">
            <div className="video-placeholder-content">
              {!isPlaying && (
                <div className="play-icon-wrapper" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                  <Play size={64} fill="currentColor" />
                </div>
              )}
              {isPlaying && (
                <div className="video-playing-indicator">
                  <Pause size={48} />
                </div>
              )}
            </div>
          </div>
          <div className={`video-controls ${showControls || !isPlaying ? 'visible' : ''}`}>
            <div className="video-progress">
              <div className="progress-bar" onClick={handleProgressClick}>
                <div className="progress-filled" style={{width: `${progressPercent}%`}}></div>
                <div className="progress-handle" style={{left: `${progressPercent}%`}}></div>
              </div>
              <div className="progress-time">{formatTime(currentTime)} / {formatTime(duration)}</div>
            </div>
            <div className="controls-bottom">
              <div className="controls-left">
                <button className="control-button" aria-label="Replay" onClick={(e) => { e.stopPropagation(); handleReplay(); }}>
                  <RotateCcw size={20} />
                </button>
                <button className="control-button" aria-label="Volume" onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}>
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="volume-control" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
              </div>
              <div className="controls-center">
                <button className="control-button play-pause-btn" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
                </button>
                <span className="video-time">{formatTime(currentTime)}</span>
              </div>
              <div className="controls-right">
                <div className="settings-menu-wrapper">
                  <button 
                    className="control-button" 
                    aria-label="Settings"
                    onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                  >
                    <Settings size={20} />
                  </button>
                  {showSettings && (
                    <div className="settings-dropdown" onClick={(e) => e.stopPropagation()}>
                      <div className="settings-section">
                        <div className="settings-label">Playback Speed</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                          <button
                            key={speed}
                            className={`settings-option ${playbackSpeed === speed ? 'active' : ''}`}
                            onClick={() => setPlaybackSpeed(speed)}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                      <div className="settings-section">
                        <div className="settings-label">Quality</div>
                        {['Auto', '1080p', '720p', '480p', '360p'].map(q => (
                          <button
                            key={q}
                            className={`settings-option ${quality === q ? 'active' : ''}`}
                            onClick={() => setQuality(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="control-button" aria-label="Subtitles">
                  <span className="control-text">CC</span>
                </button>
                <button className="control-button" aria-label="Quality">
                  <span className="control-text">{quality}</span>
                </button>
                <button className="control-button" aria-label="Fullscreen" onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}>
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

