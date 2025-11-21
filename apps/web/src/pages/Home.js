import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import VideoDetails from '../components/VideoDetails';
import CommentsSection from '../components/CommentsSection';
import RecommendedVideos from '../components/RecommendedVideos';

const Home = () => {
  const [searchParams] = useSearchParams();
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
      
      try {
        // Get video ID from URL or use default
        const videoId = searchParams.get('v') || '1';
        const videoData = await api.getVideo(videoId);
        
        if (!isMounted) return;
        
        if (!videoData) {
          throw new Error('Video not found');
        }
        
        // Check if response has error property
        if (videoData.error) {
          throw new Error(videoData.error);
        }
        
        setVideo(videoData);
        setCurrentVideo(videoData);
        setError(null);
        
        // Add to watch history if user is logged in
        if (user && videoData.id) {
          try {
            await addToHistory({
              id: videoData.id,
              title: videoData.title,
              thumbnail: videoData.thumbnail
            });
          } catch (historyErr) {
            // Don't fail video load if history fails
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
            showError('Loaded first available video', 2000);
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
  }, [searchParams.get('v'), user?.id]); // Only depend on actual values, not functions

  if (loading) {
    return (
      <div className="watch-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="watch-container">
        <div className="error-container">
          <p>{error || 'Video not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-container">
      <div className="primary-column">
        <VideoPlayer video={video} />
        <VideoDetails video={video} />
        <CommentsSection videoId={video.id} />
      </div>
      <div className="secondary-column">
        <RecommendedVideos currentVideoId={video.id} />
      </div>
    </div>
  );
};

export default Home;

