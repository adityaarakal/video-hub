import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Play, CheckCircle2, Bell, BellOff } from 'lucide-react';
import './Channel.css';

const Channel = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { user, subscribe, unsubscribe } = useApp();
  const { success: showSuccess, info: showInfo, warning: showWarning } = useToast();
  const [activeTab, setActiveTab] = useState('videos');
  const [channelInfo, setChannelInfo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChannel = async () => {
      setLoading(true);
      try {
        const channel = await api.getChannel(channelId);
        setChannelInfo(channel);
        
        // Check subscription status
        if (user) {
          try {
            const subStatus = await api.checkSubscription(channelId, user.id);
            setIsSubscribed(subStatus.subscribed || false);
          } catch (error) {
            console.error('Failed to check subscription:', error);
          }
        }

        // Load channel videos
        const videosData = await api.getChannelVideos(channelId);
        setVideos(videosData.videos || []);
      } catch (error) {
        console.error('Failed to load channel:', error);
      } finally {
        setLoading(false);
      }
    };

    if (channelId) {
      loadChannel();
    }
  }, [channelId, user]);

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

  if (loading || !channelInfo) {
    return (
      <div className="channel-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    if (!user) {
      showWarning('Please login to subscribe', 3000);
      navigate('/login');
      return;
    }
    
    try {
      if (isSubscribed) {
        await unsubscribe(channelInfo.id);
        setIsSubscribed(false);
        showInfo(`Unsubscribed from ${channelInfo.name}`, 2000);
      } else {
        await subscribe(channelInfo.id, channelInfo.name);
        setIsSubscribed(true);
        showSuccess(`Subscribed to ${channelInfo.name}!`, 2000);
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleVideoClick = (videoId) => {
    navigate(`/?v=${videoId}`);
  };

  return (
    <div className="channel-page">
      <div className="channel-banner">
        <div className="channel-banner-placeholder"></div>
      </div>
      <div className="channel-container">
        <div className="channel-header">
          <div className="channel-avatar-large">
            <div className="avatar-placeholder-large">ST</div>
          </div>
          <div className="channel-info-section">
            <div className="channel-name-row-large">
              <h1>{channelInfo.name}</h1>
              {channelInfo.isVerified && <CheckCircle2 size={20} className="verified-icon" />}
            </div>
            <div className="channel-stats">
              <span>{formatNumber(channelInfo.subscribers || 0)} subscribers</span>
              <span className="separator">•</span>
              <span>{videos.length} videos</span>
            </div>
            <button 
              className={`channel-subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? (
                <>
                  <BellOff size={18} />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <Bell size={18} />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="channel-tabs">
          <button 
            className={`channel-tab ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button 
            className={`channel-tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
          <button 
            className={`channel-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div className="channel-content">
          {activeTab === 'videos' && (
            <div className="channel-videos-grid">
              {videos.map(video => (
                <div 
                  key={video.id} 
                  className="channel-video-card"
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div className="channel-video-thumbnail">
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
                      <Play size={32} fill="currentColor" />
                    </div>
                    <span className="video-duration">
                      {video.duration ? (typeof video.duration === 'number' ? formatTime(video.duration) : video.duration) : '0:00'}
                    </span>
                  </div>
                  <h3 className="channel-video-title">{video.title}</h3>
                  <div className="channel-video-meta">
                    <span>{typeof video.views === 'number' ? formatNumber(video.views) + ' views' : video.views}</span>
                    <span className="separator">•</span>
                    <span>{video.createdAt ? getTimeAgo(video.createdAt) : video.timeAgo || 'Unknown'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="channel-playlists">
              <p className="empty-state">No playlists available</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="channel-about">
              <p>{channelInfo.description}</p>
              <div className="channel-details">
                <h3>Channel Details</h3>
                <p><strong>Subscribers:</strong> {formatNumber(channelInfo.subscribers || 0)}</p>
                <p><strong>Total Videos:</strong> {videos.length}</p>
                <p><strong>Joined:</strong> January 2010</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;

