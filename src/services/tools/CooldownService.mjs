// CooldownService.mjs
// Centralized cooldown management for tools and avatars

export class CooldownService {
  constructor() {
    // Map<toolName, Map<avatarId, lastUsedTimestamp>>
    this.cooldowns = new Map();
  }

  /**
   * Checks if a tool is on cooldown for a given avatar.
   * @param {string} toolName
   * @param {string|number} avatarId
   * @param {number} cooldownMs
   * @returns {number} Remaining cooldown in ms (0 if not on cooldown)
   */
  getRemainingCooldown(toolName, avatarId, cooldownMs) {
    const now = Date.now();
    const toolCooldowns = this.cooldowns.get(toolName);
    if (!toolCooldowns) return 0;
    const lastUsed = toolCooldowns.get(avatarId) || 0;
    const elapsed = now - lastUsed;
    return elapsed < cooldownMs ? cooldownMs - elapsed : 0;
  }

  /**
   * Updates the last used timestamp for a tool/avatar.
   * @param {string} toolName
   * @param {string|number} avatarId
   */
  setUsed(toolName, avatarId) {
    let toolCooldowns = this.cooldowns.get(toolName);
    if (!toolCooldowns) {
      toolCooldowns = new Map();
      this.cooldowns.set(toolName, toolCooldowns);
    }
    toolCooldowns.set(avatarId, Date.now());
  }
}
