const express = require('express');
const router = express.Router();
const Database = require('../utils/database');

const channelDb = new Database('channels');
const subscriptionDb = new Database('subscriptions');

// GET /api/channels - Get all channels
router.get('/', (req, res) => {
  try {
    const channels = channelDb.getAll();
    res.json({ channels });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/channels/:id - Get channel by ID
router.get('/:id', (req, res) => {
  try {
    const channel = channelDb.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/channels - Create new channel
router.post('/', (req, res) => {
  try {
    const { name, description, avatar, banner } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    const channelId = name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if channel already exists
    const existing = channelDb.findById(channelId);
    if (existing) {
      return res.status(400).json({ error: 'Channel already exists' });
    }

    const channel = channelDb.create({
      id: channelId,
      name,
      description: description || '',
      subscribers: 0,
      isVerified: false,
      avatar: avatar || name.charAt(0).toUpperCase(),
      banner: banner || '',
      createdAt: new Date().toISOString()
    });

    res.status(201).json(channel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/channels/:id - Update channel
router.put('/:id', (req, res) => {
  try {
    const channel = channelDb.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const updates = req.body;
    const updated = channelDb.update(channel.id, updates);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/channels/:id - Delete channel
router.delete('/:id', (req, res) => {
  try {
    const channel = channelDb.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    channelDb.delete(channel.id);
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/channels/:id/videos - Get videos for a channel
router.get('/:id/videos', (req, res) => {
  try {
    const { limit = 20, offset = 0, page = 1 } = req.query;
    const videoDb = new Database('videos');
    let videos = videoDb.findBy('channelId', req.params.id);
    
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offsetNum = parseInt(offset) || (pageNum - 1) * limitNum;
    const total = videos.length;
    const totalPages = Math.ceil(total / limitNum);
    
    // Apply pagination
    const paginatedVideos = videos.slice(offsetNum, offsetNum + limitNum);
    
    res.json({ 
      videos: paginatedVideos, 
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

// POST /api/channels/:id/subscribe - Subscribe to channel
router.post('/:id/subscribe', (req, res) => {
  try {
    const channel = channelDb.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const subscriptions = subscriptionDb.getAll();
    const existing = subscriptions.find(
      sub => sub.channelId === req.params.id && sub.userId === userId
    );

    if (existing) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    const subscription = {
      id: Date.now(),
      channelId: req.params.id,
      channelName: channel.name,
      userId,
      subscribedAt: new Date().toISOString()
    };

    const data = subscriptionDb.read();
    if (data && Array.isArray(data.subscriptions)) {
      data.subscriptions.push(subscription);
      subscriptionDb.write(data);
    } else {
      subscriptionDb.create(subscription);
    }

    // Update channel subscriber count
    channelDb.update(channel.id, {
      subscribers: (channel.subscribers || 0) + 1
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/channels/:id/subscribe - Unsubscribe from channel
router.delete('/:id/subscribe', (req, res) => {
  try {
    const channel = channelDb.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const data = subscriptionDb.read();
    if (data && Array.isArray(data.subscriptions)) {
      const filtered = data.subscriptions.filter(
        sub => !(sub.channelId === req.params.id && sub.userId === userId)
      );
      
      if (filtered.length === data.subscriptions.length) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      data.subscriptions = filtered;
      subscriptionDb.write(data);

      // Update channel subscriber count
      channelDb.update(channel.id, {
        subscribers: Math.max(0, (channel.subscribers || 0) - 1)
      });

      res.json({ message: 'Unsubscribed successfully' });
    } else {
      res.status(404).json({ error: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/channels/:id/subscribers - Get channel subscribers
router.get('/:id/subscribers', (req, res) => {
  try {
    const subscriptions = subscriptionDb.getAll();
    const channelSubs = subscriptions.filter(
      sub => sub.channelId === req.params.id
    );
    
    res.json({ subscribers: channelSubs, total: channelSubs.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/channels/:id/subscribed - Check if user is subscribed
router.get('/:id/subscribed', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const subscriptions = subscriptionDb.getAll();
    const isSubscribed = subscriptions.some(
      sub => sub.channelId === req.params.id && sub.userId === userId
    );

    res.json({ subscribed: isSubscribed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

