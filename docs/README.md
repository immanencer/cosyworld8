# CosyWorld Documentation

This directory contains comprehensive documentation for the CosyWorld system.

## Organization

The documentation is organized into the following sections:

- **Overview**: General introduction and system architecture
  - [Introduction](overview/01-introduction.md)
  - [System Overview](overview/02-system-overview.md)
  - [System Diagram](overview/03-system-diagram.md)

- **Systems**: Detailed information about specific subsystems
  - [Action System](systems/04-action-system.md)
  - [Intelligence System](systems/05-intelligence-system.md)
  - [Dungeon System](systems/06-dungeon-system.md)

- **Services**: Documentation for individual services
  - [Services Overview](services/README.md)
  - [Architecture Report](services/architecture-report.md)
  - Core Services (BasicService, DatabaseService, etc.)
  - Domain Services (Chat, Location, Item, etc.)
  - Integration Services (Web, S3, etc.)

- **Deployment**: Information about deployment and operations
  - [Deployment Guide](deployment/07-deployment.md)
  - [Future Work](deployment/08-future-work.md)

## Building the Documentation

You can build a HTML version of this documentation by running:

```bash
npm run docs
```

This will generate HTML files in the `docs/build` directory.