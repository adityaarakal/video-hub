# Testing Documentation

## Overview

This directory contains unit tests and integration tests for the VideoHub backend server.

## Test Structure

```
__tests__/
├── setup.js              # Test configuration and setup
├── utils/
│   └── database.test.js   # Unit tests for Database utility
└── routes/
    ├── videos.test.js     # Integration tests for video routes
    ├── auth.test.js       # Integration tests for auth routes
    └── comments.test.js   # Integration tests for comment routes
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- __tests__/utils/database.test.js
npm test -- __tests__/routes/videos.test.js
```

## Test Coverage

### Unit Tests
- **Database Utility** (`utils/database.test.js`)
  - File read/write operations
  - Data retrieval methods (getAll, findById, findBy)
  - CRUD operations (create, update, delete)
  - ID generation and management
  - Different data structure handling

### Integration Tests
- **Video Routes** (`routes/videos.test.js`)
  - GET /api/videos (list, filter, pagination)
  - GET /api/videos/:id (retrieve, view increment)
  - POST /api/videos (create, validation)

- **Auth Routes** (`routes/auth.test.js`)
  - POST /api/auth/register (user registration, validation)
  - POST /api/auth/login (authentication, error handling)

- **Comment Routes** (`routes/comments.test.js`)
  - GET /api/comments (list, sort, pagination)
  - POST /api/comments (create, validation)
  - POST /api/comments/:id/reply (reply functionality)

## Test Data

Tests use isolated test data files in the `data/` directory:
- Each test suite sets up its own test data in `beforeEach`
- Test data is cleaned up in `afterEach`
- Tests don't interfere with production data

## Writing New Tests

### Unit Test Example
```javascript
describe('Feature', () => {
  beforeEach(() => {
    // Setup test data
  });

  afterEach(() => {
    // Cleanup
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example
```javascript
describe('Route', () => {
  test('should handle request', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data after each test
3. **Descriptive Names**: Use clear, descriptive test names
4. **AAA Pattern**: Arrange, Act, Assert
5. **Test Edge Cases**: Include tests for error conditions and edge cases
6. **Mock External Dependencies**: Mock external services when possible

## Coverage Goals

- Aim for >80% code coverage
- Focus on critical paths and business logic
- Test error handling and edge cases
- Include validation tests

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to production

