# VideoHub Backend Server

RESTful API server for VideoHub application.

## Features

- ✅ Video CRUD operations
- ✅ Comment CRUD operations
- ✅ Channel management
- ✅ Playlist management
- ✅ User authentication
- ✅ Watch history
- ✅ Subscriptions
- ✅ Search functionality
- ✅ Like/Dislike system

## Installation

```bash
npm install
```

## Running

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on `http://localhost:3001` by default.

## API Endpoints

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos` - Create video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video
- `POST /api/videos/:id/like` - Like video
- `POST /api/videos/:id/dislike` - Dislike video

### Comments
- `GET /api/comments?videoId=:id` - Get comments for video
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like comment
- `POST /api/comments/:id/dislike` - Dislike comment
- `POST /api/comments/:id/reply` - Reply to comment

### Channels
- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get channel by ID
- `POST /api/channels` - Create channel
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel
- `GET /api/channels/:id/videos` - Get channel videos
- `POST /api/channels/:id/subscribe` - Subscribe to channel
- `DELETE /api/channels/:id/subscribe` - Unsubscribe from channel

### Playlists
- `GET /api/playlists?userId=:id` - Get user playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/videos` - Add video to playlist
- `DELETE /api/playlists/:id/videos/:videoId` - Remove video from playlist

### Users
- `GET /api/users/:id` - Get user
- `GET /api/users/:id/history` - Get watch history
- `POST /api/users/:id/history` - Add to watch history
- `DELETE /api/users/:id/history` - Clear watch history
- `GET /api/users/:id/subscriptions` - Get user subscriptions

### Search
- `GET /api/search?q=query&type=all|videos|channels|playlists` - Search

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `videos.json`
- `comments.json`
- `channels.json`
- `playlists.json`
- `users.json`
- `subscriptions.json`
- `watchHistory.json`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT secret key (default: 'videohub-secret-key-change-in-production')

## CORS

CORS is enabled for all origins. Configure in `src/index.js` for production.

