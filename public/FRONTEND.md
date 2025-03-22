# Moonstone Sanctum Frontend Architecture

## Overview

Moonstone Sanctum is a web application that provides an interface to interact with avatars, tribes, and social features. The frontend is built using vanilla JavaScript with a modular architecture and Tailwind CSS for styling.

## Project Structure

```
public/
├── admin/               # Admin panel pages
├── assets/              # Static assets (images, fonts, etc.)
├── css/                 # CSS stylesheets
│   ├── tailwind.css     # Tailwind configuration
│   └── tribe-styles.css # Tribe-specific styles
├── js/                  # JavaScript files
│   ├── core/            # Core application functionality
│   │   ├── config.js    # Application configuration
│   │   ├── api.js       # API interaction utilities
│   │   ├── state.js     # Global state management
│   │   └── auth.js      # Authentication utilities
│   ├── components/      # Reusable UI components
│   │   ├── avatar.js    # Avatar-related components
│   │   ├── modal.js     # Modal dialogs
│   │   └── toast.js     # Toast notifications
│   ├── services/        # Service modules
│   │   ├── wallet.js    # Wallet connection service
│   │   └── xService.mjs # X (Twitter) integration service
│   ├── tabs/            # Tab content modules
│   │   ├── squad.js     # Squad tab functionality
│   │   ├── actions.js   # Actions tab functionality
│   │   ├── leaderboard.js # Leaderboard tab functionality
│   │   ├── tribes.js    # Tribes tab functionality
│   │   └── social.js    # Social feed tab functionality
│   ├── utils/           # Utility functions
│   │   ├── toast.js     # Toast notification utility
│   │   ├── formatting.js # Text formatting utilities
│   │   └── validators.js # Input validation utilities
│   └── main.js          # Main application entry point
├── index.html           # Main application HTML
└── api-docs.html        # API documentation page
```

## Core Concepts

### Modular Architecture

The application follows a modular architecture to ensure clean separation of concerns:

- **Core**: Contains foundational functionality like configuration, state management, and API utilities
- **Components**: Reusable UI elements that can be composed to build interfaces
- **Services**: Handles external integrations like wallet connections and social media
- **Tabs**: Implements the content for each application tab
- **Utils**: Provides shared utility functions

### State Management

The application uses a simple centralized state object to manage application state:

```javascript
// Example state structure
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

### Component Usage

UI components follow a consistent pattern:

```javascript
// Component initialization
initializeComponent(options);

// Rendering pattern
renderComponent(data, options);
```

## Key JavaScript Files

- **main.js**: Application entry point that initializes core functionality
- **wallet.js**: Handles wallet connection and authentication
- **tabs.js**: Manages tab switching functionality
- **contentLoader.js**: Loads content based on active tab
- **avatarDetails.js**: Renders avatar information and details
- **xService.mjs**: Integrates with X (Twitter) platform

## Styling

The application uses Tailwind CSS for styling with consistent class patterns:

- **Layout**: Container classes for responsiveness
- **Components**: Styled using consistent Tailwind utility classes
- **Dark Mode**: Built with dark mode as the default theme

## Getting Started for Developers

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in your browser

## API Integration

The frontend communicates with the backend API using RESTful endpoints:

- `/api/avatars`: Retrieves avatar information
- `/api/tribes`: Manages tribe-related functionality
- `/api/dungeon`: Interacts with dungeon actions and logs
- `/api/social`: Manages social content
- `/api/claims`: Handles avatar claiming functionality
- `/api/xauth`: Manages X platform authentication