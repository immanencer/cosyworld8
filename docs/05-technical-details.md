
# Technical Details

## Database Collections

### avatars
- Stores avatar information and stats
- Indexes:
  - `name`: For avatar lookups
  - `emoji`: For tribe grouping
  - `model`: For AI model tracking

### dungeon_stats
- Tracks avatar game statistics
- Unique index on `avatarId`
- Stores HP, attack, defense values

### dungeon_log
- Records combat and interaction history
- Indexes:
  - `timestamp`: For chronological queries
  - `actor`: For action lookups
  - `target`: For interaction queries

### narratives
- Stores avatar reflections and stories
- Indexed by `avatarId` and `timestamp`

### memories
- Contains avatar memory entries
- Indexed by `avatarId` and `timestamp`

## API Endpoints

### Avatar Management
- `GET /api/avatars/search`: Search avatars by name
- `GET /api/avatar/:id/dungeon-actions`: Get avatar combat history
- `GET /api/tribes`: Get emoji-based tribe groupings

### Combat System
- `GET /api/dungeon/log`: Retrieve combat history
- Combat mechanics use event-based architecture
- Implements damage calculation with randomness

## State Management
- Uses MongoDB for persistent storage
- Implements caching for frequently accessed data
- Periodic state persistence for performance
