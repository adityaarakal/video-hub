const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// Import routes
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');
const channelRoutes = require('./routes/channels');
const playlistRoutes = require('./routes/playlists');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize data directory
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database files
const initDatabase = () => {
  const dbFiles = {
    videos: { videos: [], nextId: 1 },
    comments: { comments: [], nextId: 1 },
    channels: { channels: [], nextId: 1 },
    playlists: { playlists: [], nextId: 1 },
    users: { users: [], nextId: 1 },
    subscriptions: { subscriptions: [] },
    watchHistory: { history: [] }
  };

  Object.keys(dbFiles).forEach(file => {
    const filePath = path.join(dataDir, `${file}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(dbFiles[file], null, 2));
    }
  });

  // Initialize with sample data
  initializeSampleData();
};

const initializeSampleData = () => {
  const videosPath = path.join(dataDir, 'videos.json');
  const channelsPath = path.join(dataDir, 'channels.json');
  
  // Safely read and parse JSON files
  let videosData;
  let channelsData;
  
  try {
    const videosContent = fs.readFileSync(videosPath, 'utf8');
    videosData = videosContent.trim() ? JSON.parse(videosContent) : { videos: [], nextId: 1 };
  } catch (error) {
    console.error('Error reading videos.json, initializing empty:', error.message);
    videosData = { videos: [], nextId: 1 };
    fs.writeFileSync(videosPath, JSON.stringify(videosData, null, 2));
  }
  
  try {
    const channelsContent = fs.readFileSync(channelsPath, 'utf8');
    channelsData = channelsContent.trim() ? JSON.parse(channelsContent) : { channels: [], nextId: 1 };
  } catch (error) {
    console.error('Error reading channels.json, initializing empty:', error.message);
    channelsData = { channels: [], nextId: 1 };
    fs.writeFileSync(channelsPath, JSON.stringify(channelsData, null, 2));
  }

  // Add sample channels if empty or less than needed
  const requiredChannels = [
    {
      id: 'saregama-telugu',
      name: 'Saregama Telugu',
      subscribers: 9380000,
      description: 'Welcome to Saregama Telugu - Your destination for devotional and classical music.',
      isVerified: true,
      avatar: 'ST',
      banner: '',
      createdAt: new Date().toISOString()
    },
    {
      id: 'divine-music',
      name: 'Divine Music Channel',
      subscribers: 3200000,
      description: 'Experience divine music and powerful mantras for spiritual growth.',
      isVerified: true,
      avatar: 'DM',
      banner: '',
      createdAt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'devotional-classics',
      name: 'Devotional Classics',
      subscribers: 5100000,
      description: 'Classic devotional songs and stotrams from various traditions.',
      isVerified: true,
      avatar: 'DC',
      banner: '',
      createdAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'blessful-mornings',
      name: 'Blessful Mornings',
      subscribers: 890000,
      description: 'Start your day with beautiful devotional music and prayers.',
      isVerified: false,
      avatar: 'BM',
      banner: '',
      createdAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'divine-devotional',
      name: 'THE DIVINE - DEVOTIONAL LYRICS',
      subscribers: 2100000,
      description: 'Devotional songs with lyrics in multiple languages.',
      isVerified: true,
      avatar: 'DD',
      banner: '',
      createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'rajshri-soul',
      name: 'Rajshri Soul',
      subscribers: 6800000,
      description: 'Soulful devotional music and spiritual content.',
      isVerified: true,
      avatar: 'RS',
      banner: '',
      createdAt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'tirumala-vaibhavam',
      name: 'Tirumala Vaibhavam',
      subscribers: 1200000,
      description: 'Devotional content dedicated to Lord Venkateswara.',
      isVerified: false,
      avatar: 'TV',
      banner: '',
      createdAt: new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const existingChannelIds = new Set(channelsData.channels.map(c => c.id));
  const channelsToAdd = requiredChannels.filter(c => !existingChannelIds.has(c.id));
  
  if (channelsToAdd.length > 0) {
    channelsData.channels.push(...channelsToAdd);
    fs.writeFileSync(channelsPath, JSON.stringify(channelsData, null, 2));
  }

  // Add sample videos if empty or less than 10
  if (videosData.videos.length < 10) {
    const sampleVideos = [
      {
        id: 1,
        title: 'MS Subbulakshmi Sri Venkateswara Suprabhatham | Lyrical Video',
        description: 'Watch Sri Venkateswara Suprabhatham with lyrics sung by the legendary MS Subbulakshmi.',
        channelId: 'saregama-telugu',
        channelName: 'Saregama Telugu',
        views: 48000000,
        likes: 177000,
        dislikes: 0,
        duration: 1241,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        createdAt: new Date(Date.now() - 12 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['mssubbulakshmi', 'SriVenkateswaraSuprabhatham', 'saregamatelugu']
      },
      {
        id: 2,
        title: 'Vishnu Sahasranamam | Full Version | Powerful Chanting',
        description: 'Complete Vishnu Sahasranamam chanting with beautiful visuals and clear pronunciation.',
        channelId: 'saregama-telugu',
        channelName: 'Saregama Telugu',
        views: 12500000,
        likes: 45000,
        dislikes: 0,
        duration: 3657,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        createdAt: new Date(Date.now() - 8 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['vishnu', 'sahasranamam', 'chanting', 'devotional']
      },
      {
        id: 3,
        title: 'Powerful 1 Hour Maha Mrityunjaya Mantra | Lord Shiva',
        description: 'Experience the divine power of Maha Mrityunjaya Mantra dedicated to Lord Shiva.',
        channelId: 'divine-music',
        channelName: 'Divine Music Channel',
        views: 8900000,
        likes: 32000,
        dislikes: 0,
        duration: 3600,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        createdAt: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['shiva', 'mrityunjaya', 'mantra', 'spiritual']
      },
      {
        id: 4,
        title: 'Lalitha Sahasranamam | Complete Stotram | Goddess Lalitha',
        description: 'Beautiful rendition of Lalitha Sahasranamam, a powerful hymn to Goddess Lalitha.',
        channelId: 'devotional-classics',
        channelName: 'Devotional Classics',
        views: 15600000,
        likes: 67000,
        dislikes: 0,
        duration: 2850,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        createdAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['lalitha', 'sahasranamam', 'goddess', 'devotional']
      },
      {
        id: 5,
        title: 'మణిద్వీప వర్ణన | Divine Mani Dweepa Stotram | Powerful Chanting',
        description: 'Beautiful Telugu devotional song describing the divine Mani Dweepa.',
        channelId: 'blessful-mornings',
        channelName: 'Blessful Mornings',
        views: 210000,
        likes: 8500,
        dislikes: 0,
        duration: 916,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['telugu', 'mani', 'dweepa', 'devotional'],
        isNew: true
      },
      {
        id: 6,
        title: 'లింగాష్టకం - శివాష్టకం - విశ్వనాధాష్టకం - బిల్వాష్టకం',
        description: 'Powerful collection of Shiva stotrams including Lingashtakam, Shivastakam, and more.',
        channelId: 'divine-devotional',
        channelName: 'THE DIVINE - DEVOTIONAL LYRICS',
        views: 426000,
        likes: 18000,
        dislikes: 0,
        duration: 3083,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['shiva', 'lingashtakam', 'telugu', 'stotram']
      },
      {
        id: 7,
        title: 'Rudram Namakam With Lyrics | Powerful Lord Shiva Stotras',
        description: 'Complete Rudram Namakam chanting with lyrics and translations.',
        channelId: 'rajshri-soul',
        channelName: 'Rajshri Soul',
        views: 13000000,
        likes: 52000,
        dislikes: 0,
        duration: 3711,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        createdAt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['rudram', 'namakam', 'shiva', 'vedic']
      },
      {
        id: 8,
        title: 'Gayatri Mantra | 108 Times | Powerful Meditation',
        description: 'Experience the transformative power of Gayatri Mantra repeated 108 times.',
        channelId: 'divine-music',
        channelName: 'Divine Music Channel',
        views: 5600000,
        likes: 24000,
        dislikes: 0,
        duration: 1800,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['gayatri', 'mantra', 'meditation', 'spiritual']
      },
      {
        id: 9,
        title: 'Venkateswara Suprabhatam | Morning Prayers | Tirumala',
        description: 'Beautiful morning prayers to Lord Venkateswara from Tirumala.',
        channelId: 'tirumala-vaibhavam',
        channelName: 'Tirumala Vaibhavam',
        views: 76000,
        likes: 3200,
        dislikes: 0,
        duration: 3717,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['venkateswara', 'suprabhatam', 'tirumala', 'morning']
      },
      {
        id: 10,
        title: 'Hanuman Chalisa | Complete | Powerful Devotional Song',
        description: 'Complete Hanuman Chalisa with beautiful music and clear pronunciation.',
        channelId: 'devotional-classics',
        channelName: 'Devotional Classics',
        views: 25000000,
        likes: 98000,
        dislikes: 0,
        duration: 1200,
        thumbnail: '',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        createdAt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['hanuman', 'chalisa', 'devotional', 'hindi']
      }
    ];

    // Only add videos that don't exist
    const existingIds = new Set(videosData.videos.map(v => v.id));
    const videosToAdd = sampleVideos.filter(v => !existingIds.has(v.id));
    
    if (videosToAdd.length > 0) {
      videosData.videos.push(...videosToAdd);
      videosData.nextId = Math.max(...sampleVideos.map(v => v.id)) + 1;
      fs.writeFileSync(videosPath, JSON.stringify(videosData, null, 2));
    }
  }
};

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VideoHub API is running' });
});

// Initialize database
initDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VideoHub Server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${dataDir}`);
});

module.exports = app;

