const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { connectDB } = require('./config/database');

// Import routes
const videoRoutes = require('./routes/videos');
const commentRoutes = require('./routes/comments');
const channelRoutes = require('./routes/channels');
const playlistRoutes = require('./routes/playlists');
const userRoutes = require('./routes/users');
const searchRoutes = require('./routes/search');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (uploads)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

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

  // Always update videos with correct titles and thumbnails
  const sampleVideos = [
      {
        id: 1,
        title: 'Big Buck Bunny | Animated Short Film',
        description: 'Big Buck Bunny is a short animated film featuring a large rabbit and his adventures in a forest.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 48000000,
        likes: 177000,
        dislikes: 0,
        duration: 1241,
        thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        createdAt: new Date(Date.now() - 12 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['animation', 'short-film', 'blender', 'bunny']
      },
      {
        id: 2,
        title: 'Elephants Dream | Animated Short Film',
        description: 'Elephants Dream is a short animated film about two strange characters exploring a surreal world.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 12500000,
        likes: 45000,
        dislikes: 0,
        duration: 3657,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        createdAt: new Date(Date.now() - 8 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['animation', 'short-film', 'blender', 'surreal']
      },
      {
        id: 3,
        title: 'For Bigger Blazes | Sample Video',
        description: 'A sample video showcasing high-quality video content.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 8900000,
        likes: 32000,
        dislikes: 0,
        duration: 3600,
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        createdAt: new Date(Date.now() - 6 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sample', 'video', 'demo']
      },
      {
        id: 4,
        title: 'For Bigger Escapes | Sample Video',
        description: 'A sample video demonstrating video playback capabilities.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 15600000,
        likes: 67000,
        dislikes: 0,
        duration: 2850,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        createdAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sample', 'video', 'demo']
      },
      {
        id: 5,
        title: 'For Bigger Fun | Sample Video',
        description: 'A fun sample video for testing video playback features.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 210000,
        likes: 8500,
        dislikes: 0,
        duration: 916,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sample', 'video', 'fun'],
        isNew: true
      },
      {
        id: 6,
        title: 'For Bigger Joyrides | Sample Video',
        description: 'A sample video showcasing exciting content.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 426000,
        likes: 18000,
        dislikes: 0,
        duration: 3083,
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sample', 'video', 'demo']
      },
      {
        id: 7,
        title: 'For Bigger Meltdowns | Sample Video',
        description: 'A sample video demonstrating video streaming capabilities.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 13000000,
        likes: 52000,
        dislikes: 0,
        duration: 3711,
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        createdAt: new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sample', 'video', 'demo']
      },
      {
        id: 8,
        title: 'Sintel | Animated Short Film',
        description: 'Sintel is an animated short film about a young girl searching for a baby dragon.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 5600000,
        likes: 24000,
        dislikes: 0,
        duration: 1800,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['animation', 'short-film', 'blender', 'dragon']
      },
      {
        id: 9,
        title: 'Subaru Outback | On Street and Dirt',
        description: 'A video showcasing the Subaru Outback vehicle on various terrains.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 76000,
        likes: 3200,
        dislikes: 0,
        duration: 3717,
        thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['automotive', 'subaru', 'outback', 'vehicle']
      },
      {
        id: 10,
        title: 'Tears of Steel | Sci-Fi Short Film',
        description: 'Tears of Steel is a science fiction short film featuring robots and futuristic technology.',
        channelId: 'admin',
        channelName: 'Admin',
        views: 25000000,
        likes: 98000,
        dislikes: 0,
        duration: 1200,
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=640&h=360&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        createdAt: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sci-fi', 'short-film', 'blender', 'robots']
      }
    ];

    // Update existing videos with thumbnails if missing, or add new ones
    const existingIds = new Set(videosData.videos.map(v => v.id));
    const videosToAdd = sampleVideos.filter(v => !existingIds.has(v.id));
    
    // Update thumbnails and titles for existing videos - ALWAYS update
    const videoMap = {};
    sampleVideos.forEach(v => {
      videoMap[v.id] = v;
    });
    
    // Update ALL existing videos with correct data
    videosData.videos.forEach(video => {
      if (videoMap[video.id]) {
        // Always update all fields to match sample data
        video.title = videoMap[video.id].title;
        video.description = videoMap[video.id].description;
        video.channelId = videoMap[video.id].channelId;
        video.channelName = videoMap[video.id].channelName;
        video.tags = videoMap[video.id].tags;
        video.thumbnail = videoMap[video.id].thumbnail; // Always update thumbnail
      }
    });
    
    // Add new videos if they don't exist
    if (videosToAdd.length > 0) {
      videosData.videos.push(...videosToAdd);
      videosData.nextId = Math.max(...sampleVideos.map(v => v.id)) + 1;
    }
    
    // Always save to ensure all videos are updated
    fs.writeFileSync(videosPath, JSON.stringify(videosData, null, 2));
    console.log(`✅ Updated ${videosData.videos.length} videos with correct titles and thumbnails`);
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
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VideoHub API is running' });
});

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB or initialize JSON database
const USE_MONGODB = process.env.USE_MONGODB !== 'false'; // Default to true

// Set USE_MONGODB to false if MongoDB connection fails
let useMongoDB = USE_MONGODB;

if (USE_MONGODB) {
  connectDB()
    .then(() => {
      console.log('✅ Using MongoDB database');
      process.env.USE_MONGODB = 'true';
      startServer();
    })
    .catch(err => {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      console.log('📁 Falling back to JSON file storage');
      process.env.USE_MONGODB = 'false';
      useMongoDB = false;
      initDatabase();
      startServer();
    });
} else {
  console.log('📁 Using JSON file storage');
  process.env.USE_MONGODB = 'false';
  initDatabase();
  startServer();
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 VideoHub Server running on http://localhost:${PORT}`);
    if (!USE_MONGODB || !mongoose.connection.readyState) {
      console.log(`📁 Data directory: ${dataDir}`);
    }
  });
}

module.exports = app;

