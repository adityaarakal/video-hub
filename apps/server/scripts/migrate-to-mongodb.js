const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Video = require('../src/models/Video');
const Comment = require('../src/models/Comment');
const Channel = require('../src/models/Channel');
const User = require('../src/models/User');
const Playlist = require('../src/models/Playlist');
const WatchHistory = require('../src/models/WatchHistory');
const Subscription = require('../src/models/Subscription');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/videohub';
const dataDir = path.join(__dirname, '../data');

// Helper to read JSON file
function readJSONFile(fileName) {
  const filePath = path.join(dataDir, `${fileName}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}.json:`, error);
    return null;
  }
}

// Helper to extract items from JSON structure
function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (data.videos) return data.videos;
  if (data.comments) return data.comments;
  if (data.channels) return data.channels;
  if (data.playlists) return data.playlists;
  if (data.users) return data.users;
  if (data.subscriptions) return data.subscriptions;
  if (data.history) return data.history;
  return [];
}

async function migrateCollection(collectionName, Model) {
  console.log(`\nMigrating ${collectionName}...`);
  
  const data = readJSONFile(collectionName);
  if (!data) {
    console.log(`  No data file found for ${collectionName}`);
    return { migrated: 0, skipped: 0 };
  }

  const items = extractItems(data);
  if (items.length === 0) {
    console.log(`  No items to migrate for ${collectionName}`);
    return { migrated: 0, skipped: 0 };
  }

  let migrated = 0;
  let skipped = 0;

  for (const item of items) {
    try {
      // Convert id to _id if needed, or keep id for channels
      const itemData = { ...item };
      
      if (collectionName !== 'channels' && item.id) {
        // For most collections, use _id instead of id
        itemData._id = item.id;
        delete itemData.id;
      }
      
      // Convert date strings to Date objects
      if (itemData.createdAt && typeof itemData.createdAt === 'string') {
        itemData.createdAt = new Date(itemData.createdAt);
      }
      if (itemData.updatedAt && typeof itemData.updatedAt === 'string') {
        itemData.updatedAt = new Date(itemData.updatedAt);
      }
      if (itemData.watchedAt && typeof itemData.watchedAt === 'string') {
        itemData.watchedAt = new Date(itemData.watchedAt);
      }
      if (itemData.subscribedAt && typeof itemData.subscribedAt === 'string') {
        itemData.subscribedAt = new Date(itemData.subscribedAt);
      }

      // Check if document already exists
      const existing = await Model.findById(itemData._id || itemData.id);
      if (existing) {
        skipped++;
        continue;
      }

      await Model.create(itemData);
      migrated++;
    } catch (error) {
      console.error(`  Error migrating item ${item.id || item._id}:`, error.message);
      skipped++;
    }
  }

  console.log(`  Migrated: ${migrated}, Skipped: ${skipped}`);
  return { migrated, skipped };
}

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const results = {
      videos: await migrateCollection('videos', Video),
      comments: await migrateCollection('comments', Comment),
      channels: await migrateCollection('channels', Channel),
      users: await migrateCollection('users', User),
      playlists: await migrateCollection('playlists', Playlist),
      watchHistory: await migrateCollection('watchHistory', WatchHistory),
      subscriptions: await migrateCollection('subscriptions', Subscription),
    };

    console.log('\n=== Migration Summary ===');
    let totalMigrated = 0;
    let totalSkipped = 0;
    
    Object.entries(results).forEach(([collection, result]) => {
      console.log(`${collection}: ${result.migrated} migrated, ${result.skipped} skipped`);
      totalMigrated += result.migrated;
      totalSkipped += result.skipped;
    });

    console.log(`\nTotal: ${totalMigrated} migrated, ${totalSkipped} skipped`);

    await mongoose.disconnect();
    console.log('\nMigration completed!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrate();

