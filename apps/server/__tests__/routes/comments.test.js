const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const commentRoutes = require('../../src/routes/comments');
const Database = require('../../src/utils/database');
const fs = require('fs');
const path = require('path');

describe('Comment Routes', () => {
  let app;
  const testDataDir = path.join(__dirname, '../../data');
  const commentsFilePath = path.join(testDataDir, 'comments.json');

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api/comments', commentRoutes);
    
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  beforeEach(() => {
    const testData = {
      comments: [
        {
          id: 1,
          videoId: '1',
          text: 'Great video!',
          author: 'User1',
          avatar: 'U',
          likes: 5,
          dislikes: 0,
          replies: [],
          createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          videoId: '1',
          text: 'Nice content',
          author: 'User2',
          avatar: 'U',
          likes: 3,
          dislikes: 1,
          replies: [],
          createdAt: '2024-01-02T00:00:00.000Z'
        }
      ],
      nextId: 3
    };
    fs.writeFileSync(commentsFilePath, JSON.stringify(testData));
  });

  afterEach(() => {
    if (fs.existsSync(commentsFilePath)) {
      fs.unlinkSync(commentsFilePath);
    }
  });

  describe('GET /api/comments', () => {
    test('should return comments for a video', async () => {
      const response = await request(app)
        .get('/api/comments?videoId=1')
        .expect(200);

      expect(response.body).toHaveProperty('comments');
      expect(response.body.comments).toHaveLength(2);
      expect(response.body.comments[0]).toHaveProperty('videoId', '1');
    });

    test('should return 400 if videoId is missing', async () => {
      const response = await request(app)
        .get('/api/comments')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should sort comments by likes (top)', async () => {
      const response = await request(app)
        .get('/api/comments?videoId=1&sortBy=top')
        .expect(200);

      expect(response.body.comments[0].likes).toBeGreaterThanOrEqual(
        response.body.comments[1].likes
      );
    });

    test('should paginate comments', async () => {
      const response = await request(app)
        .get('/api/comments?videoId=1&limit=1&page=1')
        .expect(200);

      expect(response.body.comments).toHaveLength(1);
      expect(response.body).toHaveProperty('hasMore', true);
    });
  });

  describe('POST /api/comments', () => {
    test('should create new comment', async () => {
      const newComment = {
        videoId: '1',
        text: 'New comment',
        author: 'User3',
        avatar: 'U'
      };

      const response = await request(app)
        .post('/api/comments')
        .send(newComment)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text', 'New comment');
      expect(response.body).toHaveProperty('author', 'User3');
      expect(response.body).toHaveProperty('likes', 0);
    });

    test('should return 400 for missing required fields', async () => {
      const invalidComment = {
        text: 'Incomplete comment'
        // Missing videoId and author
      };

      const response = await request(app)
        .post('/api/comments')
        .send(invalidComment)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate comment text length', async () => {
      const invalidComment = {
        videoId: '1',
        text: 'a'.repeat(10001), // Too long
        author: 'User3'
      };

      const response = await request(app)
        .post('/api/comments')
        .send(invalidComment)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/comments/:id/reply', () => {
    test('should add reply to comment', async () => {
      const reply = {
        text: 'This is a reply',
        author: 'User4',
        avatar: 'U'
      };

      const response = await request(app)
        .post('/api/comments/1/reply')
        .send(reply)
        .expect(200);

      expect(response.body).toHaveProperty('replies');
      expect(response.body.replies).toHaveLength(1);
      expect(response.body.replies[0]).toHaveProperty('text', 'This is a reply');
    });

    test('should return 404 for non-existent comment', async () => {
      const reply = {
        text: 'Reply',
        author: 'User4'
      };

      const response = await request(app)
        .post('/api/comments/999/reply')
        .send(reply)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

