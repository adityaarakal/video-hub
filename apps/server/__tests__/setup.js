// Test setup file
// This file runs before all tests

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3002'; // Use different port for tests

