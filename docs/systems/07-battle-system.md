# Battle System

## Architecture Overview (as of April 12, 2025)

- **BattleService**: Centralizes all combat mechanics (attack, defend, knockout, etc.). All battle logic is implemented here, making it easy to maintain and extend.
- **DiceService**: Provides secure, fair dice rolling using Node.js crypto for all randomness in combat and stat generation.
- **StatService**: Handles immutable base stats and modifier/counter logic (e.g., damage, buffs, debuffs).
- **Tools (AttackTool, DefendTool, etc.)**: Only handle command parsing and messaging. They delegate all combat resolution to BattleService.

### Example Flow
- When an attack command is issued, `AttackTool` calls `battleService.attack(...)`.
- `BattleService` performs all dice rolls, stat lookups, damage application, and knockout logic.
- Dice rolls use `DiceService` for unbiased, secure results.
- Damage and healing are tracked as counters (modifiers) and never mutate base stats.

---

## Stat Modifiers & Damage Counters

CosyWorld uses an immutable stat system for all battle actions. Base stats (like `hp`, `strength`, etc.) are never changed after creation. Instead, all effects (damage, healing, buffs, debuffs) are tracked as **modifiers** (counters) in a separate collection.

### How It Works
- **Attacks**: Add `damage` counters (modifiers with positive integer value) to the target avatar.
- **Healing**: Removes damage counters by adding a negative `damage` modifier (e.g., healing 3 HP = `createModifier('damage', -3, ...)`).
- **Current HP**: Calculated as `currentHp = baseHp - totalDamageCounters`.
- **Buffs/Debuffs**: Use other stat modifiers (e.g., `createModifier('strength', +2, ...)`).
- **All modifiers are whole numbers.**

### Example: Attack
```js
// Deal 5 damage to defender
await statService.createModifier('damage', 5, { avatarId: defender._id });
// Get current HP
const totalDamage = await statService.getTotalModifier(defender._id, 'damage');
const currentHp = baseHp - totalDamage;
```

### Example: Healing
```js
// Heal 3 HP (removes 3 damage counters)
await statService.createModifier('damage', -3, { avatarId });
```

### Knockout & Death
- When `currentHp <= 0`, the avatar is knocked out or loses a life.
- On knockout, all damage counters are removed (full heal), and stats may be reset.
- If lives reach 0, the avatar's status is set to `dead`.

### Why This System?
- **Immutability**: Base stats are never overwritten, making the system auditable and safe.
- **Flexibility**: Any stat can be modified, and temporary effects (with duration) are easy to implement.
- **Transparency**: All changes are tracked as discrete events (modifiers/counters).

---

_Last updated: April 12, 2025_
