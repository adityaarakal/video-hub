import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './VideoDetails.css';
import { ThumbsUp, ThumbsDown, Share2, Download, Scissors, MoreVertical, CheckCircle2, Copy, Facebook, Twitter, Clock, List } from 'lucide-react';

const VideoDetails = ({ video }) => {
  const navigate = useNavigate();
  const { user, playlists, addToPlaylist, createPlaylist } = useApp();
  const { info: showInfo, success: showSuccess, warning: showWarning, error: showError } = useToast();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylistInput, setShowCreatePlaylistInput] = useState(false);
  const [likes, setLikes] = useState(video?.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const channelName = video?.channelName || 'Admin';
  
  useEffect(() => {
    if (video) {
      setLikes(video.likes || 0);
    }
  }, [video]);
  
  const currentVideo = {
    id: video?.id,
    title: video?.title,
    channel: channelName,
    thumbnail: video?.thumbnail
  };

  const fullDescription = video?.description || 'No description available.';
  const shortDescription = video?.description?.substring(0, 200) || 'No description available.';

  const handleLike = async () => {
    if (!user) {
      showWarning('Please login to like videos', 3000);
      return;
    }
    
    if (!video?.id) return;
    
    try {
      const action = isLiked ? 'unlike' : 'like';
      const updated = await api.likeVideo(video.id, action);
      setLikes(updated.likes || 0);
      setIsLiked(!isLiked);
      if (isDisliked) {
        setIsDisliked(false);
      }
    } catch (error) {
      console.error('Failed to like video:', error);
      showError('Failed to like video', 3000);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      showWarning('Please login to dislike videos', 3000);
      return;
    }
    
    if (!video?.id) return;
    
    try {
      const action = isDisliked ? 'undislike' : 'dislike';
      await api.dislikeVideo(video.id, action);
      setIsDisliked(!isDisliked);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Failed to dislike video:', error);
      showError('Failed to dislike video', 3000);
    }
  };


  const handleSaveToPlaylist = async (playlistId) => {
    if (!user) {
      showWarning('Please login to save videos to playlists', 3000);
      navigate('/login');
      return;
    }
    
    try {
      await addToPlaylist(playlistId, currentVideo);
      const playlist = playlists.find(p => p.id === playlistId);
      showSuccess(`Added to ${playlist?.name || 'playlist'}!`, 2000);
      setShowPlaylistMenu(false);
      setShowMoreMenu(false);
    } catch (error) {
      showError('Failed to add to playlist', 3000);
    }
  };

  const handleWatchLater = async () => {
    if (!user) {
      showWarning('Please login to save videos', 3000);
      navigate('/login');
      return;
    }
    
    try {
      await addToPlaylist('watch-later', currentVideo);
      showSuccess('Added to Watch Later!', 2000);
      setShowMoreMenu(false);
    } catch (error) {
      showError('Failed to add to Watch Later', 3000);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user) {
      showWarning('Please login to create playlists', 3000);
      navigate('/login');
      return;
    }

    if (!newPlaylistName.trim()) {
      showError('Please enter a playlist name', 3000);
      return;
    }

    try {
      const newPlaylist = await createPlaylist(newPlaylistName.trim());
      if (newPlaylist) {
        showSuccess(`Playlist "${newPlaylistName}" created!`, 2000);
        setNewPlaylistName('');
        setShowCreatePlaylistInput(false);
        // Optionally add current video to new playlist
        await addToPlaylist(newPlaylist.id, currentVideo);
      }
    } catch (error) {
      showError('Failed to create playlist', 3000);
    }
  };

  const handleShare = (method) => {
    const url = window.location.href;
    const title = video?.title || 'VideoHub Video';
    
    switch(method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        showSuccess('Link copied to clipboard!', 2000);
        setTimeout(() => setCopied(false), 2000);
        setShowShareMenu(false);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        showInfo('Opening Facebook...', 2000);
        setShowShareMenu(false);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        showInfo('Opening Twitter...', 2000);
        setShowShareMenu(false);
        break;
      default:
        setShowShareMenu(false);
    }
  };

  const handleDownload = () => {
    showInfo('Download feature - In a real app, this would initiate video download', 4000);
  };

  const handleClip = () => {
    showInfo('Clip feature - In a real app, this would open clip creation tool', 4000);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="video-details">
      <h1 className="video-title">
        {video?.title || 'Video Title'}
      </h1>
      
      <div className="video-metadata">
        <div className="video-stats">
          <span className="view-count">{formatNumber(video?.views || 0)} views</span>
          <span className="separator">•</span>
          <span className="upload-date">
            {video?.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown date'}
          </span>
        </div>
        
        <div className="video-actions">
          <button 
            className={`action-button like-button ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp size={20} />
            <span>{formatNumber(likes)}</span>
          </button>
          <button 
            className={`action-button dislike-button ${isDisliked ? 'active' : ''}`}
            onClick={handleDislike}
          >
            <ThumbsDown size={20} />
          </button>
          <div className="share-menu-wrapper">
            <button 
              className="action-button"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
            {showShareMenu && (
              <div className="share-dropdown" onBlur={() => setTimeout(() => setShowShareMenu(false), 200)}>
                <button className="share-option" onClick={() => handleShare('copy')}>
                  <Copy size={18} />
                  <span>{copied ? 'Copied!' : 'Copy link'}</span>
                </button>
                <button className="share-option" onClick={() => handleShare('facebook')}>
                  <Facebook size={18} />
                  <span>Facebook</span>
                </button>
                <button className="share-option" onClick={() => handleShare('twitter')}>
                  <Twitter size={18} />
                  <span>Twitter</span>
                </button>
              </div>
            )}
          </div>
          <button className="action-button" onClick={handleDownload}>
            <Download size={20} />
            <span>Download</span>
          </button>
          <button className="action-button" onClick={handleClip}>
            <Scissors size={20} />
            <span>Clip</span>
          </button>
          <div className="more-menu-wrapper">
            <button 
              className="action-button more-button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MoreVertical size={20} />
            </button>
            {showMoreMenu && (
              <div className="more-dropdown" onBlur={() => setTimeout(() => setShowMoreMenu(false), 200)}>
                <button className="dropdown-item" onClick={handleWatchLater}>
                  <Clock size={18} />
                  <span>Save to Watch Later</span>
                </button>
                <button className="dropdown-item" onClick={() => { setShowPlaylistMenu(true); setShowMoreMenu(false); }}>
                  <List size={18} />
                  <span>Save to Playlist</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">Report</button>
              </div>
            )}
            {showPlaylistMenu && (
              <div className="playlist-dropdown" onBlur={() => setTimeout(() => setShowPlaylistMenu(false), 200)}>
                <div className="dropdown-header">Save to Playlist</div>
                {playlists.map(playlist => (
                  <button 
                    key={playlist.id}
                    className="dropdown-item"
                    onClick={() => handleSaveToPlaylist(playlist.id)}
                  >
                    <span>{playlist.name}</span>
                    <span className="playlist-count">({playlist.videos.length})</span>
                  </button>
                ))}
              <div className="dropdown-divider"></div>
              {showCreatePlaylistInput ? (
                <div className="create-playlist-input">
                  <input
                    type="text"
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newPlaylistName.trim()) {
                        handleCreatePlaylist();
                      }
                    }}
                    autoFocus
                  />
                  <div className="create-playlist-actions">
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowCreatePlaylistInput(false);
                        setNewPlaylistName('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleCreatePlaylist}
                      disabled={!newPlaylistName.trim()}
                    >
                      Create
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="dropdown-item"
                  onClick={() => setShowCreatePlaylistInput(true)}
                >
                  Create new playlist
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      
      <div className="channel-info">
        <div className="channel-avatar">
          <div className="avatar-placeholder">ST</div>
        </div>
        <div className="channel-details">
          <div className="channel-name-row">
            <span className="channel-name">
              {channelName}
            </span>
          </div>
        </div>
      </div>
      
      <div className="video-description">
        <div className={`description-text ${showDescription ? 'expanded' : ''}`}>
          {showDescription ? fullDescription : shortDescription}
          {!showDescription && (
            <>
              <br /><br />
              <span className="hashtags">#mssubbulakshmi #SriVenkateswaraSuprabhatham #saregamatelugu</span>
            </>
          )}
        </div>
        <button 
          className="show-more-button"
          onClick={() => setShowDescription(!showDescription)}
        >
          {showDescription ? 'Show less' : 'Show more'}
        </button>
      </div>
    </div>
  );
};

export default VideoDetails;

