const express = require('express');
const router = express.Router();
const Database = require('../utils/database');

// GET /api/search - Search videos, channels, playlists
router.get('/', (req, res) => {
  try {
    const { q, type = 'all', limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const query = q.toLowerCase().trim();
    const results = {
      videos: [],
      channels: [],
      playlists: []
    };

    if (type === 'all' || type === 'videos') {
      const videoDb = new Database('videos');
      const videos = videoDb.getAll();
      
      results.videos = videos.filter(video => {
        const titleMatch = video.title?.toLowerCase().includes(query);
        const descMatch = video.description?.toLowerCase().includes(query);
        const tagMatch = video.tags?.some(tag => tag.toLowerCase().includes(query));
        const channelMatch = video.channelName?.toLowerCase().includes(query);
        
        return titleMatch || descMatch || tagMatch || channelMatch;
      }).slice(0, parseInt(limit));
    }

    if (type === 'all' || type === 'channels') {
      const channelDb = new Database('channels');
      const channels = channelDb.getAll();
      
      results.channels = channels.filter(channel => {
        const nameMatch = channel.name?.toLowerCase().includes(query);
        const descMatch = channel.description?.toLowerCase().includes(query);
        
        return nameMatch || descMatch;
      }).slice(0, parseInt(limit));
    }

    if (type === 'all' || type === 'playlists') {
      const playlistDb = new Database('playlists');
      const playlists = playlistDb.getAll();
      
      results.playlists = playlists.filter(playlist => {
        const nameMatch = playlist.name?.toLowerCase().includes(query);
        const descMatch = playlist.description?.toLowerCase().includes(query);
        
        return nameMatch || descMatch;
      }).slice(0, parseInt(limit));
    }

    const total = results.videos.length + results.channels.length + results.playlists.length;

    res.json({
      query: q,
      results,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

