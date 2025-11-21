# VideoHub Backend API

Complete RESTful API backend for VideoHub application.

## 🚀 Quick Start

### Start Backend Server

```bash
cd apps/server
npm install
npm run dev
```

Server runs on `http://localhost:3001`

### Start Both Frontend and Backend

From root directory:
```bash
npm run dev:all
```

## 📁 Project Structure

```
apps/server/
├── src/
│   ├── index.js              # Main server file
│   ├── routes/               # API route handlers
│   │   ├── videos.js
│   │   ├── comments.js
│   │   ├── channels.js
│   │   ├── playlists.js
│   │   ├── users.js
│   │   ├── search.js
│   │   └── auth.js
│   ├── utils/
│   │   └── database.js      # Database utility class
│   └── middleware/           # Custom middleware
├── data/                     # JSON database files
└── package.json
```

## 🗄️ Database

Uses JSON file-based storage (can be easily migrated to MongoDB/PostgreSQL):

- `videos.json` - Video data
- `comments.json` - Comment data
- `channels.json` - Channel data
- `playlists.json` - Playlist data
- `users.json` - User accounts
- `subscriptions.json` - User subscriptions
- `watchHistory.json` - Watch history

## 📡 API Endpoints

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | Get all videos (supports `channelId`, `limit`, `offset`) |
| GET | `/api/videos/:id` | Get video by ID (increments views) |
| POST | `/api/videos` | Create new video |
| PUT | `/api/videos/:id` | Update video |
| DELETE | `/api/videos/:id` | Delete video |
| POST | `/api/videos/:id/like` | Like/unlike video |
| POST | `/api/videos/:id/dislike` | Dislike/undislike video |

### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments?videoId=:id` | Get comments for video |
| POST | `/api/comments` | Create comment |
| PUT | `/api/comments/:id` | Update comment |
| DELETE | `/api/comments/:id` | Delete comment |
| POST | `/api/comments/:id/like` | Like/unlike comment |
| POST | `/api/comments/:id/dislike` | Dislike/undislike comment |
| POST | `/api/comments/:id/reply` | Reply to comment |

### Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | Get all channels |
| GET | `/api/channels/:id` | Get channel by ID |
| POST | `/api/channels` | Create channel |
| PUT | `/api/channels/:id` | Update channel |
| DELETE | `/api/channels/:id` | Delete channel |
| GET | `/api/channels/:id/videos` | Get channel videos |
| POST | `/api/channels/:id/subscribe` | Subscribe to channel |
| DELETE | `/api/channels/:id/subscribe` | Unsubscribe from channel |

### Playlists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playlists?userId=:id` | Get user playlists |
| GET | `/api/playlists/:id` | Get playlist by ID |
| POST | `/api/playlists` | Create playlist |
| PUT | `/api/playlists/:id` | Update playlist |
| DELETE | `/api/playlists/:id` | Delete playlist |
| POST | `/api/playlists/:id/videos` | Add video to playlist |
| DELETE | `/api/playlists/:id/videos/:videoId` | Remove video from playlist |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | Get user |
| GET | `/api/users/:id/history` | Get watch history |
| POST | `/api/users/:id/history` | Add to watch history |
| DELETE | `/api/users/:id/history` | Clear watch history |
| GET | `/api/users/:id/subscriptions` | Get user subscriptions |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=query&type=all` | Search (type: all, videos, channels, playlists) |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires token) |

## 🔐 Authentication

JWT-based authentication:

1. Register/Login to get token
2. Include token in headers: `Authorization: Bearer <token>`
3. Token expires in 7 days

## 📝 Example Requests

### Create Video
```bash
POST /api/videos
Content-Type: application/json

{
  "title": "My Video",
  "description": "Video description",
  "channelId": "my-channel",
  "channelName": "My Channel",
  "duration": 300,
  "tags": ["tag1", "tag2"]
}
```

### Create Comment
```bash
POST /api/comments
Content-Type: application/json

{
  "videoId": "1",
  "text": "Great video!",
  "author": "@username",
  "avatar": "U"
}
```

### Search
```bash
GET /api/search?q=devotional&type=videos&limit=10
```

## 🔧 Configuration

Environment variables:
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT secret key (default: 'videohub-secret-key-change-in-production')

## 🚦 CORS

CORS is enabled for all origins. Configure in `src/index.js` for production.

## 📦 Dependencies

- `express` - Web framework
- `cors` - CORS middleware
- `body-parser` - Request body parsing
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `uuid` - Unique ID generation

## 🧪 Testing

Test endpoints using:
- Postman
- curl
- Frontend API service (`apps/web/src/services/api.js`)

## 🔄 Migration to Real Database

The current JSON file storage can be easily migrated to:
- MongoDB
- PostgreSQL
- MySQL
- Any other database

Just replace the `Database` class in `src/utils/database.js` with your database client.

