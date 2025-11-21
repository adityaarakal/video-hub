const fs = require('fs');
const path = require('path');
const Database = require('../../src/utils/database');

describe('Database', () => {
  let testDb;
  const testFileName = 'test-db';
  const testDataDir = path.join(__dirname, '../../data');
  const testFilePath = path.join(testDataDir, `${testFileName}.json`);

  beforeEach(() => {
    // Create test database instance
    testDb = new Database(testFileName);
    // Ensure data directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    // Clean up test file if it exists
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  afterEach(() => {
    // Clean up test file after each test
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('read()', () => {
    test('should return null for non-existent file', () => {
      const result = testDb.read();
      expect(result).toBeNull();
    });

    test('should return parsed JSON data for existing file', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.read();
      expect(result).toEqual(testData);
    });

    test('should return null for invalid JSON', () => {
      fs.writeFileSync(testFilePath, 'invalid json');
      
      const result = testDb.read();
      expect(result).toBeNull();
    });
  });

  describe('write()', () => {
    test('should write data to file successfully', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }] };
      
      const result = testDb.write(testData);
      expect(result).toBe(true);
      expect(fs.existsSync(testFilePath)).toBe(true);
      
      const written = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(written).toEqual(testData);
    });
  });

  describe('getAll()', () => {
    test('should return empty array for non-existent file', () => {
      const result = testDb.getAll();
      expect(result).toEqual([]);
    });

    test('should return array for array data', () => {
      const testData = [{ id: 1 }, { id: 2 }];
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.getAll();
      expect(result).toEqual(testData);
    });

    test('should return videos array for videos structure', () => {
      const testData = { videos: [{ id: 1 }], nextId: 2 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.getAll();
      expect(result).toEqual([{ id: 1 }]);
    });

    test('should return comments array for comments structure', () => {
      const testData = { comments: [{ id: 1 }], nextId: 2 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.getAll();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('getNextId()', () => {
    test('should return null if no nextId field', () => {
      const testData = { videos: [] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.getNextId();
      expect(result).toBeNull();
    });

    test('should return and increment nextId', () => {
      const testData = { videos: [], nextId: 5 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.getNextId();
      expect(result).toBe(5);
      
      const updated = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(updated.nextId).toBe(6);
    });
  });

  describe('findById()', () => {
    test('should find item by string id', () => {
      const testData = { videos: [{ id: '1', title: 'Test' }, { id: '2', title: 'Test2' }] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.findById('1');
      expect(result).toEqual({ id: '1', title: 'Test' });
    });

    test('should find item by number id', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }, { id: 2, title: 'Test2' }] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.findById(1);
      expect(result).toEqual({ id: 1, title: 'Test' });
    });

    test('should return undefined for non-existent id', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('findBy()', () => {
    test('should filter items by field value', () => {
      const testData = {
        videos: [
          { id: 1, channelId: 'channel1', title: 'Test1' },
          { id: 2, channelId: 'channel1', title: 'Test2' },
          { id: 3, channelId: 'channel2', title: 'Test3' }
        ]
      };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.findBy('channelId', 'channel1');
      expect(result).toHaveLength(2);
      expect(result[0].channelId).toBe('channel1');
    });

    test('should return empty array if no matches', () => {
      const testData = { videos: [{ id: 1, channelId: 'channel1' }] };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.findBy('channelId', 'nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('create()', () => {
    test('should create item with videos structure', () => {
      const testData = { videos: [], nextId: 1 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const newItem = { title: 'New Video', channelId: 'channel1' };
      const result = testDb.create(newItem);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', 'New Video');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      
      const updated = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(updated.videos).toHaveLength(1);
      expect(updated.videos[0].title).toBe('New Video');
    });

    test('should create item with array structure', () => {
      const testData = [];
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const newItem = { title: 'New Item' };
      const result = testDb.create(newItem);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title', 'New Item');
      
      const updated = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(updated).toHaveLength(1);
    });

    test('should return null if data file does not exist', () => {
      const newItem = { title: 'New Video' };
      const result = testDb.create(newItem);
      
      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    test('should update existing item', () => {
      const testData = {
        videos: [
          { id: 1, title: 'Old Title', views: 10 }
        ],
        nextId: 2
      };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.update(1, { title: 'New Title', views: 20 });
      
      expect(result.title).toBe('New Title');
      expect(result.views).toBe(20);
      expect(result).toHaveProperty('updatedAt');
      
      const updated = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(updated.videos[0].title).toBe('New Title');
      expect(updated.videos[0].views).toBe(20);
    });

    test('should return null for non-existent id', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }], nextId: 2 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.update(999, { title: 'New Title' });
      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    test('should delete existing item', () => {
      const testData = {
        videos: [
          { id: 1, title: 'Test1' },
          { id: 2, title: 'Test2' }
        ],
        nextId: 3
      };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.delete(1);
      
      expect(result).toBe(true);
      const updated = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
      expect(updated.videos).toHaveLength(1);
      expect(updated.videos[0].id).toBe(2);
    });

    test('should return false for non-existent id', () => {
      const testData = { videos: [{ id: 1, title: 'Test' }], nextId: 2 };
      fs.writeFileSync(testFilePath, JSON.stringify(testData));
      
      const result = testDb.delete(999);
      expect(result).toBe(false);
    });
  });
});

