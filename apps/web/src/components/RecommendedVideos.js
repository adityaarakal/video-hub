import React, { useState } from 'react';
import './RecommendedVideos.css';
import { Play } from 'lucide-react';

const RecommendedVideos = () => {
  const [hoveredVideo, setHoveredVideo] = useState(null);

  const videos = [
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
    console.log('Video clicked:', videoId);
    // In a real app, this would navigate to the video page
    alert(`Loading video ${videoId}...`);
  };

  const handleChannelClick = (e, channelName) => {
    e.stopPropagation();
    console.log('Channel clicked:', channelName);
    alert(`Opening channel: ${channelName}`);
  };

  const handleQuickVideoClick = (videoId) => {
    console.log('Quick video clicked:', videoId);
    alert(`Loading quick video ${videoId}...`);
  };

  return (
    <div className="recommended-videos">
      {videos.map(video => (
        <div 
          key={video.id} 
          className="video-card"
          onClick={() => handleVideoClick(video.id)}
          onMouseEnter={() => setHoveredVideo(video.id)}
          onMouseLeave={() => setHoveredVideo(null)}
        >
          <div className="video-thumbnail">
            <div className={`thumbnail-placeholder ${hoveredVideo === video.id ? 'hovered' : ''}`}>
              {hoveredVideo === video.id && (
                <div className="play-overlay">
                  <Play size={32} fill="currentColor" />
                </div>
              )}
              {hoveredVideo !== video.id && (
                <Play size={32} fill="currentColor" />
              )}
            </div>
            <div className="video-duration">{video.duration}</div>
            {video.isNew && <span className="new-badge">New</span>}
          </div>
          <div className="video-info">
            <h3 className="video-title">{video.title}</h3>
            <div 
              className="video-channel"
              onClick={(e) => handleChannelClick(e, video.channel)}
            >
              {video.channel}
            </div>
            <div className="video-meta">
              <span>{video.views}</span>
              <span className="separator">•</span>
              <span>{video.timeAgo}</span>
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

