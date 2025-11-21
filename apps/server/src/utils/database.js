const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');

class Database {
  constructor(fileName) {
    this.filePath = path.join(dataDir, `${fileName}.json`);
  }

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

  getAll() {
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

  findById(id) {
    const items = this.getAll();
    // Handle both string and number ID comparisons
    const searchId = String(id);
    return items.find(item => {
      const itemId = String(item.id);
      return itemId === searchId;
    });
  }

  findBy(field, value) {
    const items = this.getAll();
    return items.filter(item => item[field] === value);
  }

  create(item) {
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

  update(id, updates) {
    const data = this.read();
    if (!data) return null;

    let items = this.getAll();
    const searchId = String(id);
    const index = items.findIndex(item => String(item.id) === searchId);
    
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

  delete(id) {
    const data = this.read();
    if (!data) return false;

    let items = this.getAll();
    const searchId = String(id);
    const filtered = items.filter(item => String(item.id) !== searchId);
    
    if (filtered.length === items.length) return false;

    // Write back to correct structure
    if (data.videos) data.videos = filtered;
    else if (data.comments) data.comments = filtered;
    else if (data.channels) data.channels = filtered;
    else if (data.playlists) data.playlists = filtered;
    else if (data.users) data.users = filtered;
    else if (Array.isArray(data)) {
      // For arrays, replace the entire array
      const newData = filtered;
      this.write(newData);
      return true;
    }

    this.write(data);
    return true;
  }
}

module.exports = Database;

