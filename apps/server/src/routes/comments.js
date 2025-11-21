const express = require('express');
const router = express.Router();
const Database = require('../utils/database');

const commentDb = new Database('comments');

// GET /api/comments - Get comments for a video
router.get('/', (req, res) => {
  try {
    const { videoId, sortBy = 'top', limit = 20, offset = 0, page = 1 } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    let comments = commentDb.findBy('videoId', videoId);

    // Sort comments
    if (sortBy === 'newest') {
      comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Sort by likes (top comments)
      comments.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    // Calculate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = parseInt(offset) || (pageNum - 1) * limitNum;
    const total = comments.length;
    const totalPages = Math.ceil(total / limitNum);
    
    // Apply pagination
    const paginatedComments = comments.slice(offsetNum, offsetNum + limitNum);

    res.json({
      comments: paginatedComments,
      total,
      limit: limitNum,
      offset: offsetNum,
      page: pageNum,
      totalPages,
      hasMore: offsetNum + limitNum < total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/comments/:id - Get comment by ID
router.get('/:id', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/comments - Create new comment
router.post('/', (req, res) => {
  try {
    const { videoId, text, author, avatar } = req.body;

    if (!videoId || !text || !author) {
      return res.status(400).json({ error: 'videoId, text, and author are required' });
    }

    const comment = commentDb.create({
      videoId,
      text,
      author,
      avatar: avatar || author.charAt(0).toUpperCase(),
      likes: 0,
      dislikes: 0,
      replies: [],
      createdAt: new Date().toISOString()
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/comments/:id - Update comment
router.put('/:id', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updates = req.body;
    const updated = commentDb.update(comment.id, updates);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    commentDb.delete(comment.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/comments/:id/like - Like comment
router.post('/:id/like', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const { action } = req.body; // 'like' or 'unlike'
    const currentLikes = comment.likes || 0;
    const currentDislikes = comment.dislikes || 0;

    if (action === 'like') {
      commentDb.update(comment.id, {
        likes: currentLikes + 1,
        dislikes: Math.max(0, currentDislikes - 1)
      });
    } else if (action === 'unlike') {
      commentDb.update(comment.id, {
        likes: Math.max(0, currentLikes - 1)
      });
    }

    const updated = commentDb.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/comments/:id/dislike - Dislike comment
router.post('/:id/dislike', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const { action } = req.body; // 'dislike' or 'undislike'
    const currentLikes = comment.likes || 0;
    const currentDislikes = comment.dislikes || 0;

    if (action === 'dislike') {
      commentDb.update(comment.id, {
        dislikes: currentDislikes + 1,
        likes: Math.max(0, currentLikes - 1)
      });
    } else if (action === 'undislike') {
      commentDb.update(comment.id, {
        dislikes: Math.max(0, currentDislikes - 1)
      });
    }

    const updated = commentDb.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/comments/:id/reply - Add reply to comment
router.post('/:id/reply', (req, res) => {
  try {
    const comment = commentDb.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const { text, author, avatar } = req.body;

    if (!text || !author) {
      return res.status(400).json({ error: 'text and author are required' });
    }

    const reply = {
      id: Date.now(),
      text,
      author,
      avatar: avatar || author.charAt(0).toUpperCase(),
      likes: 0,
      createdAt: new Date().toISOString()
    };

    const replies = comment.replies || [];
    replies.push(reply);

    const updated = commentDb.update(comment.id, {
      replies
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

