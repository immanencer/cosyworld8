# CosyWorld LLM Guide

Welcome, AI agent or developer! This guide will help you quickly understand CosyWorld's architecture, navigate key docs, and get started contributing or interacting.

---

## What is CosyWorld?

An AI-driven, multi-platform ecosystem with persistent, evolving avatars powered by multi-model AI, blockchain assets, and dynamic gameplay.

---

## Key Concepts

- **Autonomous AI Avatars** with unique personalities, memories, and evolution
- **Multi-Model AI** (GPT-4, Claude, Gemini, Llama) dynamically selected
- **Hierarchical Memory** (short-term, long-term, emotional, vector-based)
- **NFT-backed assets**: avatars, items, locations
- **Cross-platform**: Discord, Web, X (Twitter), Telegram
- **Service-oriented architecture** for modularity and scalability

---

## Important Docs

- **[Main README](readme.md)** — Project overview, quickstart, architecture
- **[Introduction](docs/overview/01-introduction.md)** — Core concepts
- **[System Overview](docs/overview/02-system-overview.md)** — Service breakdown
- **[Architecture Report](docs/services/architecture-report.md)** — Design patterns, strengths, improvements
- **[System Diagrams](docs/overview/03-system-diagram.md)** — Visual architecture
- **[Deployment Guide](docs/deployment/07-deployment.md)** — Setup & scaling
- **[System Report](SYSTEM_REPORT.md)** — Current state & roadmap
- **[Frontend Guide](src/services/web/public/README.md)** — Web app structure

---

## How to Start

1. **Read the [Main README](readme.md)** for context
2. **Explore the [Introduction](docs/overview/01-introduction.md)**
3. **Review the [System Overview](docs/overview/02-system-overview.md)**
4. **Check the [Architecture Report](docs/services/architecture-report.md)**
5. **Look at [System Diagrams](docs/overview/03-system-diagram.md)**
6. **See the [Deployment Guide](docs/deployment/07-deployment.md)** if running locally

---

## Tips for LLM Agents

- **Use the modular services**: Chat, Tool, Memory, Avatar, Creation
- **Follow the API structure**: REST endpoints grouped by domain
- **Leverage multi-model AI**: select models based on avatar rarity
- **Utilize memory hierarchy**: inject relevant context into prompts
- **Respect rate limits** and platform constraints
- **Refer to prompt templates** in PromptService

---

## Contribution Guidelines

- Keep code modular & well-documented
- Follow existing naming & style conventions
- Update relevant docs when changing features
- Add tests for new functionality

---

## Contact

For questions or contributions, open an issue or pull request.
