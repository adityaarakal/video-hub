# Monorepo Guide

This project uses npm workspaces to manage a monorepo structure.

## Structure

```
videohub-monorepo/
├── apps/
│   └── web/                    # React web application
│       ├── src/
│       ├── public/
│       └── package.json
├── packages/
│   └── shared/                 # Shared utilities
│       ├── index.js
│       └── package.json
├── package.json                # Root workspace config
└── .npmrc                      # npm configuration
```

## Workspace Commands

### Run commands in specific workspace

```bash
# Run dev server for web app
npm run dev --workspace=@videohub/web

# Build web app
npm run build --workspace=@videohub/web

# Install package in specific workspace
npm install <package> --workspace=@videohub/web
```

### Run commands in all workspaces

```bash
# Build all workspaces
npm run build:all

# Run tests in all workspaces
npm test --workspaces
```

## Adding New Workspaces

1. Create new directory in `apps/` or `packages/`
2. Add `package.json` with unique name (e.g., `@videohub/mobile`)
3. Run `npm install` at root to register workspace

## Shared Dependencies

Dependencies can be:
- **Root level**: Shared across all workspaces (add to root `package.json`)
- **Workspace level**: Specific to that workspace (add to workspace `package.json`)

## Benefits

- ✅ Single repository for all code
- ✅ Shared dependencies (reduced duplication)
- ✅ Easy code sharing between packages
- ✅ Unified versioning and releases
- ✅ Simplified CI/CD setup

