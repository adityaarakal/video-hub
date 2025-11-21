const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const { validateVideo, validatePagination, asyncHandler } = require('../middleware/validation');

const videoDb = new Database('videos');

// GET /api/videos - Get all videos
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { channelId, limit = 20, offset = 0, page = 1 } = req.query;
  let videos = videoDb.getAll();

  if (channelId) {
    videos = videos.filter(v => v.channelId === channelId);
  }

  // Sort by createdAt (newest first)
  videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calculate pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offsetNum = parseInt(offset) || (pageNum - 1) * limitNum;
  const total = videos.length;
  const totalPages = Math.ceil(total / limitNum);
  
  // Apply pagination
  const paginated = videos.slice(offsetNum, offsetNum + limitNum);

  res.json({
    videos: paginated,
    total,
    limit: limitNum,
    offset: offsetNum,
    page: pageNum,
    totalPages,
    hasMore: offsetNum + limitNum < total
  });
}));

// GET /api/videos/recommended - Get recommended videos (MUST come before /:id route)
router.get('/recommended', (req, res) => {
  try {
    const { videoId, limit = 10 } = req.query;
    let videos = videoDb.getAll();

    // If videoId provided, exclude it and get videos from same channel or similar
    if (videoId) {
      const currentVideo = videoDb.findById(videoId);
      if (currentVideo) {
        // Get videos from same channel first, then others
        const sameChannel = videos.filter(v => 
          v.channelId === currentVideo.channelId && String(v.id) !== String(videoId)
        );
        const otherVideos = videos.filter(v => 
          v.channelId !== currentVideo.channelId && String(v.id) !== String(videoId)
        );
        videos = [...sameChannel, ...otherVideos];
      } else {
        videos = videos.filter(v => String(v.id) !== String(videoId));
      }
    }

    // Sort by views (most popular)
    videos.sort((a, b) => (b.views || 0) - (a.views || 0));

    const recommended = videos.slice(0, parseInt(limit));

    res.json({ videos: recommended });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/videos/:id - Get video by ID (MUST come after specific routes)
router.get('/:id', (req, res) => {
  try {
    const videoId = req.params.id;
    console.log('Looking for video with ID:', videoId, 'Type:', typeof videoId);
    
    const video = videoDb.findById(videoId);
    console.log('Found video:', video ? `ID ${video.id}` : 'null');
    
    if (!video) {
      // Log available videos for debugging
      const allVideos = videoDb.getAll();
      console.log('Available video IDs:', allVideos.map(v => `${v.id} (${typeof v.id})`));
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views
    video.views = (video.views || 0) + 1;
    videoDb.update(video.id, { views: video.views });

    res.json(video);
  } catch (error) {
    console.error('Error in GET /api/videos/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/videos - Create new video
router.post('/', validateVideo, asyncHandler(async (req, res) => {
  const {
    title,
    description,
    channelId,
    channelName,
    duration,
    thumbnail,
    videoUrl,
    tags = []
  } = req.body;

  const video = videoDb.create({
    title: title.trim(),
    description: (description || '').trim(),
    channelId: channelId.trim(),
    channelName: channelName.trim(),
    views: 0,
    likes: 0,
    dislikes: 0,
    duration: duration || 0,
    thumbnail: (thumbnail || '').trim(),
    videoUrl: (videoUrl || '').trim(),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString()
  });

  res.status(201).json(video);
}));

// PUT /api/videos/:id - Update video
router.put('/:id', (req, res) => {
  try {
    const video = videoDb.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const updates = req.body;
    const updated = videoDb.update(video.id, updates);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/videos/:id - Delete video
router.delete('/:id', (req, res) => {
  try {
    const video = videoDb.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    videoDb.delete(video.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/videos/:id/like - Like video
router.post('/:id/like', (req, res) => {
  try {
    const video = videoDb.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { action } = req.body; // 'like' or 'unlike'
    const currentLikes = video.likes || 0;
    const currentDislikes = video.dislikes || 0;

    if (action === 'like') {
      videoDb.update(video.id, {
        likes: currentLikes + 1,
        dislikes: Math.max(0, currentDislikes - 1)
      });
    } else if (action === 'unlike') {
      videoDb.update(video.id, {
        likes: Math.max(0, currentLikes - 1)
      });
    }

    const updated = videoDb.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/videos/:id/dislike - Dislike video
router.post('/:id/dislike', (req, res) => {
  try {
    const video = videoDb.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const { action } = req.body; // 'dislike' or 'undislike'
    const currentLikes = video.likes || 0;
    const currentDislikes = video.dislikes || 0;

    if (action === 'dislike') {
      videoDb.update(video.id, {
        dislikes: currentDislikes + 1,
        likes: Math.max(0, currentLikes - 1)
      });
    } else if (action === 'undislike') {
      videoDb.update(video.id, {
        dislikes: Math.max(0, currentDislikes - 1)
      });
    }

    const updated = videoDb.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

