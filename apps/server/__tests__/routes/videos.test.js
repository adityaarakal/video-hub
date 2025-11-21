const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const videoRoutes = require('../../src/routes/videos');
const Database = require('../../src/utils/database');
const fs = require('fs');
const path = require('path');

describe('Video Routes', () => {
  let app;
  let videoDb;
  const testDataDir = path.join(__dirname, '../../data');
  const testFilePath = path.join(testDataDir, 'videos.json');

  beforeAll(() => {
    // Create test app
    app = express();
    app.use(bodyParser.json());
    app.use('/api/videos', videoRoutes);
    
    // Ensure data directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Initialize test database with clean data
    const testData = {
      videos: [
        {
          id: 1,
          title: 'Test Video 1',
          description: 'Description 1',
          channelId: 'channel1',
          channelName: 'Channel 1',
          views: 100,
          likes: 10,
          dislikes: 2,
          duration: 120,
          thumbnail: 'https://example.com/thumb1.jpg',
          videoUrl: 'https://example.com/video1.mp4',
          tags: ['test', 'video'],
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          title: 'Test Video 2',
          description: 'Description 2',
          channelId: 'channel2',
          channelName: 'Channel 2',
          views: 200,
          likes: 20,
          dislikes: 5,
          duration: 240,
          thumbnail: 'https://example.com/thumb2.jpg',
          videoUrl: 'https://example.com/video2.mp4',
          tags: ['test'],
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ],
      nextId: 3
    };
    fs.writeFileSync(testFilePath, JSON.stringify(testData));
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('GET /api/videos', () => {
    test('should return all videos', async () => {
      const response = await request(app)
        .get('/api/videos')
        .expect(200);

      expect(response.body).toHaveProperty('videos');
      expect(response.body.videos).toHaveLength(2);
      expect(response.body).toHaveProperty('total', 2);
    });

    test('should filter by channelId', async () => {
      const response = await request(app)
        .get('/api/videos?channelId=channel1')
        .expect(200);

      expect(response.body.videos).toHaveLength(1);
      expect(response.body.videos[0].channelId).toBe('channel1');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/videos?limit=1&page=1')
        .expect(200);

      expect(response.body.videos).toHaveLength(1);
      expect(response.body).toHaveProperty('limit', 1);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 2);
    });
  });

  describe('GET /api/videos/:id', () => {
    test('should return video by id', async () => {
      const response = await request(app)
        .get('/api/videos/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Test Video 1');
    });

    test('should increment views when video is fetched', async () => {
      const response1 = await request(app)
        .get('/api/videos/1')
        .expect(200);
      
      const initialViews = response1.body.views;

      const response2 = await request(app)
        .get('/api/videos/1')
        .expect(200);

      expect(response2.body.views).toBe(initialViews + 1);
    });

    test('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/videos/999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/videos', () => {
    test('should create new video with valid data', async () => {
      const newVideo = {
        title: 'New Video',
        description: 'New Description',
        channelId: 'channel3',
        channelName: 'Channel 3',
        duration: 300,
        thumbnail: 'https://example.com/thumb3.jpg',
        videoUrl: 'https://example.com/video3.mp4',
        tags: ['new', 'video']
      };

      const response = await request(app)
        .post('/api/videos')
        .send(newVideo)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'New Video');
      expect(response.body).toHaveProperty('channelId', 'channel3');
      expect(response.body).toHaveProperty('views', 0);
      expect(response.body).toHaveProperty('likes', 0);
    });

    test('should return 400 for missing required fields', async () => {
      const invalidVideo = {
        title: 'Incomplete Video'
        // Missing channelId and channelName
      };

      const response = await request(app)
        .post('/api/videos')
        .send(invalidVideo)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate title length', async () => {
      const invalidVideo = {
        title: 'a'.repeat(201), // Too long
        channelId: 'channel1',
        channelName: 'Channel 1'
      };

      const response = await request(app)
        .post('/api/videos')
        .send(invalidVideo)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});

