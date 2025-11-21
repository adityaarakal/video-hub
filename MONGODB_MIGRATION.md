# MongoDB Migration Guide

## Overview

The VideoHub application has been migrated from JSON file storage to MongoDB for better scalability, performance, and data integrity.

## Features

- **Hybrid Support**: The application supports both MongoDB and JSON file storage
- **Automatic Fallback**: If MongoDB connection fails, the app falls back to JSON files
- **Migration Script**: Easy migration of existing JSON data to MongoDB
- **Backward Compatible**: Existing code works with both storage methods

## Setup

### 1. Environment Variables

Set the MongoDB connection string in your environment:

```bash
# .env file or environment variable
MONGODB_URI=mongodb://localhost:27017/videohub
USE_MONGODB=true  # Set to 'false' to use JSON files
```

### 2. Start MongoDB

Using Docker Compose (recommended):
```bash
docker-compose up -d mongo
```

Or install MongoDB locally and start the service.

### 3. Run Migration Script

Migrate existing JSON data to MongoDB:

```bash
cd apps/server
npm run migrate
```

The migration script will:
- Connect to MongoDB
- Read all JSON files from `data/` directory
- Migrate data to MongoDB collections
- Skip existing documents (safe to run multiple times)
- Show migration summary

## Database Structure

### Collections

- **videos**: Video metadata, views, likes, etc.
- **comments**: Comments with nested replies
- **channels**: Channel information
- **users**: User accounts and authentication
- **playlists**: User playlists
- **watchHistory**: User watch history
- **subscriptions**: User channel subscriptions

### Models

All models are defined in `apps/server/src/models/`:
- `Video.js`
- `Comment.js`
- `Channel.js`
- `User.js`
- `Playlist.js`
- `WatchHistory.js`
- `Subscription.js`

## Usage

### Default Behavior

By default, the application uses MongoDB (`USE_MONGODB=true`). If MongoDB is not available, it automatically falls back to JSON file storage.

### Force JSON Storage

To use JSON files instead of MongoDB:

```bash
USE_MONGODB=false npm start
```

### Database Class

The `Database` class automatically uses MongoDB or JSON files based on configuration:

```javascript
const Database = require('./utils/database');
const videoDb = new Database('videos');

// All methods work the same way
const videos = await videoDb.getAll();
const video = await videoDb.findById(id);
await videoDb.create(newVideo);
await videoDb.update(id, updates);
await videoDb.delete(id);
```

## MongoDB-Specific Features

### Indexes

The models include indexes for better query performance:
- Videos: `channelId`, `createdAt`, text search on `title`, `description`, `tags`
- Comments: `videoId`, `createdAt`
- Channels: `id` (unique), text search on `name`, `description`
- Users: `email`, `username`
- Playlists: `userId`
- WatchHistory: `userId`, `watchedAt`
- Subscriptions: `userId`, `channelId` (unique)

### Advanced Queries

The MongoDB database class supports additional methods:

```javascript
// Count documents
const count = await videoDb.mongoDb.count({ channelId: 'channel1' });

// Find with options
const videos = await videoDb.mongoDb.find(
  { channelId: 'channel1' },
  { sort: { createdAt: -1 }, limit: 10, skip: 0 }
);

// Find one with custom query
const user = await videoDb.mongoDb.findOne({ email: 'user@example.com' });
```

## Docker Deployment

The `docker-compose.yml` already includes MongoDB service:

```yaml
mongo:
  image: mongo:7
  ports:
    - "27017:27017"
  volumes:
    - mongo_data:/data/db
```

The backend service automatically connects to MongoDB using:
```
MONGODB_URI=mongodb://mongo:27017/videohub
```

## Troubleshooting

### Connection Issues

1. **Check MongoDB is running**:
   ```bash
   docker ps  # Should show mongo container
   ```

2. **Check connection string**:
   ```bash
   echo $MONGODB_URI
   ```

3. **View logs**:
   ```bash
   docker logs videohub-mongo-1
   ```

### Migration Issues

1. **Clear MongoDB and re-migrate**:
   ```bash
   # Connect to MongoDB shell
   docker exec -it videohub-mongo-1 mongosh videohub
   
   # Drop collections (optional)
   db.videos.drop()
   db.comments.drop()
   # ... etc
   
   # Run migration again
   npm run migrate
   ```

2. **Check JSON files exist**:
   ```bash
   ls apps/server/data/*.json
   ```

## Benefits of MongoDB

1. **Scalability**: Handle large datasets efficiently
2. **Performance**: Indexed queries and optimized operations
3. **Data Integrity**: Schema validation and constraints
4. **Concurrency**: Better handling of concurrent operations
5. **Querying**: Advanced query capabilities
6. **Replication**: Built-in replication and sharding support

## Backward Compatibility

The application maintains backward compatibility:
- Existing routes work without changes
- Database class interface remains the same
- JSON files still work as fallback
- Migration is optional (can use JSON files indefinitely)

## Next Steps

1. Run migration script to migrate existing data
2. Monitor MongoDB connection in production
3. Set up MongoDB backups
4. Consider MongoDB Atlas for cloud hosting
5. Add MongoDB monitoring and alerts

