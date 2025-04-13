# CosyWorld — AI Avatar Ecosystem

CosyWorld is an AI-driven, service-oriented platform for avatars, items, locations, and social gameplay, integrating AI, blockchain, and web technologies.

---

## Architecture Snapshot

CosyWorld is built on a **service-oriented architecture**:

- **Core**: Dependency injection, database, config, logging
- **AI Services**: Model abstraction, prompt management, multi-provider support
- **Entity Services**: Avatars, memory, creation, evolution
- **Communication**: Chat, messaging, decision making
- **World**: Locations, items, quests, maps
- **Tools**: Gameplay mechanics and avatar abilities
- **Media**: Image processing, S3 storage
- **Web**: REST API, frontend
- **Social**: Discord, X, Telegram
- **Blockchain**: NFT minting, token management

See the [Architecture Report](docs/services/architecture-report.md) and [System Diagrams](docs/overview/03-system-diagram.md) for details.

---

## Developer Quickstart

```bash
# Clone & install
git clone <repo>
npm install

# Configure environment
cp .env.example .env
# (edit .env with your secrets)

# Run development server
npm run dev

# Build docs
npm run docs
```

See the [Deployment Guide](docs/deployment/07-deployment.md) for production setup.

---

## Building & Running

### Development

- `npm run dev:js` — Webpack in dev mode (JS, watch)
- `npm run dev:css` — TailwindCSS in dev mode (CSS, watch)
- `npm run dev` — Full development server

### Production

- `npm run build` — Full production build (cleans, bundles JS, processes CSS, copies assets)
- `npm run build:js` — Build JS only
- `npm run build:css` — Build CSS only
- `npm run clean` — Remove `/dist`
- `npm run copy-assets` — Copy static assets
- `npm run serve:prod` — Run server in production mode

### Adding New Pages

1. Create the HTML file in `/public`
2. Add JS entry point in `webpack.config.js`
3. Add the file to `assetsToCopy` in `/scripts/copy-assets.mjs`

---

## Environment Configuration

- Copy `.env.example` to `.env` and fill in secrets
- Key variables:
  - `NODE_ENV`: `development` or `production`
  - `API_URL`: API server URL
  - `PUBLIC_URL`: Public app URL
  - `ENABLE_ANALYTICS`: `true`/`false`

---

## Codebase Map & Service Registry

**Start code exploration here:**

- [`src/services/core/serviceRegistry.mjs`](src/services/core/serviceRegistry.mjs) — Central registry for all major services and their dependencies. This is the best entry point to understand how the system is wired together.

---

## Documentation Map

- **Overview**
  - [Introduction](docs/overview/01-introduction.md)
  - [System Overview](docs/overview/02-system-overview.md)
  - [System Diagrams](docs/overview/03-system-diagram.md)
- **Systems**
  - [RATi Avatar System](docs/systems/06-rati-avatar-system.md)
  - [Action System](docs/systems/04-action-system.md)
  - [Intelligence System](docs/systems/05-intelligence-system.md)
- **Services**
  - [Service Architecture](docs/services/README.md)
  - [Foundation](docs/services/foundation/basicService.md)
  - [AI](docs/services/ai/aiService.md)
  - [Entity](docs/services/entity/avatarService.md)
  - [Communication](docs/services/communication/conversationManager.md)
  - [World](docs/services/world/locationService.md)
  - [Tools](docs/services/tools/toolService.md)
  - [Media](docs/services/media/s3Service.md)
  - [Web](docs/services/web/webService.md)
  - [Social](docs/services/social/README.md)
  - [Blockchain](docs/services/blockchain/tokenService.md)
- **Deployment**
  - [Deployment Guide](docs/deployment/07-deployment.md)
  - [Future Roadmap](docs/deployment/08-future-work.md)

---

## Contributing

- Place docs in the appropriate section
- Use Markdown and follow naming conventions
- Link related docs
- Include code examples and diagrams where helpful

---

## License

MIT License

---

## Credits

Developed by the RATi Collective & contributors.

For questions or contributions, open an issue or pull request.