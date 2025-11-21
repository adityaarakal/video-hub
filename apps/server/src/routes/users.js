const express = require('express');
const router = express.Router();
const Database = require('../utils/database');

const userDb = new Database('users');
const historyDb = new Database('watchHistory');

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = userDb.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive data
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id/history - Get watch history
router.get('/:id/history', (req, res) => {
  try {
    const data = historyDb.read();
    const history = (data && data.history) ? data.history.filter(h => h.userId === req.params.id) : [];
    
    // Sort by watchedAt (most recent first)
    history.sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));
    
    res.json({ history, total: history.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/:id/history - Add to watch history
router.post('/:id/history', (req, res) => {
  try {
    const { videoId, videoTitle, videoThumbnail } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const data = historyDb.read();
    const history = (data && data.history) ? data.history : [];

    // Remove existing entry for this video
    const filtered = history.filter(h => !(h.userId === req.params.id && h.videoId === videoId));

    // Add new entry at the beginning
    filtered.unshift({
      id: Date.now(),
      userId: req.params.id,
      videoId,
      videoTitle: videoTitle || '',
      videoThumbnail: videoThumbnail || '',
      watchedAt: new Date().toISOString()
    });

    // Keep only last 100 entries per user
    const userHistory = filtered.filter(h => h.userId === req.params.id);
    const otherHistory = filtered.filter(h => h.userId !== req.params.id);
    const limitedUserHistory = userHistory.slice(0, 100);
    
    const updatedData = {
      history: [...limitedUserHistory, ...otherHistory]
    };

    historyDb.write(updatedData);
    res.json({ message: 'History updated', entry: limitedUserHistory[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id/history - Clear watch history
router.delete('/:id/history', (req, res) => {
  try {
    const data = historyDb.read();
    const history = (data && data.history) ? data.history.filter(h => h.userId !== req.params.id) : [];

    historyDb.write({ history });
    res.json({ message: 'History cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id/subscriptions - Get user subscriptions
router.get('/:id/subscriptions', (req, res) => {
  try {
    const subscriptionDb = new Database('subscriptions');
    const subscriptions = subscriptionDb.findBy('userId', req.params.id);
    
    res.json({ subscriptions, total: subscriptions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

