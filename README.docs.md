# CosyWorld Documentation Guide

## Documentation Structure

The CosyWorld documentation is organized into a hierarchical structure:

```
docs/
├── index.md                  # Main documentation landing page
├── README.md                 # This guide
├── overview/                 # System introduction and overviews
│   ├── 01-introduction.md
│   ├── 02-system-overview.md
│   └── 03-system-diagram.md
├── systems/                  # Major subsystem documentation
│   ├── 04-action-system.md
│   ├── 05-intelligence-system.md
│   └── 06-dungeon-system.md
├── services/                 # Detailed service documentation
│   ├── README.md             # Services overview
│   ├── architecture-report.md# Analysis and recommendations
│   ├── core/                 # Core services 
│   ├── chat/                 # Chat-related services
│   ├── tools/                # Tool-related services
│   ├── location/             # Location-related services
│   ├── item/                 # Item-related services
│   ├── quest/                # Quest-related services
│   ├── s3/                   # Storage services
│   └── web/                  # Web services
└── deployment/               # Deployment documentation
    ├── 07-deployment.md
    └── 08-future-work.md
```

## Contributing to Documentation

When adding or updating documentation:

1. Place the documentation in the appropriate section
2. Follow the existing naming conventions
3. Use Markdown for all documentation files
4. Link related documentation sections together
5. Include code examples where appropriate

## Building Documentation

The documentation can be built into a searchable HTML site using the provided build script:

```bash
# Install dependencies 
npm install

# Build the documentation
npm run docs
```

This will create a `docs/build` directory containing HTML files that can be served from any web server.

## Style Guide

When writing documentation:

- Use clear, concise language
- Include examples and code snippets
- Structure with headings and subheadings
- Use proper Markdown formatting
- Keep code examples up-to-date with the codebase
- Add diagrams where they improve understanding

## Documentation Tooling

The documentation uses:

- **Markdown**: For content authoring
- **markdown-it**: For HTML conversion
- **Custom script**: For building the static site