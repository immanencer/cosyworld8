# CosyWorld Frontend

A modular web app to interact with AI avatars, tribes, social feeds, and blockchain assets.

---

## Highlights

- **Wallet Integration** (Phantom, Solana)
- **Avatar Claiming & Management**
- **Tribes & Leaderboards**
- **Action Log & Social Feed**
- **X (Twitter) Integration**
- **Modular Vanilla JS + Tailwind CSS**

---

## Quickstart

```bash
git clone <repo>
npm install
npm run dev
# Open http://localhost:3000
```

---

## Architecture

- **Modular ES Modules**
- **Centralized State** with event-based updates
- **Reusable Components**
- **API Client** for backend REST endpoints
- **Tabs**: Squad, Actions, Leaderboard, Tribes, Social

---

## File Structure

```
public/
├── css/ (Tailwind, tribe styles)
├── js/
│   ├── core/ (config, api, state)
│   ├── components/ (avatar, modal, tabs)
│   ├── services/ (wallet, X integration)
│   ├── tabs/ (squad, actions, leaderboard, tribes, social)
│   ├── utils/ (formatting, toast)
│   └── main.js
├── index.html
└── README.md
```

---

## Development

- **Start dev server**: `npm run dev`
- **Build docs/wiki**: `npm run wiki`
- **Style**: Tailwind CSS, dark mode default
- **Code style**: ES modules, camelCase, async/await, arrow functions for utilities

---

## API Endpoints

- `/api/avatars` — Avatar data
- `/api/tribes` — Tribes info
- `/api/dungeon` — Dungeon actions
- `/api/social` — Social feed
- `/api/claims` — Avatar claiming
- `/api/xauth` — X platform auth

---

## Next Steps

- Migrate to full build system (Tailwind, bundling, minification)
- Add unit & integration tests
- Expand component & API docs

---

## Notes

- Refactored for modularity, maintainability, and performance
- Backwards compatibility maintained via global functions (legacy)