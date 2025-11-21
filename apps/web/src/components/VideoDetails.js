import React, { useState } from 'react';
import './VideoDetails.css';
import { ThumbsUp, ThumbsDown, Share2, Download, Scissors, MoreVertical, CheckCircle2, Copy, Link2, Facebook, Twitter } from 'lucide-react';

const VideoDetails = () => {
  const [likes, setLikes] = useState(177000);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullDescription = `Watch Sri Venkateswara Suprabhatham with lyrics sung by the legendary MS Subbulakshmi.

Label: Saregama India Limited, A RPSG Group Company

To buy the original and virus free track, visit www.saregama.com

Follow us on social media for more updates
Facebook: http://www.facebook.com/Saregamatelugu
Twitter: https://twitter.com/saregamasouth

#mssubbulakshmi #SriVenkateswaraSuprabhatham #saregamatelugu`;

  const shortDescription = `Watch Sri Venkateswara Suprabhatham with lyrics sung by the legendary MS Subbulakshmi.

Label: Saregama India Limited, A RPSG Group Company`;

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
      if (isDisliked) {
        setIsDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    }
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleShare = (method) => {
    const url = window.location.href;
    const title = 'MS Subbulakshmi Sri Venkateswara Suprabhatham | Lyrical Video';
    
    switch(method) {
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShowShareMenu(false);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        setShowShareMenu(false);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        setShowShareMenu(false);
        break;
      default:
        setShowShareMenu(false);
    }
  };

  const handleDownload = () => {
    alert('Download feature - In a real app, this would initiate video download');
  };

  const handleClip = () => {
    alert('Clip feature - In a real app, this would open clip creation tool');
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
        MS Subbulakshmi Sri Venkateswara Suprabhatham | Lyrical Video
      </h1>
      
      <div className="video-metadata">
        <div className="video-stats">
          <span className="view-count">48M views</span>
          <span className="separator">•</span>
          <span className="upload-date">12 years ago</span>
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
                <button className="dropdown-item">Save to Watch Later</button>
                <button className="dropdown-item">Save to Playlist</button>
                <button className="dropdown-item">Report</button>
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
            <a href="#" className="channel-name" onClick={(e) => { e.preventDefault(); alert('Channel page'); }}>
              Saregama Telugu
            </a>
            <CheckCircle2 size={16} className="verified-icon" />
            <span className="subscriber-count">9.38M subscribers</span>
          </div>
          <button 
            className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
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

