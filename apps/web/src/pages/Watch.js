import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import VideoDetails from '../components/VideoDetails';
import CommentsSection from '../components/CommentsSection';
import RelatedVideos from '../components/RelatedVideos';
import RecommendedVideos from '../components/RecommendedVideos';
import './Watch.css';

const Watch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentVideo, addToHistory, user } = useApp();
  const { error: showError } = useToast();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadVideo = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      const videoId = searchParams.get('v');
      
      if (!videoId) {
        setError('No video specified');
        setLoading(false);
        navigate('/');
        return;
      }
      
      try {
        const videoData = await api.getVideo(videoId);
        
        if (!isMounted) return;
        
        if (!videoData) {
          throw new Error('Video not found');
        }
        
        if (videoData.error) {
          throw new Error(videoData.error);
        }
        
        setVideo(videoData);
        setCurrentVideo(videoData);
        setError(null);
        
        if (user && videoData.id) {
          try {
            await addToHistory({
              id: videoData.id,
              title: videoData.title,
              thumbnail: videoData.thumbnail
            });
          } catch (historyErr) {
            console.error('Failed to add to history:', historyErr);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Failed to load video:', err);
        const errorMessage = err.message || 'Failed to load video. Please check your connection.';
        setError(errorMessage);
        showError(errorMessage, 4000);
        
        // Try to load first available video as fallback
        try {
          const videosResponse = await api.getVideos({ limit: 1 });
          if (!isMounted) return;
          
          if (videosResponse && videosResponse.videos && videosResponse.videos.length > 0) {
            const fallbackVideo = videosResponse.videos[0];
            setVideo(fallbackVideo);
            setCurrentVideo(fallbackVideo);
            setError(null);
            navigate(`/watch?v=${fallbackVideo.id}`, { replace: true });
          }
        } catch (fallbackErr) {
          console.error('Failed to load fallback video:', fallbackErr);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadVideo();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('v'), user?.id]);

  if (loading) {
    return (
      <div className="watch-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="watch-page">
        <div className="error-container">
          <p>{error || 'Video not found'}</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-container">
        <div className="primary-column">
          <VideoPlayer video={video} />
          <VideoDetails video={video} />
          <CommentsSection videoId={video.id} />
          <RelatedVideos videoId={video.id} channelId={video.channelId} />
        </div>
        <div className="secondary-column">
          <RecommendedVideos currentVideoId={video.id} />
        </div>
      </div>
    </div>
  );
};

export default Watch;

