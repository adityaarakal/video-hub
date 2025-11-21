# VideoHub Monorepo

A monorepo containing the VideoHub video platform interface built with React.

## Structure

```
videohub-monorepo/
├── apps/
│   └── web/              # Main React web application
├── packages/
│   └── shared/          # Shared utilities and components
├── package.json         # Root package.json with workspaces
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

Install all dependencies for all workspaces:

```bash
npm install
```

This will install dependencies for:
- Root workspace
- `apps/web` - React application
- `packages/shared` - Shared utilities

### Development

Start the development server:

```bash
npm run dev
# or
npm start
```

This will start the web app at [http://localhost:3000](http://localhost:3000)

### Building

Build all packages:

```bash
npm run build:all
```

Build specific workspace:

```bash
npm run build --workspace=@videohub/web
```

### Testing

Run tests:

```bash
npm test
```

## Workspaces

### `@videohub/web`

The main React web application featuring:
- **Header Component**: Search bar, VideoHub logo, navigation buttons, and user profile
- **Video Player**: Interactive video player with controls (play, volume, settings, fullscreen)
- **Video Details**: Title, channel information, view count, likes, and action buttons
- **Comments Section**: Comment list with user avatars, likes, replies, and sorting
- **Recommended Videos**: Sidebar with related videos and Quick Videos section
- **Full Routing**: React Router with Home, Search, and Channel pages
- **State Management**: Context API with localStorage persistence
- **API Integration**: RESTful API service for backend communication

### `@videohub/server`

Backend RESTful API server featuring:
- **Video CRUD**: Create, read, update, delete videos
- **Comment System**: Full comment CRUD with likes/dislikes and replies
- **Channel Management**: Channel CRUD with subscription system
- **Playlist Management**: Create and manage playlists
- **User Management**: User accounts with watch history
- **Search**: Full-text search across videos, channels, and playlists
- **Authentication**: JWT-based user authentication
- **JSON Database**: File-based storage (easily migratable to real database)

### `@videohub/shared`

Shared utilities and constants used across the monorepo:
- Formatting utilities (`formatNumber`, `formatTime`)
- App constants (`APP_NAME`, `APP_VERSION`)

## Available Scripts

- `npm run dev` - Start development server for web app
- `npm run dev:server` - Start backend server in development mode
- `npm run dev:all` - Start both frontend and backend servers
- `npm start` - Alias for dev (web app)
- `npm run server` - Start backend server
- `npm run build` - Build web app
- `npm run build:all` - Build all workspaces
- `npm test` - Run tests
- `npm run clean` - Remove all node_modules
- `npm run install:all` - Install dependencies for all workspaces

## Technologies Used

- React 18.2.0
- React Scripts 5.0.1
- Lucide React (icons)
- CSS3
- npm workspaces

## Features

- ✅ Full interactive UI/UX
- ✅ Video player controls (play, pause, volume, fullscreen)
- ✅ Like/dislike functionality
- ✅ Comment submission and replies
- ✅ Subscribe/unsubscribe
- ✅ Share functionality
- ✅ Search functionality
- ✅ Responsive design
- ✅ Dark theme with purple/blue color scheme

## 🚀 Complete End-to-End Features

### ✅ Implemented
- **Real Video Playback** - HTML5 video player with full controls
- **Video Upload** - Complete upload functionality with progress tracking
- **Docker Support** - Full Docker Compose setup for easy deployment
- **File Management** - Video and thumbnail upload endpoints
- **Environment Configuration** - Production-ready environment setup

### 📦 Deployment

**Using Docker:**
```bash
docker-compose up -d
```

**Manual Setup:**
```bash
# Backend
cd apps/server
npm install
npm run dev

# Frontend  
cd apps/web
npm install
npm start
```

See `COMPLETE_E2E_FEATURES.md` for detailed feature documentation.

## Notes

- Full-stack implementation with backend API
- Real video playback with HTML5 video element
- Video upload functionality with file validation
- Docker-ready for production deployment
- Responsive design implemented for mobile and desktop views

## Monorepo Benefits

- **Code Sharing**: Shared utilities in `packages/shared`
- **Independent Versioning**: Each package can be versioned independently
- **Unified Dependencies**: npm workspaces handle dependency hoisting
- **Scalability**: Easy to add new apps or packages
- **Single Repository**: All code in one place for easier maintenance
