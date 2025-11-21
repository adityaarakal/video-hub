import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './RelatedVideos.css';
import { Play } from 'lucide-react';

const RelatedVideos = ({ videoId, channelId }) => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadRelated = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        // Get videos from same channel
        const channelVideos = await api.getChannelVideos(channelId);
        if (!isMounted) return;
        
        const related = (channelVideos.videos || channelVideos || [])
          .filter(v => String(v.id) !== String(videoId))
          .slice(0, 6);
        
        if (related.length < 6) {
          // Fill with other videos if needed
          const allVideos = await api.getVideos({ limit: 20 });
          if (!isMounted) return;
          const additional = (allVideos.videos || [])
            .filter(v => String(v.id) !== String(videoId) && v.channelId !== channelId)
            .slice(0, 6 - related.length);
          setVideos([...related, ...additional]);
        } else {
          setVideos(related);
        }
      } catch (error) {
        console.error('Failed to load related videos:', error);
        setVideos([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (videoId && channelId) {
      loadRelated();
    }

    return () => {
      isMounted = false;
    };
  }, [videoId, channelId]);

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

  if (loading) {
    return (
      <div className="related-videos">
        <h3 className="related-videos-title">Related Videos</h3>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="related-videos">
      <h3 className="related-videos-title">Related Videos</h3>
      <div className="related-videos-grid">
        {videos.map(video => (
          <div
            key={video.id}
            className="related-video-card"
            onClick={() => navigate(`/watch?v=${video.id}`)}
          >
            <div className="related-video-thumbnail">
              {video.thumbnail && video.thumbnail.trim() !== '' ? (
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
              <div className="thumbnail-placeholder" style={{ display: (video.thumbnail && video.thumbnail.trim() !== '') ? 'none' : 'flex' }}>
                <Play size={24} />
              </div>
              <div className="related-video-duration">
                {video.duration ? formatTime(video.duration) : '0:00'}
              </div>
            </div>
            <div className="related-video-info">
              <h4 className="related-video-title">{video.title}</h4>
              <p className="related-video-channel">{video.channelName}</p>
              <div className="related-video-meta">
                <span>{formatNumber(video.views || 0)} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;

