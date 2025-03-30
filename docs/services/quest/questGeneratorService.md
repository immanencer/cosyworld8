# Quest Generator Service

## Overview
The QuestGeneratorService is responsible for creating, managing, and tracking quests within the game world. It generates narrative-driven objectives and tracks progress toward their completion.

## Functionality
- **Quest Creation**: Generates themed quests with objectives and rewards
- **Progress Tracking**: Monitors and updates quest progress
- **Reward Distribution**: Handles rewards upon quest completion
- **Quest Adaptation**: Adjusts quests based on avatar actions and world state
- **Narrative Integration**: Ties quests to the overall story arcs

## Implementation
The QuestGeneratorService extends BasicService and uses AI to create contextually appropriate quests. It maintains quest state in the database and integrates with other services to track progress and distribute rewards.

```javascript
export class QuestGeneratorService extends BasicService {
  constructor(services) {
    super(services, [
      'databaseService',
      'aiService',
      'avatarService',
      'itemService',
      'locationService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `generateQuest(params)`
Creates a new quest based on provided parameters, using AI to fill in narrative details.

#### `assignQuest(questId, avatarId)`
Assigns a quest to an avatar, initializing progress tracking.

#### `updateQuestProgress(questId, progress)`
Updates the completion status of a quest's objectives.

#### `completeQuest(questId, avatarId)`
Marks a quest as completed and distributes rewards.

#### `getAvailableQuests(locationId)`
Retrieves quests available in a specific location.

#### `getAvatarQuests(avatarId)`
Fetches all quests assigned to a specific avatar.

## Quest Structure
Quests follow a standardized schema:
- `title`: The name of the quest
- `description`: Narrative overview of the quest
- `objectives`: List of specific goals to complete
- `rewards`: What's earned upon completion
- `difficulty`: Relative challenge level
- `location`: Where the quest is available
- `prerequisites`: Conditions required before the quest becomes available
- `timeLimit`: Optional time constraint
- `status`: Current state (available, active, completed, failed)

## Quest Types
The service supports various quest categories:
- **Main Quests**: Core story progression
- **Side Quests**: Optional narrative branches
- **Daily Quests**: Regular repeatable objectives
- **Dynamic Quests**: Generated based on world state
- **Avatar-Specific Quests**: Personal narrative development

## Dependencies
- DatabaseService: For persistence of quest data
- AIService: For generating quest narratives
- AvatarService: For avatar information and reward distribution
- ItemService: For quest items and rewards
- LocationService: For spatial context of quests