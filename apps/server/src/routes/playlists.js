const express = require('express');
const router = express.Router();
const Database = require('../utils/database');

const playlistDb = new Database('playlists');

// GET /api/playlists - Get playlists for a user
router.get('/', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const playlists = playlistDb.findBy('userId', userId);
    res.json({ playlists, total: playlists.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/playlists/:id - Get playlist by ID
router.get('/:id', (req, res) => {
  try {
    const playlist = playlistDb.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/playlists - Create new playlist
router.post('/', (req, res) => {
  try {
    const { name, userId, description } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'name and userId are required' });
    }

    const playlist = playlistDb.create({
      name,
      userId,
      description: description || '',
      videos: [],
      createdAt: new Date().toISOString()
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/playlists/initialize - Initialize default playlists for user
router.post('/initialize', (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if default playlists already exist
    const existingPlaylists = playlistDb.findBy('userId', userId);
    const hasWatchLater = existingPlaylists.some(p => p.name === 'Watch Later');
    const hasFavorites = existingPlaylists.some(p => p.name === 'Favorites');

    const created = [];

    if (!hasWatchLater) {
      const watchLater = playlistDb.create({
        id: `watch-later-${userId}`,
        name: 'Watch Later',
        userId,
        description: 'Videos you want to watch later',
        videos: [],
        createdAt: new Date().toISOString()
      });
      created.push(watchLater);
    }

    if (!hasFavorites) {
      const favorites = playlistDb.create({
        id: `favorites-${userId}`,
        name: 'Favorites',
        userId,
        description: 'Your favorite videos',
        videos: [],
        createdAt: new Date().toISOString()
      });
      created.push(favorites);
    }

    res.json({ playlists: created, message: 'Default playlists initialized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/playlists/:id - Update playlist
router.put('/:id', (req, res) => {
  try {
    const playlist = playlistDb.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const updates = req.body;
    const updated = playlistDb.update(playlist.id, updates);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', (req, res) => {
  try {
    const playlist = playlistDb.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlistDb.delete(playlist.id);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/playlists/:id/videos - Add video to playlist
router.post('/:id/videos', (req, res) => {
  try {
    const playlist = playlistDb.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const { videoId, videoTitle, videoThumbnail } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const videos = playlist.videos || [];
    
    // Check if video already in playlist
    if (videos.find(v => v.id === videoId)) {
      return res.status(400).json({ error: 'Video already in playlist' });
    }

    videos.push({
      id: videoId,
      title: videoTitle || '',
      thumbnail: videoThumbnail || '',
      addedAt: new Date().toISOString()
    });

    const updated = playlistDb.update(playlist.id, { videos });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/playlists/:id/videos/:videoId - Remove video from playlist
router.delete('/:id/videos/:videoId', (req, res) => {
  try {
    const playlist = playlistDb.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const videos = (playlist.videos || []).filter(v => v.id !== req.params.videoId);
    
    if (videos.length === playlist.videos.length) {
      return res.status(404).json({ error: 'Video not found in playlist' });
    }

    const updated = playlistDb.update(playlist.id, { videos });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

