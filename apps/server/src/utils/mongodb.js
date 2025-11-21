const Video = require('../models/Video');
const Comment = require('../models/Comment');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const WatchHistory = require('../models/WatchHistory');
const Subscription = require('../models/Subscription');

// Map collection names to models
const modelMap = {
  videos: Video,
  comments: Comment,
  channels: Channel,
  users: User,
  playlists: Playlist,
  watchHistory: WatchHistory,
  subscriptions: Subscription
};

class MongoDBDatabase {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.Model = modelMap[collectionName];
    
    if (!this.Model) {
      throw new Error(`Unknown collection: ${collectionName}`);
    }
  }

  // Convert MongoDB document to plain object with string ID
  _toPlainObject(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    // Convert _id to id for compatibility
    if (obj._id) {
      obj.id = obj._id.toString();
      delete obj._id;
    }
    return obj;
  }

  // Convert array of documents
  _toPlainArray(docs) {
    return docs.map(doc => this._toPlainObject(doc));
  }

  async getAll() {
    try {
      const docs = await this.Model.find({});
      return this._toPlainArray(docs);
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      return [];
    }
  }

  async findById(id) {
    try {
      const doc = await this.Model.findById(id);
      if (!doc) {
        // Try finding by string id field if _id doesn't match
        const docByStringId = await this.Model.findOne({ id: String(id) });
        return this._toPlainObject(docByStringId);
      }
      return this._toPlainObject(doc);
    } catch (error) {
      // If id is not a valid ObjectId, try finding by id field
      try {
        const doc = await this.Model.findOne({ id: String(id) });
        return this._toPlainObject(doc);
      } catch (err) {
        return null;
      }
    }
  }

  async findBy(field, value) {
    try {
      const docs = await this.Model.find({ [field]: value });
      return this._toPlainArray(docs);
    } catch (error) {
      console.error(`Error finding ${this.collectionName} by ${field}:`, error);
      return [];
    }
  }

  async create(item) {
    try {
      // Remove id if present (MongoDB will generate _id)
      const { id, ...itemData } = item;
      
      // Handle special case for channels (they have an id field)
      if (this.collectionName === 'channels' && item.id) {
        itemData.id = item.id;
      }
      
      const doc = new this.Model({
        ...itemData,
        createdAt: item.createdAt || new Date(),
        updatedAt: new Date()
      });
      
      await doc.save();
      return this._toPlainObject(doc);
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id, updates) {
    try {
      // Try updating by _id first
      let doc = await this.Model.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      
      if (!doc) {
        // Try updating by id field
        doc = await this.Model.findOneAndUpdate(
          { id: String(id) },
          { ...updates, updatedAt: new Date() },
          { new: true }
        );
      }
      
      return this._toPlainObject(doc);
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return null;
    }
  }

  async delete(id) {
    try {
      // Try deleting by _id first
      let result = await this.Model.findByIdAndDelete(id);
      
      if (!result) {
        // Try deleting by id field
        result = await this.Model.findOneAndDelete({ id: String(id) });
      }
      
      return !!result;
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return false;
    }
  }

  // MongoDB-specific methods
  async count(query = {}) {
    try {
      return await this.Model.countDocuments(query);
    } catch (error) {
      console.error(`Error counting ${this.collectionName}:`, error);
      return 0;
    }
  }

  async findOne(query) {
    try {
      const doc = await this.Model.findOne(query);
      return this._toPlainObject(doc);
    } catch (error) {
      console.error(`Error finding one ${this.collectionName}:`, error);
      return null;
    }
  }

  async find(query = {}, options = {}) {
    try {
      let queryBuilder = this.Model.find(query);
      
      if (options.sort) {
        queryBuilder = queryBuilder.sort(options.sort);
      }
      
      if (options.limit) {
        queryBuilder = queryBuilder.limit(options.limit);
      }
      
      if (options.skip) {
        queryBuilder = queryBuilder.skip(options.skip);
      }
      
      const docs = await queryBuilder.exec();
      return this._toPlainArray(docs);
    } catch (error) {
      console.error(`Error finding ${this.collectionName}:`, error);
      return [];
    }
  }
}

module.exports = MongoDBDatabase;

