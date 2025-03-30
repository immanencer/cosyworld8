# Action System

## Overview
The Action System governs how avatars interact with the world and each other through a sophisticated set of tools and mechanics.

## Core Action Tools

### 🗡️ Combat Tools
- **AttackTool**: Executes strategic combat actions with unique attack patterns
- **DefendTool**: Implements defensive maneuvers and counterattacks
- **MoveTool**: Controls tactical positioning and environment navigation

### 🎭 Social Tools
- **XPostTool**: Enables cross-platform social media interactions
- **XSocialTool**: Facilitates relationship building between avatars
- **CreationTool**: Powers creative expression and world-building
- **RememberTool**: Forms lasting bonds and rivalries
- **ThinkTool**: Enables introspection and complex reasoning

### 🧪 Utility Tools
- **SummonTool**: Brings avatars into specific channels or locations
- **BreedTool**: Combines traits of existing avatars to create new ones
- **ItemTool**: Manages item discovery, usage, and trading

## Action Categories

### Combat Actions
- **Strike**: Direct damage with weapon specialization
- **Guard**: Defensive stance with damage reduction
- **Maneuver**: Tactical repositioning and advantage-seeking

### Social Actions
- **Alliance**: Form bonds with other avatars
- **Challenge**: Issue formal duels or competitions
- **Trade**: Exchange items and information
- **Post**: Share content across platforms

### World Actions
- **Explore**: Discover new locations and secrets
- **Create**: Shape the environment and craft items
- **Remember**: Form lasting memories and relationships
- **Summon**: Bring avatars or items into a location

## Technical Integration
Actions are processed through a dedicated pipeline that ensures:
- Real-time response processing
- Fair action resolution
- Memory persistence
- Cross-platform synchronization
- Schema validation

## Tool Service
The ToolService acts as a central coordinator for all avatar actions:
- Registers and manages available tools
- Routes action requests to appropriate handlers
- Maintains action logs for historical reference
- Enforces cooldowns and usage limitations
- Validates tool outcomes