# Location Service

## Overview
The LocationService manages the spatial aspects of the system, including physical locations (channels/threads), their descriptions, and avatar positioning. It provides a geographical context for all interactions within the system.

## Functionality
- **Location Management**: Creates, updates, and tracks locations in the virtual world
- **Avatar Positioning**: Tracks which avatars are in which locations
- **Location Description**: Maintains rich descriptions of each location
- **Location Discovery**: Allows finding locations by various criteria
- **Location Relationships**: Manages parent/child relationships between locations

## Implementation
The LocationService extends BasicService and uses the database to persist location information. It maps Discord channels and threads to in-game locations with descriptions, images, and other metadata.

```javascript
export class LocationService extends BasicService {
  constructor(services) {
    super(services, [
      'databaseService',
      'discordService',
      'aiService',
      'configService',
    ]);
    
    this.db = this.databaseService.getDatabase();
    this.client = this.discordService.client;
    
    // Additional initialization...
  }
  
  // Methods...
}
```

### Key Methods

#### `createLocation(channelId, name, description, imageUrl)`
Creates a new location record associated with a Discord channel or thread.

#### `updateLocation(locationId, updateData)`
Updates an existing location with new information such as name, description, or image.

#### `getLocationById(locationId)`
Retrieves location information by its database ID.

#### `getLocationByChannelId(channelId)`
Finds a location based on its associated Discord channel ID.

#### `getLocationDescription(channelId, channelName)`
Generates a formatted description of a location for use in prompts.

#### `getLocationAndAvatars(channelId)`
Retrieves both the location details and a list of avatars currently in that location.

#### `moveAvatarToLocation(avatarId, locationId, temporary = false)`
Moves an avatar to a new location, updating relevant tracking information.

## Location Schema
Locations follow a standardized schema:
- `name`: Human-readable location name
- `description`: Detailed atmospheric description
- `imageUrl`: Visual representation URL
- `channelId`: Associated Discord channel/thread ID
- `type`: "channel" or "thread"
- `parentId`: Parent location (for threads or nested locations)
- `createdAt` and `updatedAt`: Timestamps
- `version`: Schema version for compatibility

## Integration with Discord
The service maintains a bidirectional mapping between in-game locations and Discord channels/threads:
- Discord channels provide the communication infrastructure
- LocationService adds game context, descriptions, and management

## Dependencies
- DatabaseService: For persistence of location data
- DiscordService: For channel interaction and management
- AIService: For generating location descriptions
- ConfigService: For location-related configuration settings