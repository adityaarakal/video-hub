const fs = require('fs');
const path = require('path');

const USE_MONGODB = process.env.USE_MONGODB !== 'false'; // Default to true

const dataDir = path.join(__dirname, '../../data');

// Import MongoDB database if available
let MongoDBDatabase;
try {
  MongoDBDatabase = require('./mongodb');
} catch (error) {
  console.warn('MongoDB database not available, using JSON files');
}

class Database {
  constructor(fileName) {
    this.fileName = fileName;
    this.filePath = path.join(dataDir, `${fileName}.json`);
  }

  // Check dynamically if MongoDB should be used
  get useMongoDB() {
    const USE_MONGODB = process.env.USE_MONGODB !== 'false';
    return USE_MONGODB && MongoDBDatabase && mongoose.connection.readyState === 1;
  }

  // Get MongoDB instance if available
  get mongoDb() {
    if (!this._mongoDb && this.useMongoDB) {
      try {
        this._mongoDb = new MongoDBDatabase(this.fileName);
      } catch (error) {
        console.warn(`Failed to initialize MongoDB for ${this.fileName}, falling back to JSON:`, error.message);
        return null;
      }
    }
    return this._mongoDb;
  }

  // MongoDB methods
  async getAll() {
    if (this.useMongoDB) {
      return await this.mongoDb.getAll();
    }
    
    // JSON file methods
    const data = this.read();
    if (!data) return [];
    
    // Handle different data structures
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

  async findById(id) {
    if (this.useMongoDB) {
      return await this.mongoDb.findById(id);
    }
    
    const items = await this.getAll();
    const searchId = String(id);
    return items.find(item => {
      const itemId = String(item.id || item._id);
      return itemId === searchId;
    });
  }

  async findBy(field, value) {
    if (this.useMongoDB) {
      return await this.mongoDb.findBy(field, value);
    }
    
    const items = await this.getAll();
    return items.filter(item => item[field] === value);
  }

  async create(item) {
    if (this.useMongoDB) {
      return await this.mongoDb.create(item);
    }
    
    const data = this.read();
    if (!data) return null;

    const newId = this.getNextId();
    const newItem = {
      ...item,
      id: newId || item.id || Date.now(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (data.videos) {
      data.videos.push(newItem);
    } else if (data.comments) {
      data.comments.push(newItem);
    } else if (data.channels) {
      data.channels.push(newItem);
    } else if (data.playlists) {
      data.playlists.push(newItem);
    } else if (data.users) {
      data.users.push(newItem);
    } else if (Array.isArray(data)) {
      data.push(newItem);
    }

    this.write(data);
    return newItem;
  }

  async update(id, updates) {
    if (this.useMongoDB) {
      return await this.mongoDb.update(id, updates);
    }
    
    const data = this.read();
    if (!data) return null;

    let items = await this.getAll();
    const searchId = String(id);
    const index = items.findIndex(item => {
      const itemId = String(item.id || item._id);
      return itemId === searchId;
    });
    
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    items[index] = updatedItem;

    // Write back to correct structure
    if (data.videos) data.videos = items;
    else if (data.comments) data.comments = items;
    else if (data.channels) data.channels = items;
    else if (data.playlists) data.playlists = items;
    else if (data.users) data.users = items;
    else if (Array.isArray(data)) {
      Object.assign(data, items);
    }

    this.write(data);
    return updatedItem;
  }

  async delete(id) {
    if (this.useMongoDB) {
      return await this.mongoDb.delete(id);
    }
    
    const data = this.read();
    if (!data) return false;

    let items = await this.getAll();
    const searchId = String(id);
    const filtered = items.filter(item => {
      const itemId = String(item.id || item._id);
      return itemId !== searchId;
    });
    
    if (filtered.length === items.length) return false;

    // Write back to correct structure
    if (data.videos) data.videos = filtered;
    else if (data.comments) data.comments = filtered;
    else if (data.channels) data.channels = filtered;
    else if (data.playlists) data.playlists = filtered;
    else if (data.users) data.users = filtered;
    else if (Array.isArray(data)) {
      const newData = filtered;
      this.write(newData);
      return true;
    }

    this.write(data);
    return true;
  }

  // JSON file methods (for fallback)
  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing to ${this.filePath}:`, error);
      return false;
    }
  }

  getNextId() {
    const data = this.read();
    if (data && data.nextId) {
      const nextId = data.nextId;
      data.nextId += 1;
      this.write(data);
      return nextId;
    }
    return null;
  }
}

module.exports = Database;
