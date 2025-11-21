import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';
import { RotateCcw, Volume2, VolumeX, Settings, Maximize, Minimize, Play, Pause } from 'lucide-react';

const VideoPlayer = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video?.duration || 1241); // Use video duration or default
  const playbackIntervalRef = useRef(null);

  // Update duration when video changes
  React.useEffect(() => {
    if (video?.duration) {
      setDuration(video.duration);
      setCurrentTime(0); // Reset time when video changes
      setIsPlaying(false); // Stop playback when video changes
    }
  }, [video?.id]);

  // Handle playback simulation
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, duration]);
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
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

  useEffect(() => {
    const handleVideoSeek = (e) => {
      const seconds = e.detail;
      setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)));
    };

    const handleVolumeChange = (e) => {
      const change = e.detail;
      setVolume(prev => Math.max(0, Math.min(100, prev + change)));
      setIsMuted(false);
    };

    const handleVideoMute = () => {
      handleMuteToggle();
    };

    const handleVideoFullscreen = () => {
      handleFullscreen();
    };

    document.addEventListener('videoSeek', handleVideoSeek);
    document.addEventListener('volumeChange', handleVolumeChange);
    document.addEventListener('videoMute', handleVideoMute);
    document.addEventListener('videoFullscreen', handleVideoFullscreen);

    return () => {
      document.removeEventListener('videoSeek', handleVideoSeek);
      document.removeEventListener('volumeChange', handleVolumeChange);
      document.removeEventListener('videoMute', handleVideoMute);
      document.removeEventListener('videoFullscreen', handleVideoFullscreen);
    };
  }, [duration]);

  const videoRef = useRef(null);
  const progressPercent = (currentTime / duration) * 100;

  // Handle real video element if videoUrl exists
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      if (videoElement) {
        setCurrentTime(videoElement.currentTime);
        setDuration(videoElement.duration || duration);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('loadedmetadata', () => {
      setDuration(videoElement.duration);
    });

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('loadedmetadata', () => {});
    };
  }, [duration]);

  // Sync play/pause with video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video?.videoUrl) return;

    if (isPlaying) {
      videoElement.play().catch(err => console.error('Play failed:', err));
    } else {
      videoElement.pause();
    }
  }, [isPlaying, video?.videoUrl]);

  // Sync volume
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video?.videoUrl) return;
    videoElement.volume = (isMuted ? 0 : volume) / 100;
  }, [volume, isMuted, video?.videoUrl]);

  // Sync playback speed
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video?.videoUrl) return;
    videoElement.playbackRate = playbackSpeed;
  }, [playbackSpeed, video?.videoUrl]);

  // Handle seeking
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !video?.videoUrl) return;
    if (Math.abs(videoElement.currentTime - currentTime) > 1) {
      videoElement.currentTime = currentTime;
    }
  }, [currentTime, video?.videoUrl]);

  const handleVideoClick = () => {
    if (video?.videoUrl && videoRef.current) {
      handlePlayPause();
    } else {
      handlePlayPause();
    }
  };

  return (
    <div className="video-player-container" ref={playerRef}>
      <div className="video-player-wrapper">
        <div 
          className="video-player"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onClick={handleVideoClick}
        >
          {video?.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="video-element"
              playsInline
              preload="metadata"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            />
          ) : (
            <div className="video-placeholder">
              {video && (
                <div className="video-info-overlay">
                  <h3 className="video-title-overlay">{video.title}</h3>
                  <p className="video-channel-overlay">{video.channelName}</p>
                  <div className="video-stats-overlay">
                    <span>{formatNumber(video.views || 0)} views</span>
                    <span>•</span>
                    <span>{getTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
              )}
              <div className="video-placeholder-content">
                {!isPlaying && (
                  <div className="play-icon-wrapper" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>
                    <Play size={64} fill="currentColor" />
                  </div>
                )}
                {isPlaying && (
                  <div className="video-playing-indicator">
                    <div className="playing-animation">
                      <div className="wave"></div>
                      <div className="wave"></div>
                      <div className="wave"></div>
                    </div>
                    <Pause size={48} />
                  </div>
                )}
              </div>
            </div>
          )}
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

