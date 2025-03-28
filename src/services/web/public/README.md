# CosyWorld Frontend Documentation

This documentation covers the frontend architecture, organization, and development guidelines for the CosyWorld project.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Key Features](#key-features)
5. [Development Guidelines](#development-guidelines)
6. [Recent Refactor](#recent-refactor)
7. [Getting Started](#getting-started)
8. [Next Steps](#next-steps)

## Project Overview

CosyWorld is a web application that provides an interface to interact with avatars, tribes, and social features. The frontend is built using vanilla JavaScript with a modular architecture and Tailwind CSS for styling.

The application offers several key features:
- Wallet integration for cryptocurrency connections
- Avatar claiming and management
- Tribe system for grouping avatars
- Action log for tracking avatar activities
- Leaderboard for avatar rankings
- Social feed for viewing avatar content
- X (Twitter) authentication for avatars

## Architecture

The application follows a modular architecture to ensure clean separation of concerns:

### Core Concepts

- **Modular Design**: The application is organized into modules with clear responsibilities
- **ES Modules**: Uses modern JavaScript module system
- **State Management**: Simple centralized state with event-based updates
- **API Client**: Structured API client for backend communication
- **Component System**: Reusable UI components with consistent patterns

### Key Components

- **Core**: Contains foundational functionality like configuration, state management, and API utilities
- **Components**: Reusable UI elements that can be composed to build interfaces
- **Services**: Handles external integrations like wallet connections and social media
- **Tabs**: Implements the content for each application tab
- **Utils**: Provides shared utility functions

### State Management

The application uses a centralized state object to manage application state:

```javascript
const state = {
  wallet: null,          // Connected wallet information
  activeTab: "squad",    // Currently active tab
  loading: false,        // Loading state
  socialSort: "new",     // Sort order for social content
};
```

### Tab System

The application organizes content into tabs:

1. **Squad**: Displays avatars claimed by the user
2. **Actions**: Shows a log of avatar actions
3. **Leaderboard**: Displays avatar rankings
4. **Tribes**: Groups of avatars with shared characteristics
5. **Social**: Social media content from avatars

## File Structure

```
public/
├── admin/               # Admin panel pages
├── assets/              # Static assets (images, fonts, etc.)
├── css/                 # CSS stylesheets
│   ├── tailwind.css     # Tailwind configuration
│   └── tribe-styles.css # Tribe-specific styles
├── js/                  # JavaScript files
│   ├── core/            # Core application functionality
│   │   ├── api.js       # API client for backend communication
│   │   ├── config.js    # Application configuration
│   │   ├── contentLoader.js # Content loading mechanism
│   │   └── state.js     # Global state management
│   ├── components/      # Reusable UI components
│   │   ├── avatar.js    # Avatar display components
│   │   ├── modal.js     # Modal dialog component
│   │   └── tabs.js      # Tab navigation component
│   ├── services/        # External services integration
│   │   ├── wallet.js    # Wallet connection service
│   │   └── xService.mjs # X (Twitter) integration service
│   ├── tabs/            # Tab content modules
│   │   ├── squad.js     # Squad tab functionality
│   │   ├── actions.js   # Actions tab functionality
│   │   ├── leaderboard.js # Leaderboard tab functionality
│   │   ├── tribes.js    # Tribes tab functionality
│   │   └── social.js    # Social feed tab functionality
│   ├── utils/           # Utility functions
│   │   ├── formatting.js # Text formatting utilities
│   │   └── toast.js     # Toast notification utility
│   └── main.js          # Main application entry point
├── index.html           # Main application HTML
└── README.md            # This documentation file
```

## Key Features

### Wallet Integration

The application includes wallet integration functionality to connect to cryptocurrency wallets:

- Supports Phantom wallet for Solana blockchain integration
- Auto-connects to trusted wallets on page load
- Provides user interface for wallet connection and disconnection
- Displays connected wallet address in the UI

### Avatar Management

Users can view, claim, and manage avatars:

- Avatar grid displays all avatars claimed by the user
- Detailed avatar views show stats, narratives, and actions
- Claiming functionality allows users to take ownership of avatars
- Mint functionality for converting claims to blockchain tokens

### Tribes System

The application features a tribes system for grouping related avatars:

- Displays all tribes with member counts
- Shows detailed tribe views with all members
- Groups avatars by shared emoji identifiers

### Action Log

The action log tracks avatar activities and interactions:

- Shows a chronological log of all avatar actions
- Displays detailed action information including results and locations
- Categorizes actions by type (attack, defend, move, etc.)

### Leaderboard

The leaderboard displays avatar rankings:

- Shows avatars ranked by score
- Displays tier information for each avatar
- Provides infinite scrolling for viewing more avatars
- Indicates claimed status for each avatar

### Social Feed

The social feed shows content posted by avatars:

- Displays posts with avatar information and timestamps
- Provides sorting options for viewing latest or top posts
- Links posts to avatar profiles

### X Authentication

The application includes integration with X (Twitter) platform:

- Connect avatars to X accounts
- Post to X using authenticated accounts
- Manage X connections with authorization flows

## Development Guidelines

### Commands

- **Start both server and client**: `npm start`
- **Dev mode (client only)**: `npm run dev`
- **Run server only**: `npm run serve`
- **Build wiki**: `npm run wiki`

### Style Guidelines

- **File naming**: Use `.mjs` extension for modules (ES module system)
- **Imports**: Named imports with curly braces, default imports without
- **Naming conventions**:
  - camelCase for variables, functions, methods
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
- **Functions**: Arrow functions for utilities, named functions for methods
- **Classes**: ES6 class syntax with constructor-based dependency injection
- **Error handling**: Try/catch blocks with informative messages, defensive checking
- **Async patterns**: Use async/await exclusively for asynchronous operations

### Component Usage

UI components follow a consistent pattern:

```javascript
// Component initialization
initializeComponent(options);

// Rendering pattern
renderComponent(data, options);
```

### Styling

The application uses Tailwind CSS for styling with consistent class patterns:

- **Layout**: Container classes for responsiveness
- **Components**: Styled using consistent Tailwind utility classes
- **Dark Mode**: Built with dark mode as the default theme

## Recent Refactor

The frontend codebase has recently undergone a significant refactoring to improve organization, maintainability, and code quality.

### Key Changes

1. **Modular Architecture**
   - Organized code into logical modules (core, components, services, tabs, utils)
   - Each module has clear responsibilities and well-defined interfaces
   - Implemented ES Modules for better code organization

2. **Code Improvements**
   - Added comprehensive JSDoc comments to all functions
   - Improved error handling throughout the codebase
   - Added type annotations for better code understanding
   - Created reusable components with clear interfaces

3. **State Management**
   - Implemented centralized state management
   - Added event-based system for updates
   - Improved reactivity for UI changes

4. **Tailwind CSS Integration**
   - Replaced CDN usage with proper CSS file inclusion
   - Commented on migration path to proper build process

### Benefits of Refactoring

1. **Improved Maintainability**
   - Easier to understand code organization
   - Clear separation of concerns
   - Better documentation

2. **Performance Improvements**
   - Proper code splitting
   - Reduced redundant code
   - Optimized imports

3. **Better Developer Experience**
   - Consistent naming conventions
   - Well-documented functions
   - Logical file structure

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in your browser

### API Integration

The frontend communicates with the backend API using RESTful endpoints:

- `/api/avatars`: Retrieves avatar information
- `/api/tribes`: Manages tribe-related functionality
- `/api/dungeon`: Interacts with dungeon actions and logs
- `/api/social`: Manages social content
- `/api/claims`: Handles avatar claiming functionality
- `/api/xauth`: Manages X platform authentication

## Next Steps

1. **Migrate to Full Build System**
   - Implement proper Tailwind CSS build process
   - Add bundling with tools like Webpack, Vite, or Parcel
   - Set up minification for production

2. **Testing Framework**
   - Add unit tests for components and utilities
   - Implement integration tests for key features

3. **Additional Documentation**
   - Component usage examples
   - API documentation
   - Development workflows

### Migration Notes

The refactoring maintained backwards compatibility wherever possible. Global functions and objects that were previously exposed on the window object are still available for backward compatibility, but new code should use the module system directly.