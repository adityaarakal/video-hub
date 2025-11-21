import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Play, Clock } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, [page]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getVideos({ page, limit: 20 });
      
      if (page === 1) {
        setVideos(response.videos || []);
      } else {
        setVideos(prev => [...prev, ...(response.videos || [])]);
      }
      
      setHasMore(response.hasMore || false);
    } catch (err) {
      console.error('Failed to load videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch?v=${videoId}`);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && videos.length === 0) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="home-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => { setPage(1); loadVideos(); }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <h1>Videos</h1>
          <p>Discover amazing content</p>
        </div>

        <div className="videos-grid">
          {videos.map(video => (
            <div
              key={video.id}
              className="video-card"
              onClick={() => handleVideoClick(video.id)}
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <div className="video-thumbnail-container">
                {video.thumbnail && video.thumbnail.trim() !== '' ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="video-thumbnail"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`thumbnail-placeholder ${hoveredVideo === video.id ? 'hovered' : ''}`}
                  style={{ display: (video.thumbnail && video.thumbnail.trim() !== '') ? 'none' : 'flex' }}
                >
                  {hoveredVideo === video.id && (
                    <div className="play-overlay">
                      <Play size={32} fill="currentColor" />
                    </div>
                  )}
                  {hoveredVideo !== video.id && (
                    <Play size={32} fill="currentColor" />
                  )}
                </div>
                <div className="video-duration">
                  {formatTime(video.duration)}
                </div>
                {video.isNew && <span className="new-badge">New</span>}
              </div>

              <div className="video-info">
                <h3 className="video-title" title={video.title}>
                  {video.title}
                </h3>
                <div className="video-meta">
                  <span className="channel-name">{video.channelName || 'Admin'}</span>
                  <span className="separator">•</span>
                  <span className="views">{formatNumber(video.views || 0)} views</span>
                  <span className="separator">•</span>
                  <span className="time-ago">{getTimeAgo(video.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="load-more-container">
            <button
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="empty-state">
            <p>No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

