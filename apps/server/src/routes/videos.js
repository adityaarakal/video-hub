const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const { validateVideo, validatePagination, asyncHandler } = require('../middleware/validation');

const videoDb = new Database('videos');

// GET /api/videos - Get all videos
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { channelId, limit = 20, offset = 0, page = 1 } = req.query;
  let videos = await videoDb.getAll();

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
router.get('/recommended', asyncHandler(async (req, res) => {
  const { videoId, limit = 10 } = req.query;
  let videos = await videoDb.getAll();

  // If videoId provided, exclude it and get videos from same channel or similar
  if (videoId) {
    const currentVideo = await videoDb.findById(videoId);
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
}));

// GET /api/videos/:id - Get video by ID (MUST come after specific routes)
router.get('/:id', asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  console.log('Looking for video with ID:', videoId, 'Type:', typeof videoId);
  
  const video = await videoDb.findById(videoId);
  console.log('Found video:', video ? `ID ${video.id}` : 'null');
  
  if (!video) {
    // Log available videos for debugging
    const allVideos = await videoDb.getAll();
    console.log('Available video IDs:', allVideos.map(v => `${v.id} (${typeof v.id})`));
    return res.status(404).json({ error: 'Video not found' });
  }

  // Increment views
  video.views = (video.views || 0) + 1;
  await videoDb.update(video.id, { views: video.views });

  res.json(video);
}));

// POST /api/videos - Create new video (admin only)
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

  // Use admin as default channel if not provided
  const finalChannelId = (channelId || 'admin').trim();
  const finalChannelName = (channelName || 'Admin').trim();

  const video = await videoDb.create({
    title: title.trim(),
    description: (description || '').trim(),
    channelId: finalChannelId,
    channelName: finalChannelName,
    views: 0,
    likes: 0,
    dislikes: 0,
    duration: duration || 0,
    thumbnail: (thumbnail || '').trim(),
    videoUrl: (videoUrl || '').trim(),
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []),
    createdAt: new Date().toISOString()
  });

  res.status(201).json(video);
}));

// PUT /api/videos/:id - Update video
router.put('/:id', asyncHandler(async (req, res) => {
  const video = await videoDb.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const updates = req.body;
  const updated = await videoDb.update(video.id, updates);

  res.json(updated);
}));

// DELETE /api/videos/:id - Delete video
router.delete('/:id', asyncHandler(async (req, res) => {
  const video = await videoDb.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  await videoDb.delete(video.id);
  res.json({ message: 'Video deleted successfully' });
}));

// POST /api/videos/:id/like - Like video
router.post('/:id/like', asyncHandler(async (req, res) => {
  const video = await videoDb.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const { action } = req.body; // 'like' or 'unlike'
  const currentLikes = video.likes || 0;
  const currentDislikes = video.dislikes || 0;

  if (action === 'like') {
    await videoDb.update(video.id, {
      likes: currentLikes + 1,
      dislikes: Math.max(0, currentDislikes - 1)
    });
  } else if (action === 'unlike') {
    await videoDb.update(video.id, {
      likes: Math.max(0, currentLikes - 1)
    });
  }

  const updated = await videoDb.findById(req.params.id);
  res.json(updated);
}));

// POST /api/videos/:id/dislike - Dislike video
router.post('/:id/dislike', asyncHandler(async (req, res) => {
  const video = await videoDb.findById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const { action } = req.body; // 'dislike' or 'undislike'
  const currentLikes = video.likes || 0;
  const currentDislikes = video.dislikes || 0;

  if (action === 'dislike') {
    await videoDb.update(video.id, {
      dislikes: currentDislikes + 1,
      likes: Math.max(0, currentLikes - 1)
    });
  } else if (action === 'undislike') {
    await videoDb.update(video.id, {
      dislikes: Math.max(0, currentDislikes - 1)
    });
  }

  const updated = await videoDb.findById(req.params.id);
  res.json(updated);
}));

module.exports = router;

