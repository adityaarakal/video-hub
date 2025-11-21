import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RecommendedVideos.css';
import { Play } from 'lucide-react';

const RecommendedVideos = ({ currentVideoId }) => {
  const navigate = useNavigate();
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState(null);
  const previewTimeoutRef = React.useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadRecommended = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        const videoId = currentVideoId || '1';
        const data = await api.getRecommendedVideos(videoId, 10);
        
        if (!isMounted) return;
        
        const videoList = Array.isArray(data?.videos) ? data.videos : (Array.isArray(data) ? data : []);
        
        if (videoList.length > 0) {
          setVideos(videoList);
        } else {
          // If no recommended videos, get all videos except current
          const allVideosResponse = await api.getVideos({ limit: 20 });
          if (!isMounted) return;
          const allVideos = allVideosResponse?.videos || [];
          const filteredVideos = allVideos.filter(v => String(v.id) !== String(videoId));
          setVideos(filteredVideos.slice(0, 10));
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Failed to load recommended videos:', error);
        // Fallback to all videos if recommended fails
        try {
          const allVideos = await api.getVideos({ limit: 10 });
          if (!isMounted) return;
          console.log('Fallback: Loaded all videos:', allVideos?.videos?.length || 0);
          setVideos(allVideos?.videos || []);
        } catch (err) {
          console.error('Failed to load videos:', err);
          // Use hardcoded videos as last resort
          setVideos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRecommended();
    
    return () => {
      isMounted = false;
    };
  }, [currentVideoId]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  const formatTime = (seconds) => {
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

  const hardcodedVideos = [
    {
      id: 1,
      thumbnail: '',
      title: 'Vishnusahasranamam with Telugu Lyrics | DEVOTIONAL STOTRAS | BHAKTHI LYRICS',
      channel: 'THE DIVINE - DEVOTIONAL LYRICS',
      views: '52M views',
      timeAgo: '8 years ago',
      duration: '32:37'
    },
    {
      id: 2,
      thumbnail: 'https://i.ytimg.com/vi/example2/maxresdefault.jpg',
      title: 'Top 10 Morning Stotram - M.S. Subbulakshmi | Start Your Day with Divine...',
      channel: 'Saregama Carnatic Classical',
      views: '891K views',
      timeAgo: '6 months ago',
      duration: '1:39:33'
    },
    {
      id: 3,
      thumbnail: 'https://i.ytimg.com/vi/example3/maxresdefault.jpg',
      title: 'గోవింద నామాలు ఒక్కసారి వింటే మీ అప్పులు అన్ని తొలగిపోతాయి | Govinda Namalu With...',
      channel: 'Omkaram - ఓంకారం',
      views: '1.1M views',
      timeAgo: '2 months ago',
      duration: '1:01:57'
    },
    {
      id: 4,
      thumbnail: 'https://i.ytimg.com/vi/example4/maxresdefault.jpg',
      title: 'Powerful 1 Hour Maha Mrityunjaya Mantra | #shiva ...',
      channel: 'Tirumala Vaibhavam',
      views: '76K views',
      timeAgo: '2 months ago',
      duration: '1:01:51'
    },
    {
      id: 5,
      thumbnail: 'https://i.ytimg.com/vi/example5/maxresdefault.jpg',
      title: 'మణిద్వీప వర్ణన|| Divine Mani Dweepa Stotram | Powerful ...',
      channel: 'Blessful Mornings',
      views: '21K views',
      timeAgo: '4 days ago',
      duration: '15:16',
      isNew: true
    },
    {
      id: 6,
      thumbnail: 'https://i.ytimg.com/vi/example6/maxresdefault.jpg',
      title: 'లింగాష్టకం - శివాష్టకం - విశ్వనాధాష్టకం - బిల్వాష్టకం - ...',
      channel: 'THE DIVINE - DEVOTIONAL LYRICS',
      views: '426K views',
      timeAgo: '1 year ago',
      duration: '51:23'
    },
    {
      id: 7,
      thumbnail: 'https://i.ytimg.com/vi/example7/maxresdefault.jpg',
      title: 'Rudram Namakam With Lyrics | Powerful Lord Shiva Stotras | ...',
      channel: 'Rajshri Soul',
      views: '13M views',
      timeAgo: '7 years ago',
      duration: '1:01:51'
    }
  ];

  const quickVideos = [
    { id: 1, title: 'Sri Venkatesw...', views: '3.6M views' },
    { id: 2, title: 'Vishnu Sahasrana...', views: '787K views' },
    { id: 3, title: 'Venkateswar a ...', views: '255K views' }
  ];

  const handleVideoClick = (videoId) => {
    navigate(`/?v=${videoId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChannelClick = (e, channelId, channelName) => {
    e.stopPropagation();
    navigate(`/channel/${channelId}`);
  };

  const handleQuickVideoClick = (videoId) => {
    navigate(`/?v=${videoId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="recommended-videos">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Always show videos from API if available, otherwise fallback to hardcoded
  const displayVideos = videos.length > 0 ? videos : hardcodedVideos;
  
  // Debug logging
  if (displayVideos.length === 0) {
    console.warn('No videos to display! Videos state:', videos, 'Hardcoded:', hardcodedVideos.length);
  }

  return (
    <div className="recommended-videos">
      {displayVideos.length === 0 && !loading && (
        <div style={{ padding: '20px', color: '#a5b4fc', textAlign: 'center' }}>
          No videos available. Please check your connection.
        </div>
      )}
      {displayVideos.map(video => (
        <div 
          key={video.id} 
          className="video-card"
          onClick={() => handleVideoClick(video.id)}
          onMouseEnter={() => {
            setHoveredVideo(video.id);
            previewTimeoutRef.current = setTimeout(() => {
              setPreviewVideo(video);
            }, 500);
          }}
          onMouseLeave={() => {
            setHoveredVideo(null);
            if (previewTimeoutRef.current) {
              clearTimeout(previewTimeoutRef.current);
            }
            setTimeout(() => setPreviewVideo(null), 200);
          }}
        >
          <div className="video-thumbnail">
            {video.thumbnail ? (
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="thumbnail-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`thumbnail-placeholder ${hoveredVideo === video.id ? 'hovered' : ''}`}
              style={{ display: video.thumbnail ? 'none' : 'flex' }}
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
              {video.duration ? (typeof video.duration === 'number' ? formatTime(video.duration) : video.duration) : '0:00'}
            </div>
            {video.isNew && <span className="new-badge">New</span>}
          </div>
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
            <div 
              className="video-channel"
              onClick={(e) => handleChannelClick(e, video.channelId || `channel-${video.id}`, video.channelName || video.channel)}
            >
              {video.channelName || video.channel}
            </div>
            <div className="video-meta">
              <span>{typeof video.views === 'number' ? formatNumber(video.views) + ' views' : video.views}</span>
              <span className="separator">•</span>
              <span>{video.createdAt ? getTimeAgo(video.createdAt) : video.timeAgo || 'Unknown'}</span>
            </div>
          </div>
        </div>
      ))}
      
      <div className="quick-videos-section">
        <h3 className="quick-videos-title">Quick Videos</h3>
        <div className="quick-videos-grid">
          {quickVideos.map(video => (
            <div 
              key={video.id} 
              className="quick-video-card"
              onClick={() => handleQuickVideoClick(video.id)}
              onMouseEnter={() => setHoveredVideo(`quick-${video.id}`)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <div className="quick-video-thumbnail">
                <div className={`thumbnail-placeholder quick-video ${hoveredVideo === `quick-${video.id}` ? 'hovered' : ''}`}>
                  {hoveredVideo === `quick-${video.id}` && (
                    <div className="play-overlay">
                      <Play size={24} fill="currentColor" />
                    </div>
                  )}
                  {hoveredVideo !== `quick-${video.id}` && (
                    <Play size={24} fill="currentColor" />
                  )}
                </div>
              </div>
              <div className="quick-video-title">{video.title}</div>
              <div className="quick-video-views">{video.views}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedVideos;

