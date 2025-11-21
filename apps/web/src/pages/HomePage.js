import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Play, Clock, TrendingUp, Sparkles, Zap, Eye } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const observerRef = useRef(null);

  useEffect(() => {
    loadVideos();
  }, [page]);

  useEffect(() => {
    // Auto-rotate featured videos
    if (trendingVideos.length > 0) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % Math.min(trendingVideos.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [trendingVideos]);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [videos]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getVideos({ page, limit: 20 });
      
      // Sort videos by views for trending
      const sortedVideos = [...(response.videos || [])].sort((a, b) => (b.views || 0) - (a.views || 0));
      
      if (page === 1) {
        setVideos(response.videos || []);
        setTrendingVideos(sortedVideos.slice(0, 5));
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

  const handleVideoClick = (videoId) => {
    navigate(`/watch?v=${videoId}`);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const featuredVideo = trendingVideos[featuredIndex];

  if (loading && videos.length === 0) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing content...</p>
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
      {/* Hero Section */}
      {featuredVideo && (
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <TrendingUp size={16} />
              <span>Trending Now</span>
            </div>
            <h1 className="hero-title">{featuredVideo.title}</h1>
            <p className="hero-description">
              {featuredVideo.description?.substring(0, 150) || 'Watch this amazing video'}
              {featuredVideo.description?.length > 150 ? '...' : ''}
            </p>
            <div className="hero-stats">
              <div className="hero-stat">
                <Eye size={18} />
                <span>{formatNumber(featuredVideo.views || 0)} views</span>
              </div>
              <div className="hero-stat">
                <Clock size={18} />
                <span>{getTimeAgo(featuredVideo.createdAt)}</span>
              </div>
            </div>
            <button
              className="hero-play-button"
              onClick={() => handleVideoClick(featuredVideo.id)}
            >
              <Play size={24} fill="currentColor" />
              <span>Watch Now</span>
            </button>
          </div>
          <div
            className="hero-thumbnail"
            onClick={() => handleVideoClick(featuredVideo.id)}
            onMouseEnter={() => setHoveredVideo(`hero-${featuredVideo.id}`)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {featuredVideo.thumbnail && featuredVideo.thumbnail.trim() !== '' ? (
              <img src={featuredVideo.thumbnail} alt={featuredVideo.title} />
            ) : (
              <div className="hero-placeholder">
                <Play size={64} fill="currentColor" />
              </div>
            )}
            {hoveredVideo === `hero-${featuredVideo.id}` && (
              <div className="hero-play-overlay">
                <Play size={48} fill="currentColor" />
              </div>
            )}
            <div className="hero-indicators">
              {trendingVideos.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  className={`hero-indicator ${index === featuredIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFeaturedIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="home-container">
        {/* Trending Section */}
        {trendingVideos.length > 0 && (
          <section className="section trending-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <TrendingUp size={24} className="section-icon" />
                <h2 className="section-title">Trending Videos</h2>
              </div>
              <Sparkles size={20} className="sparkle-icon" />
            </div>
            <div className="trending-grid">
              {trendingVideos.slice(1, 5).map((video, index) => (
                <div
                  key={video.id}
                  className="trending-card"
                  onClick={() => handleVideoClick(video.id)}
                  onMouseEnter={() => setHoveredVideo(`trending-${video.id}`)}
                  onMouseLeave={() => setHoveredVideo(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="trending-number">{index + 2}</div>
                  <div className="trending-thumbnail">
                    {video.thumbnail && video.thumbnail.trim() !== '' ? (
                      <img src={video.thumbnail} alt={video.title} />
                    ) : (
                      <div className="trending-placeholder">
                        <Play size={24} />
                      </div>
                    )}
                    <div className="trending-duration">{formatTime(video.duration)}</div>
                  </div>
                  <div className="trending-info">
                    <h3 className="trending-title">{video.title}</h3>
                    <div className="trending-meta">
                      <span>{formatNumber(video.views || 0)} views</span>
                      <span>•</span>
                      <span>{getTimeAgo(video.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Videos Section */}
        <section className="section all-videos-section" ref={observerRef}>
          <div className="section-header">
            <div className="section-title-wrapper">
              <Zap size={24} className="section-icon" />
              <h2 className="section-title">All Videos</h2>
            </div>
          </div>

          <div className="videos-grid">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="video-card"
                onClick={() => handleVideoClick(video.id)}
                onMouseEnter={() => setHoveredVideo(video.id)}
                onMouseLeave={() => setHoveredVideo(null)}
                style={{ animationDelay: `${(index % 12) * 0.05}s` }}
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
                        <Play size={40} fill="currentColor" />
                      </div>
                    )}
                    {hoveredVideo !== video.id && (
                      <Play size={40} fill="currentColor" />
                    )}
                  </div>
                  {hoveredVideo === video.id && video.thumbnail && (
                    <div className="video-hover-overlay">
                      <Play size={48} fill="currentColor" />
                    </div>
                  )}
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
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Load More Videos
                  </>
                )}
              </button>
            </div>
          )}

          {!loading && videos.length === 0 && (
            <div className="empty-state">
              <Sparkles size={48} />
              <p>No videos available</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
