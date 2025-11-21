const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const { validateSearch, asyncHandler } = require('../middleware/validation');

// GET /api/search - Search videos, channels, playlists
router.get('/', validateSearch, asyncHandler(async (req, res) => {
  const { q, type = 'all', limit = 20, offset = 0, page = 1 } = req.query;

    const query = q.toLowerCase().trim();
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = parseInt(offset) || (pageNum - 1) * limitNum;
    
    const results = {
      videos: [],
      channels: [],
      playlists: []
    };

    if (type === 'all' || type === 'videos') {
      const videoDb = new Database('videos');
      const videos = await videoDb.getAll();
      
      const filteredVideos = videos.filter(video => {
        const titleMatch = video.title?.toLowerCase().includes(query);
        const descMatch = video.description?.toLowerCase().includes(query);
        const tagMatch = video.tags?.some(tag => tag.toLowerCase().includes(query));
        const channelMatch = video.channelName?.toLowerCase().includes(query);
        
        return titleMatch || descMatch || tagMatch || channelMatch;
      });
      
      results.videos = filteredVideos.slice(offsetNum, offsetNum + limitNum);
    }

    if (type === 'all' || type === 'channels') {
      const channelDb = new Database('channels');
      const channels = await channelDb.getAll();
      
      const filteredChannels = channels.filter(channel => {
        const nameMatch = channel.name?.toLowerCase().includes(query);
        const descMatch = channel.description?.toLowerCase().includes(query);
        
        return nameMatch || descMatch;
      });
      
      results.channels = filteredChannels.slice(offsetNum, offsetNum + limitNum);
    }

    if (type === 'all' || type === 'playlists') {
      const playlistDb = new Database('playlists');
      const playlists = await playlistDb.getAll();
      
      const filteredPlaylists = playlists.filter(playlist => {
        const nameMatch = playlist.name?.toLowerCase().includes(query);
        const descMatch = playlist.description?.toLowerCase().includes(query);
        
        return nameMatch || descMatch;
      });
      
      results.playlists = filteredPlaylists.slice(offsetNum, offsetNum + limitNum);
    }

    const total = results.videos.length + results.channels.length + results.playlists.length;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      query: q,
      results,
      total,
      limit: limitNum,
      offset: offsetNum,
      page: pageNum,
      totalPages,
      hasMore: offsetNum + limitNum < total
    });
}));

module.exports = router;

