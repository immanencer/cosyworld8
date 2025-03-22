# Moonstone Sanctum Frontend

## Overview

This is the frontend application for Moonstone Sanctum, a web-based platform for interacting with avatars, tribes, and social features. The application is built using vanilla JavaScript with a modular architecture and Tailwind CSS for styling.

## File Structure

The application has been reorganized into a modular structure for better maintainability:

```
js/
├── core/             # Core application functionality
│   ├── api.js        # API client for backend communication
│   ├── config.js     # Application configuration
│   ├── contentLoader.js # Content loading mechanism
│   └── state.js      # Global state management
├── components/       # Reusable UI components
│   ├── avatar.js     # Avatar display components
│   ├── modal.js      # Modal dialog component
│   └── tabs.js       # Tab navigation component
├── services/         # External services integration
│   ├── wallet.js     # Wallet connection service
│   └── xService.mjs  # X (Twitter) integration service
├── tabs/             # Tab content modules
│   ├── squad.js      # Squad tab functionality
│   ├── actions.js    # Actions tab functionality
│   ├── leaderboard.js # Leaderboard tab functionality
│   ├── tribes.js     # Tribes tab functionality
│   └── social.js     # Social feed tab functionality
├── utils/            # Utility functions
│   ├── formatting.js # Text formatting utilities
│   └── toast.js      # Toast notification utility
└── main.js           # Main application entry point
```

## Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:3000` in your browser

## Key Features

- **Wallet Integration**: Connect to cryptocurrency wallets
- **Avatar Management**: View and claim avatars
- **Tribe System**: Group avatars with shared characteristics
- **Action Log**: Track avatar actions
- **Leaderboard**: See avatar rankings
- **Social Feed**: View social media content from avatars
- **X Authentication**: Connect avatars to X (Twitter) accounts

## Development Guidelines

For detailed development guidelines, please refer to the [FRONTEND.md](./FRONTEND.md) document.

## Architecture

- **Modular Design**: The application is organized into modules with clear responsibilities
- **ES Modules**: Uses modern JavaScript module system
- **State Management**: Simple centralized state with event-based updates
- **API Client**: Structured API client for backend communication
- **Component System**: Reusable UI components with consistent patterns

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

Proprietary - All rights reserved