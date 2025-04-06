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

---

# Content Moderation System

## Overview
This system performs structured, AI-assisted moderation of Discord messages, combining static rules, AI classification, user feedback, and adaptive learning.

---

## Moderation Triggers

### Static Regexes
- **URLs**: Hardcoded detection of links triggers moderation.
- Additional static patterns can be added manually.

### Dynamic Regex
- An AI-generated pattern, updated automatically based on recent high-risk messages.
- Refreshed every 5 minutes.
- Updated if >100 unreviewed high-risk messages accumulate.

---

## Threat Levels & Emoji Reactions
| Threat Level | Emoji  | Description                                    |
|--------------|--------|------------------------------------------------|
| low          | ✅     | Safe, no action needed                        |
| medium       | ⚠️     | Potentially risky, flagged for review         |
| high         | 🚨     | Dangerous or suspicious, urgent attention     |

---

## Moderation Replies
- For **medium** and **high** risk messages, the bot replies with:

```
-# {emoji} [reason]
```

Example:
```
-# 🚨 [Potential phishing link detected]
```

This provides transparent, consistent feedback.

---

## Risk Management Database
- **Stores** metadata of all high-risk messages.
- **Tags** high-risk messages using AI for future analysis.
- **Tracks** review status.
- **Counts** unreviewed high-risk messages to trigger regex updates.

---

## Adaptive Moderation
- When backlog exceeds 100 unreviewed high-risk messages:
  - The system samples recent messages.
  - An LLM generates a new regex pattern matching risky content.
  - This pattern becomes the new **dynamic regex**.

---

## User Feedback Integration
- If users react with 🚨, the message is escalated to **high** risk.
- This influences moderation decisions and future regex updates.

---

## Extensibility
- Add more static regexes for known threats.
- Adjust backlog thresholds.
- Enhance AI prompts or schemas.
- Integrate manual review workflows.

---

_Last updated: April 6, 2025_