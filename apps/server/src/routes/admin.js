const express = require('express');
const router = express.Router();
const Database = require('../utils/database');
const { requireAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const videoDb = new Database('videos');
const commentDb = new Database('comments');
const channelDb = new Database('channels');
const userDb = new Database('users');
const playlistDb = new Database('playlists');

// All admin routes require admin authentication
router.use(requireAdmin);

// GET /api/admin/stats - Get platform statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const videos = videoDb.getAll();
  const comments = commentDb.getAll();
  const channels = channelDb.getAll();
  const users = userDb.getAll();
  const playlists = playlistDb.getAll();

  const stats = {
    totalVideos: videos.length,
    totalComments: comments.length,
    totalChannels: channels.length,
    totalUsers: users.length,
    totalPlaylists: playlists.length,
    totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
    recentVideos: videos
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        title: v.title,
        views: v.views || 0,
        createdAt: v.createdAt
      }))
  };

  res.json(stats);
}));

// GET /api/admin/videos - Get all videos with pagination
router.get('/videos', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  let videos = videoDb.getAll();

  // Filter by search term if provided
  if (search) {
    const searchLower = search.toLowerCase();
    videos = videos.filter(v =>
      v.title?.toLowerCase().includes(searchLower) ||
      v.channelName?.toLowerCase().includes(searchLower) ||
      v.description?.toLowerCase().includes(searchLower)
    );
  }

  // Sort by createdAt (newest first)
  videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offsetNum = (pageNum - 1) * limitNum;
  const total = videos.length;
  const totalPages = Math.ceil(total / limitNum);
  const paginated = videos.slice(offsetNum, offsetNum + limitNum);

  res.json({
    videos: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasMore: offsetNum + limitNum < total
  });
}));

// DELETE /api/admin/videos/:id - Delete a video
router.delete('/videos/:id', asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  const video = videoDb.findById(videoId);

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  // Delete associated comments
  const comments = commentDb.findBy('videoId', videoId);
  comments.forEach(comment => {
    commentDb.delete(comment.id);
  });

  // Delete the video
  const deleted = videoDb.delete(videoId);

  if (deleted) {
    res.json({ message: 'Video deleted successfully', videoId });
  } else {
    res.status(500).json({ error: 'Failed to delete video' });
  }
}));

// GET /api/admin/users - Get all users
router.get('/users', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  let users = userDb.getAll();

  // Filter by search term if provided
  if (search) {
    const searchLower = search.toLowerCase();
    users = users.filter(u =>
      u.username?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  }

  // Remove passwords from response
  users = users.map(({ password, ...user }) => user);

  // Sort by createdAt (newest first)
  users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offsetNum = (pageNum - 1) * limitNum;
  const total = users.length;
  const totalPages = Math.ceil(total / limitNum);
  const paginated = users.slice(offsetNum, offsetNum + limitNum);

  res.json({
    users: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasMore: offsetNum + limitNum < total
  });
}));

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!role || !['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be "admin" or "user"' });
  }

  const user = userDb.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent removing last admin
  if (role === 'user' && user.role === 'admin') {
    const admins = userDb.getAll().filter(u => u.role === 'admin');
    if (admins.length === 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin' });
    }
  }

  const updated = userDb.update(userId, { role });
  const { password, ...userData } = updated;

  res.json({ message: 'User role updated successfully', user: userData });
}));

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = userDb.findById(userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Prevent deleting last admin
  if (user.role === 'admin') {
    const admins = userDb.getAll().filter(u => u.role === 'admin');
    if (admins.length === 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
  }

  const deleted = userDb.delete(userId);

  if (deleted) {
    res.json({ message: 'User deleted successfully', userId });
  } else {
    res.status(500).json({ error: 'Failed to delete user' });
  }
}));

// GET /api/admin/comments - Get all comments
router.get('/comments', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, videoId } = req.query;
  let comments = commentDb.getAll();

  // Filter by videoId if provided
  if (videoId) {
    comments = comments.filter(c => c.videoId === videoId);
  }

  // Sort by createdAt (newest first)
  comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offsetNum = (pageNum - 1) * limitNum;
  const total = comments.length;
  const totalPages = Math.ceil(total / limitNum);
  const paginated = comments.slice(offsetNum, offsetNum + limitNum);

  res.json({
    comments: paginated,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasMore: offsetNum + limitNum < total
  });
}));

// DELETE /api/admin/comments/:id - Delete a comment
router.delete('/comments/:id', asyncHandler(async (req, res) => {
  const commentId = req.params.id;
  const comment = commentDb.findById(commentId);

  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const deleted = commentDb.delete(commentId);

  if (deleted) {
    res.json({ message: 'Comment deleted successfully', commentId });
  } else {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}));

module.exports = router;

