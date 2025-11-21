import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('videohub_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [watchHistory, setWatchHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('videohub_preferences');
    return saved ? JSON.parse(saved) : {
      autoplay: false,
      quality: 'HD',
      playbackSpeed: 1,
      theme: 'dark'
    };
  });

  const [currentVideo, setCurrentVideo] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user data from backend on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadUserData = async () => {
      if (!user || !isMounted) return;

      try {
        // Load watch history
        const historyData = await api.getWatchHistory(user.id);
        if (!isMounted) return;
        setWatchHistory(historyData.history || []);

        // Load playlists
        const playlistsData = await api.getPlaylists(user.id);
        if (!isMounted) return;
        setPlaylists(playlistsData.playlists || []);

        // Load subscriptions
        const subsData = await api.getUserSubscriptions(user.id);
        setSubscriptions(subsData.subscriptions || []);
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    loadUserData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user ID, not the whole user object

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('videohub_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  const addToHistory = async (video) => {
    if (!user) return;
    
    try {
      await api.addToWatchHistory(user.id, {
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnail
      });
      
      // Update local state
      const historyData = await api.getWatchHistory(user.id);
      setWatchHistory(historyData.history || []);
    } catch (error) {
      console.error('Failed to add to history:', error);
    }
  };

  const addToPlaylist = async (playlistId, video) => {
    if (!user) return;
    
    try {
      await api.addVideoToPlaylist(playlistId, {
        videoId: video.id,
        videoTitle: video.title,
        videoThumbnail: video.thumbnail
      });
      
      // Update local state
      const playlistsData = await api.getPlaylists(user.id);
      setPlaylists(playlistsData.playlists || []);
    } catch (error) {
      console.error('Failed to add to playlist:', error);
    }
  };

  const removeFromPlaylist = async (playlistId, videoId) => {
    if (!user) return;
    
    try {
      await api.removeVideoFromPlaylist(playlistId, videoId);
      
      // Update local state
      const playlistsData = await api.getPlaylists(user.id);
      setPlaylists(playlistsData.playlists || []);
    } catch (error) {
      console.error('Failed to remove from playlist:', error);
    }
  };

  const createPlaylist = async (name) => {
    if (!user) return null;
    
    try {
      const newPlaylist = await api.createPlaylist({
        name,
        userId: user.id,
        description: ''
      });
      
      // Update local state
      const playlistsData = await api.getPlaylists(user.id);
      setPlaylists(playlistsData.playlists || []);
      
      return newPlaylist;
    } catch (error) {
      console.error('Failed to create playlist:', error);
      return null;
    }
  };

  const subscribe = async (channelId, channelName) => {
    if (!user) return;
    
    try {
      await api.subscribeToChannel(channelId, user.id);
      
      // Update local state
      const subsData = await api.getUserSubscriptions(user.id);
      setSubscriptions(subsData.subscriptions || []);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const unsubscribe = async (channelId) => {
    if (!user) return;
    
    try {
      await api.unsubscribeFromChannel(channelId, user.id);
      
      // Update local state
      const subsData = await api.getUserSubscriptions(user.id);
      setSubscriptions(subsData.subscriptions || []);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const updatePreferences = (prefs) => {
    setUserPreferences(prev => ({ ...prev, ...prefs }));
  };

  const searchVideos = async (query) => {
    setIsLoading(true);
    try {
      const results = await api.search(query, 'videos', 20);
      const videos = results.results?.videos || [];
      setSearchResults(videos);
      setIsLoading(false);
      return videos;
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setIsLoading(false);
      return [];
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('videohub_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setWatchHistory([]);
    setPlaylists([]);
    setSubscriptions([]);
    localStorage.removeItem('videohub_user');
    api.logout();
  };

  const value = {
    user,
    watchHistory,
    playlists,
    subscriptions,
    userPreferences,
    currentVideo,
    searchResults,
    isLoading,
    setCurrentVideo,
    addToHistory,
    addToPlaylist,
    removeFromPlaylist,
    createPlaylist,
    subscribe,
    unsubscribe,
    updatePreferences,
    searchVideos,
    setSearchResults,
    login,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

